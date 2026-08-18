"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const sale_schema_1 = require("../sales/schemas/sale.schema");
const item_schema_1 = require("../inventory/schemas/item.schema");
const customer_schema_1 = require("../customers/schemas/customer.schema");
const user_schema_1 = require("../auth/schemas/user.schema");
const subscription_payment_schema_1 = require("../subscriptions/schemas/subscription-payment.schema");
let DashboardService = class DashboardService {
    constructor(saleModel, itemModel, customerModel, userModel, subscriptionPaymentModel) {
        this.saleModel = saleModel;
        this.itemModel = itemModel;
        this.customerModel = customerModel;
        this.userModel = userModel;
        this.subscriptionPaymentModel = subscriptionPaymentModel;
    }
    async getDashboardStats(user) {
        const shopId = user.shopId;
        const sales = await this.saleModel.find({ shopId, isDeleted: { $ne: true } }).exec();
        const items = await this.itemModel.find({ shopId, isDeleted: { $ne: true } }).exec();
        const customers = await this.customerModel.find({ shopId, isDeleted: { $ne: true } }).exec();
        let totalSalesRevenue = 0;
        let totalPaidCollected = 0;
        let totalDue = 0;
        for (const s of sales) {
            totalSalesRevenue += s.grandTotal;
            totalPaidCollected += s.paidAmount;
            totalDue += s.dueAmount;
        }
        let netProfit = 0;
        const canViewBuy = user.role === 'admin' || user.role === 'superadmin' || user.permissions?.canViewBuyPrice;
        if (canViewBuy) {
            const itemsMap = new Map();
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
        const lowStockItems = items.filter(i => i.stockQuantity <= i.lowStockThreshold);
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
    async getSalesReport(user, startDate, endDate, cashierId, pageParam = 1, limitParam = 10) {
        const page = Math.max(1, Number(pageParam) || 1);
        const limit = Math.max(1, Math.min(100, Number(limitParam) || 10));
        const skip = (page - 1) * limit;
        const query = { shopId: user.shopId, isDeleted: { $ne: true } };
        if (cashierId)
            query.createdBy = cashierId;
        if (startDate || endDate) {
            query.date = {};
            if (startDate)
                query.date.$gte = new Date(startDate);
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
        const itemsSummary = new Map();
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
    async getSuperAdminDashboard(user) {
        if (user.role !== 'superadmin') {
            throw new common_1.ForbiddenException('Only SuperAdmin can access platform metrics');
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
};
exports.DashboardService = DashboardService;
exports.DashboardService = DashboardService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(sale_schema_1.Sale.name)),
    __param(1, (0, mongoose_1.InjectModel)(item_schema_1.Item.name)),
    __param(2, (0, mongoose_1.InjectModel)(customer_schema_1.Customer.name)),
    __param(3, (0, mongoose_1.InjectModel)(user_schema_1.User.name)),
    __param(4, (0, mongoose_1.InjectModel)(subscription_payment_schema_1.SubscriptionPayment.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model])
], DashboardService);
//# sourceMappingURL=dashboard.service.js.map