import { DashboardService } from './dashboard.service';
export declare class DashboardController {
    private readonly dashboardService;
    constructor(dashboardService: DashboardService);
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
    getSalesReport(user: any, startDate?: string, endDate?: string, cashierId?: string, page?: number, limit?: number): Promise<{
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
            data: {
                id: string;
                invoiceNumber: string;
                customerName: string;
                grandTotal: string;
                paidAmount: string;
                paymentStatus: string;
                date: Date;
                createdByName: string;
            }[];
            meta: {
                total: number;
                page: number;
                limit: number;
                totalPages: number;
                hasNextPage: boolean;
                hasPrevPage: boolean;
            };
        };
    }>;
}
