import { Injectable, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Sale, SaleDocument } from '../sales/schemas/sale.schema';
import { Item, ItemDocument } from '../inventory/schemas/item.schema';
import { Customer, CustomerDocument } from '../customers/schemas/customer.schema';
import { User, UserDocument } from '../auth/schemas/user.schema';
import { SubscriptionPayment, SubscriptionPaymentSchema } from '../subscriptions/schemas/subscription-payment.schema';

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
  ) {}

  /**
   * 1. Get Shop Dashboard Overview KPIs
   * শপের মোট বিক্রি, ক্যাশ কালেকশন, মোট বাকি, নিট লাভ, স্টক অ্যালার্ট ও কাস্টমার বাকির সামারি।
   */
  async getDashboardStats(user: any) {
    const shopId = user.shopId;

    // শুধুমাত্র নিজস্ব শপের এক্টিভ (isDeleted: false) ডাটা আনা হচ্ছে
    const sales = await this.saleModel.find({ shopId, isDeleted: { $ne: true } }).exec();
    const items = await this.itemModel.find({ shopId, isDeleted: { $ne: true } }).exec();
    const customers = await this.customerModel.find({ shopId, isDeleted: { $ne: true } }).exec();

    let totalSalesRevenue = 0;
    let totalPaidCollected = 0;
    let totalDue = 0;

    // মোট বিক্রি, ক্যাশ জমা ও বকেয়া হিসাব
    for (const s of sales) {
      totalSalesRevenue += s.grandTotal;
      totalPaidCollected += s.paidAmount;
      totalDue += s.dueAmount;
    }

    // নিট লাভ (Profit) হিসাব - শুধুমাত্র অ্যাডমিন বা কেনাদাম দেখার অনুমতি প্রাপ্ত ইউজাররা দেখতে পাবেন
    let netProfit = 0;
    const canViewBuy = user.role === 'admin' || user.role === 'superadmin' || user.permissions?.canViewBuyPrice;
    
    if (canViewBuy) {
      const itemsMap = new Map<string, number>();
      items.forEach(i => itemsMap.set(i._id.toString(), i.buyPrice));

      for (const s of sales) {
        for (const itemDetail of s.items) {
          const buyPrice = itemsMap.get(itemDetail.itemId) || 0;
          const cost = buyPrice * itemDetail.quantity;
          const profit = itemDetail.totalPrice - cost;
          netProfit += profit;
        }
      }
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
   * তারিখ অনুযায়ী (Date Range Filter) এবং ক্যাশিয়ার আইডি দিয়ে ফিল্টারকৃত বিস্তারিত বিক্রয় রিপোর্ট।
   */
  async getSalesReport(user: any, startDate?: string, endDate?: string, cashierId?: string) {
    const query: any = { shopId: user.shopId, isDeleted: { $ne: true } };
    if (cashierId) query.createdBy = cashierId;

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
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

    return {
      totalRevenue: totalRevenue.toString(),
      totalDiscount: totalDiscount.toString(),
      totalInvoices: sales.length,
      totalItemsSold,
      // সর্বোচ্চ বিক্রীত সেরা ১০টি প্রোডাক্ট (Top 10 Selling Products)
      topSellingItems: Array.from(itemsSummary.values())
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, 10)
        .map(i => ({ ...i, revenue: i.revenue.toString() })),
      salesList: sales.map(s => ({
        id: s._id.toString(),
        invoiceNumber: s.invoiceNumber,
        customerName: s.customerName,
        grandTotal: s.grandTotal.toString(),
        paidAmount: s.paidAmount.toString(),
        paymentStatus: s.paymentStatus,
        date: s.date,
        createdByName: s.createdByName,
      })),
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
}
