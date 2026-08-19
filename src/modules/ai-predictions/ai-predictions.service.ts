import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Item, ItemDocument } from '../inventory/schemas/item.schema';
import { Sale, SaleDocument } from '../sales/schemas/sale.schema';
import { Customer, CustomerDocument } from '../customers/schemas/customer.schema';
import { Ledger, LedgerDocument } from '../customers/schemas/ledger.schema';

/**
 * Gemini Flash AI Prediction Service
 * গুগল জেমিনি ফ্ল্যাশ এপিআই ব্যবহার করে পণ্য চাহিদা পূর্বাভাস, কাস্টমার ক্রেডিট স্কোর ও বিজনেজ পরামর্শ জেনারেট করার সার্ভিস।
 */
@Injectable()
export class AiPredictionsService {
  constructor(
    private readonly configService: ConfigService,
    @InjectModel(Item.name) private itemModel: Model<ItemDocument>,
    @InjectModel(Sale.name) private saleModel: Model<SaleDocument>,
    @InjectModel(Customer.name) private customerModel: Model<CustomerDocument>,
    @InjectModel(Ledger.name) private ledgerModel: Model<LedgerDocument>,
  ) {}

  /**
   * Helper: Call Gemini Flash API securely using GEMINI_API_KEY from .env
   */
  private async callGeminiFlash(prompt: string, systemInstruction?: string): Promise<any> {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    if (!apiKey || apiKey.trim() === '' || apiKey.includes('your_gemini_api_key')) {
      return null; // Fallback to heuristic calculation
    }

    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
      const payload: any = {
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          response_mime_type: 'application/json',
          temperature: 0.2,
        },
      };

