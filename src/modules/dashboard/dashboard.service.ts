import { Injectable, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Sale, SaleDocument } from '../sales/schemas/sale.schema';
import { Item, ItemDocument } from '../inventory/schemas/item.schema';
import { Customer, CustomerDocument } from '../customers/schemas/customer.schema';
import { User, UserDocument } from '../auth/schemas/user.schema';
import { SubscriptionPayment, SubscriptionPaymentSchema } from '../subscriptions/schemas/subscription-payment.schema';

import { Expense, ExpenseDocument } from '../expenses/schemas/expense.schema';

/**
 * Dashboard & Business Analytics Service
 * শপ ওভারভিউ KPIs, বিক্রয় রিপোর্ট এবং সুপার অ্যাডমিন প্ল্যাটফর্ম মেট্রিক্স হিসাব করার সার্ভিস।
 */
@Injectable()
export class DashboardService {
  constructor(
    @InjectModel(Sale.name) private saleModel: Model<SaleDocument>,
    @InjectModel(Item.name) private itemModel: Model<ItemDocument>,
    @InjectModel(Customer.name) private customerModel: Model<CustomerDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(SubscriptionPayment.name) private subscriptionPaymentModel: Model<SubscriptionPayment>,
    @InjectModel(Expense.name) private expenseModel: Model<ExpenseDocument>,
  ) {}

  /**
   * 1. Get Shop Dashboard Overview KPIs
   * শপের মোট বিক্রি, ক্যাশ কালেকশন, মোট বাকি, নিট লাভ, স্টক অ্যালার্ট ও কাস্টমার বাকির সামারি।
   */
  async getDashboardStats(user: any) {
    const shopId = user.shopId;

    // শুধুমাত্র নিজস্ব শপের এক্টিভ (isDeleted: false) ডাটা আনা হচ্ছে
    const [sales, items, customers, expenses] = await Promise.all([
      this.saleModel.find({ shopId, isDeleted: { $ne: true } }).exec(),
      this.itemModel.find({ shopId, isDeleted: { $ne: true } }).exec(),
      this.customerModel.find({ shopId, isDeleted: { $ne: true } }).exec(),
      this.expenseModel.find({ shopId, isDeleted: { $ne: true } }).exec(),
    ]);

    let totalSalesRevenue = 0;
    let totalPaidCollected = 0;
    let totalDue = 0;
    let totalExpenses = 0;

    expenses.forEach(e => totalExpenses += e.amount);

    // মোট বিক্রি, ক্যাশ জমা ও বকেয়া হিসাব
    for (const s of sales) {
      totalSalesRevenue += s.grandTotal;
      totalPaidCollected += s.paidAmount;
      totalDue += s.dueAmount;
    }

    // নিট লাভ (Profit) হিসাব - (Gross Profit - Operating Expenses)
    let netProfit = 0;
    const canViewBuy = user.role === 'admin' || user.role === 'superadmin' || user.permissions?.canViewBuyPrice;
    
    if (canViewBuy) {
      const itemsMap = new Map<string, number>();
      items.forEach(i => itemsMap.set(i._id.toString(), i.buyPrice));

      let grossProfit = 0;
      for (const s of sales) {
        for (const itemDetail of s.items) {
          const buyPrice = itemsMap.get(itemDetail.itemId) || 0;
          const cost = buyPrice * itemDetail.quantity;
          const profit = itemDetail.totalPrice - cost;
          grossProfit += profit;
        }
      }
      netProfit = grossProfit - totalExpenses;
    }

    // কম স্টক সম্পন্ন প্রোডাক্টের সংখ্যা হিসাব (Low Stock Alerts)
    const lowStockItems = items.filter(i => i.stockQuantity <= i.lowStockThreshold);

    // সকল কাস্টমারের মোট বাকি পরিমাণ হিসাব (ক্লোজিং ব্যালেন্স নেগেটিভ হওয়া মানে বাকি)
    let totalCustomerDue = 0;
    customers.forEach(c => {
      if (c.closingBalance < 0) {
        totalCustomerDue += Math.abs(c.closingBalance);
      }
    });

    return {
      totalSalesRevenue: totalSalesRevenue.toString(),
      totalPaidCollected: totalPaidCollected.toString(),
      totalDueAmount: totalDue.toString(),
      totalExpenses: totalExpenses.toString(),
      netProfit: canViewBuy ? netProfit.toString() : 'N/A',
      totalItemsCount: items.length,
      lowStockCount: lowStockItems.length,
      totalCustomersCount: customers.length,
      totalCustomerDue: totalCustomerDue.toString(),
      totalInvoicesCount: sales.length,
    };
  }

