import { Model } from 'mongoose';
import { SaleDocument } from '../sales/schemas/sale.schema';
import { ItemDocument } from '../inventory/schemas/item.schema';
import { CustomerDocument } from '../customers/schemas/customer.schema';
import { UserDocument } from '../auth/schemas/user.schema';
import { SubscriptionPayment } from '../subscriptions/schemas/subscription-payment.schema';
export declare class DashboardService {
    private saleModel;
    private itemModel;
    private customerModel;
    private userModel;
    private subscriptionPaymentModel;
    constructor(saleModel: Model<SaleDocument>, itemModel: Model<ItemDocument>, customerModel: Model<CustomerDocument>, userModel: Model<UserDocument>, subscriptionPaymentModel: Model<SubscriptionPayment>);
    getDashboardStats(user: any): Promise<{
        totalSalesRevenue: string;
        totalPaidCollected: string;
        totalDueAmount: string;
        netProfit: string;
        totalItemsCount: number;
        lowStockCount: number;
        totalCustomersCount: number;
        totalCustomerDue: string;
        totalInvoicesCount: number;
    }>;
    getSalesReport(user: any, startDate?: string, endDate?: string, cashierId?: string): Promise<{
        totalRevenue: string;
        totalDiscount: string;
        totalInvoices: number;
        totalItemsSold: number;
        topSellingItems: {
            revenue: string;
            name: string;
            quantity: number;
        }[];
        salesList: {
            id: string;
            invoiceNumber: string;
            customerName: string;
            grandTotal: string;
            paidAmount: string;
            paymentStatus: string;
            date: Date;
            createdByName: string;
        }[];
    }>;
    getSuperAdminDashboard(user: any): Promise<{
        totalRegisteredShops: number;
        totalManagersCount: number;
        freeTierShopsCount: number;
        premiumTierShopsCount: number;
        pendingPaymentRequestsCount: number;
        totalSubscriptionRevenue: string;
        platformTotalItems: number;
        platformTotalSales: number;
    }>;
}