      if (systemInstruction) {
        payload.systemInstruction = {
          parts: [{ text: systemInstruction }],
        };
      }

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        console.warn(`[Gemini API] Request failed with status ${response.status}`);
        return null;
      }

      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) {
        return JSON.parse(text);
      }
      return null;
    } catch (err: any) {
      console.warn('[Gemini API] Error calling Gemini Flash API:', err?.message || err);
      return null;
    }
  }

  /**
   * 1. AI Product Demand & Sales Forecasting
   * সিস্টেমের বেচাকেনা ও স্টকের তথ্যের ওপর ভিত্তি করে ডিমান্ড পূর্বাভাস ও ডেড স্টক রিস্ক তৈরি।
   */
  async predictProductDemand(user: any) {
    const shopId = user.shopId;
    const [items, sales] = await Promise.all([
      this.itemModel.find({ shopId, isDeleted: { $ne: true } }).exec(),
      this.saleModel.find({ shopId, isDeleted: { $ne: true } }).sort({ date: -1 }).limit(100).exec(),
    ]);

    const itemSalesSummary: Record<string, { name: string; category: string; stock: number; soldQty: number; revenue: number }> = {};

    for (const item of items) {
      itemSalesSummary[item._id.toString()] = {
        name: item.name,
        category: item.category,
        stock: item.stockQuantity,
        soldQty: 0,
        revenue: 0,
      };
    }

    for (const s of sales) {
      for (const itemDetail of s.items) {
        if (itemSalesSummary[itemDetail.itemId]) {
          itemSalesSummary[itemDetail.itemId].soldQty += itemDetail.quantity;
          itemSalesSummary[itemDetail.itemId].revenue += itemDetail.totalPrice;
        }
      }
    }

    const itemsDataList = Object.values(itemSalesSummary);

    const systemPrompt = `You are an expert AI Inventory & Retail Supply Chain Forecasting Assistant.
Analyze the provided product catalog and recent sales metrics for a shop.
Return your prediction as a strictly valid JSON object with this structure:
{
  "topTrendingProducts": [
    {"name": "Product Name", "reason": "Reason why it will sell fast", "forecastedDemand": "HIGH"}
  ],
  "slowMovingRiskProducts": [
    {"name": "Product Name", "reason": "Reason for dead stock risk", "riskLevel": "MEDIUM"}
  ],
  "aiReorderAdvice": "Strategic advice for inventory restocking"
}`;

    const userPrompt = `Product Sales Data: ${JSON.stringify(itemsDataList)}`;

    const aiResult = await this.callGeminiFlash(userPrompt, systemPrompt);

    if (aiResult && aiResult.topTrendingProducts) {
      return {
        isAiPowered: true,
        modelUsed: 'gemini-2.5-flash',
        forecast: aiResult,
      };
    }

    // Heuristic Fallback
    const sortedBySales = [...itemsDataList].sort((a, b) => b.soldQty - a.soldQty);
    const topTrending = sortedBySales.slice(0, 3).map(i => ({
      name: i.name,
      reason: `High sales velocity (${i.soldQty} units sold recently)`,
      forecastedDemand: 'HIGH',
    }));

    const slowMoving = sortedBySales.filter(i => i.soldQty === 0).slice(0, 3).map(i => ({
      name: i.name,
      reason: `Zero items sold in recent sales transactions (${i.stock} in stock)`,
      riskLevel: 'HIGH',
    }));

    return {
      isAiPowered: false,
      modelUsed: 'rule-based-heuristic-fallback',
      forecast: {
        topTrendingProducts: topTrending,
        slowMovingRiskProducts: slowMoving,
        aiReorderAdvice: 'Reorder top-selling items to prevent stockouts and offer discounts on slow-moving inventory.',
      },
    };
  }

  /**
   * 2. AI Customer Reliability & Credit Risk Scoring
   * কাস্টমারের বাকি পরিশোধের হিস্ট্রি ও লেজার খাতা এনালাইসিস করে ১-১০০ ক্রেডিট স্কোর নির্ধারণ।
   */
  async predictCustomerCreditScore(customerId: string, user: any) {
    const shopId = user.shopId;
    const customer = await this.customerModel.findOne({ _id: customerId, shopId, isDeleted: { $ne: true } });
    if (!customer) throw new NotFoundException('Customer record not found');

    const ledger = await this.ledgerModel.find({ customerId, shopId, isDeleted: { $ne: true } }).sort({ date: -1 }).limit(20).exec();

    const customerSummary = {
      name: customer.name,
      openingBalance: customer.openingBalance,
      closingBalance: customer.closingBalance,
      currentDue: customer.closingBalance < 0 ? Math.abs(customer.closingBalance) : 0,
      advanceCredit: customer.closingBalance > 0 ? customer.closingBalance : 0,
      totalLedgerEntries: ledger.length,
      recentTransactions: ledger.map(l => ({
        type: l.type,
        amount: l.amount,
        date: l.date,
        description: l.description,
      })),
    };

    const systemPrompt = `You are an AI Retail Credit Risk & Reliability Assessment Analyst.
Analyze the customer's financial ledger, payment promptness, and current due balance.
Return your prediction as a strictly valid JSON object with this structure:
{
  "reliabilityScore": 85,
  "creditRiskLevel": "LOW_RISK",
  "maxRecommendedDueLimit": 5000,
  "aiSummary": "Summary explanation of the customer's trustworthiness in Bengali or English."
}
Rules:
- reliabilityScore must be integer between 1 and 100.
- creditRiskLevel must be one of "LOW_RISK", "MEDIUM_RISK", "HIGH_RISK".`;

    const userPrompt = `Customer Ledger Summary: ${JSON.stringify(customerSummary)}`;

    const aiResult = await this.callGeminiFlash(userPrompt, systemPrompt);

    if (aiResult && typeof aiResult.reliabilityScore === 'number') {
      return {
        customerId: customer._id.toString(),
        customerName: customer.name,
        isAiPowered: true,
        modelUsed: 'gemini-2.5-flash',
        assessment: aiResult,
      };
    }

    // Heuristic Fallback
    const due = customerSummary.currentDue;
    let score = 90;
    let risk = 'LOW_RISK';
    let maxLimit = 10000;

    if (due > 5000) {
      score = 45;
      risk = 'HIGH_RISK';
      maxLimit = 2000;
    } else if (due > 1000) {
      score = 70;
      risk = 'MEDIUM_RISK';
      maxLimit = 5000;
    }

    return {
      customerId: customer._id.toString(),
      customerName: customer.name,
      isAiPowered: false,
      modelUsed: 'rule-based-heuristic-fallback',
      assessment: {
        reliabilityScore: score,
        creditRiskLevel: risk,
        maxRecommendedDueLimit: maxLimit,
        aiSummary: `Customer ${customer.name} has a current due balance of ${due} BDT. Payment history shows ${risk.toLowerCase()} credit risk.`,
      },
    };
  }

  /**
   * 3. AI Shop Growth & Strategy Advisor
   * শপের ওভারঅল সেলস রেভিনিউ, প্রফিট মার্জিন ও স্টক টার্নওভার এনালাইসিস করে ৩টি পরামর্শ তৈরি।
   */
  async getAiBusinessAdvice(user: any) {
    const shopId = user.shopId;
    const [sales, items, customers] = await Promise.all([
      this.saleModel.find({ shopId, isDeleted: { $ne: true } }).exec(),
      this.itemModel.find({ shopId, isDeleted: { $ne: true } }).exec(),
      this.customerModel.find({ shopId, isDeleted: { $ne: true } }).exec(),
    ]);

    let totalRevenue = 0;
    sales.forEach(s => totalRevenue += s.grandTotal);

    let totalDue = 0;
    customers.forEach(c => {
      if (c.closingBalance < 0) totalDue += Math.abs(c.closingBalance);
    });

    const shopMetrics = {
      totalSalesRevenue: totalRevenue,
      totalInvoices: sales.length,
      totalItemsCount: items.length,
      totalCustomersCount: customers.length,
      totalCustomerDue: totalDue,
      subscriptionTier: user.subscriptionTier,
    };

    const systemPrompt = `You are a Senior Retail POS & Small Business Growth Strategist AI.
Analyze the shop's operational and financial health parameters.
Return your actionable advice as a strictly valid JSON object with this structure:
{
  "healthGrade": "A",
  "growthOpportunities": [
    "Opportunity 1",
    "Opportunity 2",
    "Opportunity 3"
  ],
  "actionableTips": [
    "Tip 1 to implement this week",
    "Tip 2 to improve cash flow"
  ]
}
Rules:
- healthGrade must be one of "A+", "A", "B", "C", "D".`;

    const userPrompt = `Shop Metrics: ${JSON.stringify(shopMetrics)}`;

    const aiResult = await this.callGeminiFlash(userPrompt, systemPrompt);

    if (aiResult && aiResult.healthGrade) {
      return {
        isAiPowered: true,
        modelUsed: 'gemini-2.5-flash',
        advice: aiResult,
      };
    }

    // Heuristic Fallback
    return {
      isAiPowered: false,
      modelUsed: 'rule-based-heuristic-fallback',
      advice: {
        healthGrade: totalRevenue > 50000 ? 'A' : 'B',
        growthOpportunities: [
          'Collect outstanding customer due balances to boost working cash flow.',
          'Focus marketing efforts on top-selling inventory categories.',
          'Upgrade subscription tier if near inventory or manager account limits.',
        ],
        actionableTips: [
          'Send automated WhatsApp due reminders to customers with high due balances.',
          'Review low-stock reorder suggestions weekly.',
        ],
      },
    };
  }
}