  /**
   * 2. Get Filtered Sales Report
   * তারিখ অনুযায়ী (Date Range Filter), ক্যাশিয়ার আইডি এবং পেজিনেশন দিয়ে ফিল্টারকৃত বিস্তারিত বিক্রয় রিপোর্ট।
   */
  async getSalesReport(user: any, startDate?: string, endDate?: string, cashierId?: string, pageParam: number = 1, limitParam: number = 10) {
    const page = Math.max(1, Number(pageParam) || 1);
    const limit = Math.max(1, Math.min(100, Number(limitParam) || 10));
    const skip = (page - 1) * limit;

    const query: any = { shopId: user.shopId, isDeleted: { $ne: true } };
    if (cashierId) query.createdBy = cashierId;

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.date.$lte = end;
      }
    }

    const sales = await this.saleModel.find(query).sort({ date: -1 }).exec();

    let totalRevenue = 0;
    let totalDiscount = 0;
    let totalItemsSold = 0;

    const itemsSummary = new Map<string, { name: string; quantity: number; revenue: number }>();

    for (const s of sales) {
      totalRevenue += s.grandTotal;
      totalDiscount += s.discount;

      for (const item of s.items) {
        totalItemsSold += item.quantity;
        const existing = itemsSummary.get(item.itemId) || { name: item.name, quantity: 0, revenue: 0 };
        existing.quantity += item.quantity;
        existing.revenue += item.totalPrice;
        itemsSummary.set(item.itemId, existing);
      }
    }

    const totalInvoices = sales.length;
    const paginatedSales = sales.slice(skip, skip + limit);
    const totalPages = Math.ceil(totalInvoices / limit) || 1;

    return {
      totalRevenue: totalRevenue.toString(),
      totalDiscount: totalDiscount.toString(),
      totalInvoices,
      totalItemsSold,
      // সর্বোচ্চ বিক্রীত সেরা ১০টি প্রোডাক্ট (Top 10 Selling Products)
      topSellingItems: Array.from(itemsSummary.values())
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, 10)
        .map(i => ({ ...i, revenue: i.revenue.toString() })),
      salesList: {
        data: paginatedSales.map(s => ({
          id: s._id.toString(),
          invoiceNumber: s.invoiceNumber,
          customerName: s.customerName,
          grandTotal: s.grandTotal.toString(),
          paidAmount: s.paidAmount.toString(),
          paymentStatus: s.paymentStatus,
          date: s.date,
          createdByName: s.createdByName,
        })),
        meta: {
          total: totalInvoices,
          page,
          limit,
          totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      },
    };
  }

  /**
   * 3. Platform Overview Metrics for SuperAdmin
   * পুরো প্ল্যাটফর্মের মোট শপ সংখ্যা, ম্যানেজার সংখ্যা, সাবস্ক্রিপশন আয় ও পেন্ডিং পেমেন্ট রিকোয়েস্ট দেখার এপিআই।
   */
  async getSuperAdminDashboard(user: any) {
    if (user.role !== 'superadmin') {
      throw new ForbiddenException('Only SuperAdmin can access platform metrics');
    }

    const [totalShops, totalManagers, freeShops, premiumShops, pendingPayments, approvedPayments, totalItems, totalSales] = await Promise.all([
      this.userModel.countDocuments({ role: 'admin' }),
      this.userModel.countDocuments({ role: 'manager' }),
      this.userModel.countDocuments({ role: 'admin', subscriptionTier: 'free' }),
      this.userModel.countDocuments({ role: 'admin', subscriptionTier: 'premium' }),
      this.subscriptionPaymentModel.countDocuments({ status: 'pending' }),
      this.subscriptionPaymentModel.find({ status: 'approved' }).exec(),
      this.itemModel.countDocuments({ isDeleted: { $ne: true } }),
      this.saleModel.countDocuments({ isDeleted: { $ne: true } }),
    ]);

    let totalSubscriptionRevenue = 0;
    approvedPayments.forEach(p => totalSubscriptionRevenue += p.amount);

    return {
      totalRegisteredShops: totalShops,
      totalManagersCount: totalManagers,
      freeTierShopsCount: freeShops,
      premiumTierShopsCount: premiumShops,
      pendingPaymentRequestsCount: pendingPayments,
      totalSubscriptionRevenue: totalSubscriptionRevenue.toString(),
      platformTotalItems: totalItems,
      platformTotalSales: totalSales,
    };
  }

  /**
   * 4. Get Profit Margin & Top Seller Analytics Insights
   */
  async getDashboardAnalyticsInsights(user: any) {
    const shopId = user.shopId;
    const canViewBuy = user.role === 'admin' || user.role === 'superadmin' || user.permissions?.canViewBuyPrice;

    const [sales, items, customers] = await Promise.all([
      this.saleModel.find({ shopId, isDeleted: { $ne: true } }).exec(),
      this.itemModel.find({ shopId, isDeleted: { $ne: true } }).exec(),
      this.customerModel.find({ shopId, isDeleted: { $ne: true } }).exec(),
    ]);

    const buyPriceMap = new Map<string, number>();
    items.forEach(i => buyPriceMap.set(i._id.toString(), i.buyPrice));

    const itemAnalyticsMap = new Map<string, {
      name: string;
      category: string;
      quantitySold: number;
      totalRevenue: number;
      totalCost: number;
      totalProfit: number;
    }>();

    const customerAnalyticsMap = new Map<string, {
      id: string;
      name: string;
      totalPurchased: number;
      invoiceCount: number;
      dueBalance: number;
    }>();

    let grandTotalRevenue = 0;
    let grandTotalCost = 0;

    for (const s of sales) {
      grandTotalRevenue += s.grandTotal;

      // Customer analytics
      const cId = s.customerId || 'walk-in';
      const cName = s.customerName || 'Walk-in Customer';
      const existingC = customerAnalyticsMap.get(cId) || {
        id: cId,
        name: cName,
        totalPurchased: 0,
        invoiceCount: 0,
        dueBalance: 0,
      };
      existingC.totalPurchased += s.grandTotal;
      existingC.invoiceCount += 1;
      customerAnalyticsMap.set(cId, existingC);

      // Item analytics
      for (const item of s.items) {
        const buyP = buyPriceMap.get(item.itemId) || 0;
        const cost = buyP * item.quantity;
        const profit = item.totalPrice - cost;

        grandTotalCost += cost;

        const existingI = itemAnalyticsMap.get(item.itemId) || {
          name: item.name,
          category: '',
          quantitySold: 0,
          totalRevenue: 0,
          totalCost: 0,
          totalProfit: 0,
        };
        existingI.quantitySold += item.quantity;
        existingI.totalRevenue += item.totalPrice;
        existingI.totalCost += cost;
        existingI.totalProfit += profit;
        itemAnalyticsMap.set(item.itemId, existingI);
      }
    }

    // Attach customer current due balance
    customers.forEach(c => {
      const existing = customerAnalyticsMap.get(c._id.toString());
      if (existing) {
        existing.dueBalance = c.closingBalance < 0 ? Math.abs(c.closingBalance) : 0;
      }
    });

    const itemAnalyticsArray = Array.from(itemAnalyticsMap.values());

    const topSellingByQuantity = [...itemAnalyticsArray]
      .sort((a, b) => b.quantitySold - a.quantitySold)
      .slice(0, 5)
      .map(i => ({
        name: i.name,
        quantitySold: i.quantitySold,
        totalRevenue: i.totalRevenue.toFixed(2),
      }));

    const topSellingByRevenue = [...itemAnalyticsArray]
      .sort((a, b) => b.totalRevenue - a.totalRevenue)
      .slice(0, 5)
      .map(i => ({
        name: i.name,
        quantitySold: i.quantitySold,
        totalRevenue: i.totalRevenue.toFixed(2),
      }));

    const mostProfitableItems = canViewBuy
      ? [...itemAnalyticsArray]
          .sort((a, b) => b.totalProfit - a.totalProfit)
          .slice(0, 5)
          .map(i => ({
            name: i.name,
            totalProfit: i.totalProfit.toFixed(2),
            marginPercent: i.totalRevenue > 0 ? ((i.totalProfit / i.totalRevenue) * 100).toFixed(2) + '%' : '0%',
          }))
      : [];

    const topCustomers = Array.from(customerAnalyticsMap.values())
      .filter(c => c.id !== 'walk-in')
      .sort((a, b) => b.totalPurchased - a.totalPurchased)
      .slice(0, 5)
      .map(c => ({
        id: c.id,
        name: c.name,
        totalPurchased: c.totalPurchased.toFixed(2),
        invoiceCount: c.invoiceCount,
        dueBalance: c.dueBalance.toFixed(2),
      }));

    const netProfit = grandTotalRevenue - grandTotalCost;
    const profitMarginPercent = grandTotalRevenue > 0 ? ((netProfit / grandTotalRevenue) * 100).toFixed(2) + '%' : '0%';

    return {
      summary: {
        totalSalesRevenue: grandTotalRevenue.toFixed(2),
        totalCost: canViewBuy ? grandTotalCost.toFixed(2) : 'N/A',
        netProfit: canViewBuy ? netProfit.toFixed(2) : 'N/A',
        overallProfitMarginPercent: canViewBuy ? profitMarginPercent : 'N/A',
      },
      topSellingByQuantity,
      topSellingByRevenue,
      mostProfitableItems,
      topCustomers,
    };
  }

  /**
   * 5. Get Unified Shop Notification & Smart Alerts Center
   */
  async getShopAlerts(user: any) {
    const shopId = user.shopId;
    const [items, customers, userDoc] = await Promise.all([
      this.itemModel.find({ shopId, isDeleted: { $ne: true } }).exec(),
      this.customerModel.find({ shopId, isDeleted: { $ne: true } }).exec(),
      this.userModel.findOne({ _id: user.uid || user.id }).exec(),
    ]);

    const lowStockAlerts = items
      .filter(i => i.stockQuantity <= i.lowStockThreshold)
      .map(i => ({
        id: i._id.toString(),
        name: i.name,
        sku: i.sku,
        stockQuantity: i.stockQuantity,
        lowStockThreshold: i.lowStockThreshold,
        severity: i.stockQuantity <= 0 ? 'CRITICAL' : 'WARNING',
      }));

    const dueCustomers = customers
      .filter(c => c.closingBalance < 0)
      .map(c => ({
        id: c._id.toString(),
        name: c.name,
        phone: c.phone,
        dueAmount: Math.abs(c.closingBalance).toFixed(2),
      }));

    let totalDueAmount = 0;
    dueCustomers.forEach(c => totalDueAmount += Number(c.dueAmount));

    // Subscription status warning
    let subscriptionAlert: any = null;
    if (userDoc && userDoc.subscriptionTier === 'premium' && userDoc.subscriptionExpiresAt) {
      const now = Date.now();
      const expires = new Date(userDoc.subscriptionExpiresAt).getTime();
      const daysLeft = Math.ceil((expires - now) / (1000 * 60 * 60 * 24));

      if (daysLeft <= 0) {
        subscriptionAlert = {
          status: 'EXPIRED',
          message: 'Your Premium subscription has expired. Please renew to avoid feature restrictions.',
          daysLeft: 0,
        };
      } else if (daysLeft <= 7) {
        subscriptionAlert = {
          status: 'EXPIRING_SOON',
          message: `Your Premium subscription expires in ${daysLeft} days. Please submit a renewal payment.`,
          daysLeft,
        };
      }
    }

    return {
      totalAlertsCount: lowStockAlerts.length + dueCustomers.length + (subscriptionAlert ? 1 : 0),
      lowStock: {
        count: lowStockAlerts.length,
        items: lowStockAlerts,
      },
      customerDues: {
        count: dueCustomers.length,
        totalDueAmount: totalDueAmount.toFixed(2),
        customers: dueCustomers,
      },
      subscription: subscriptionAlert,
    };
  }
}lProfit: i.totalProfit.toFixed(2),
            marginPercent: i.totalRevenue > 0 ? ((i.totalProfit / i.totalRevenue) * 100).toFixed(2) + '%' : '0%',
          }))
      : [];

    const topCustomers = Array.from(customerAnalyticsMap.values())
      .filter(c => c.id !== 'walk-in')
      .sort((a, b) => b.totalPurchased - a.totalPurchased)
      .slice(0, 5)
      .map(c => ({
        id: c.id,
        name: c.name,
        totalPurchased: c.totalPurchased.toFixed(2),
        invoiceCount: c.invoiceCount,
        dueBalance: c.dueBalance.toFixed(2),
      }));

    const netProfit = grandTotalRevenue - grandTotalCost;
    const profitMarginPercent = grandTotalRevenue > 0 ? ((netProfit / grandTotalRevenue) * 100).toFixed(2) + '%' : '0%';

    return {
      summary: {
        totalSalesRevenue: grandTotalRevenue.toFixed(2),
        totalCost: canViewBuy ? grandTotalCost.toFixed(2) : 'N/A',
        netProfit: canViewBuy ? netProfit.toFixed(2) : 'N/A',
        overallProfitMarginPercent: canViewBuy ? profitMarginPercent : 'N/A',
      },
      topSellingByQuantity,
      topSellingByRevenue,
      mostProfitableItems,
      topCustomers,
    };
  }
}
