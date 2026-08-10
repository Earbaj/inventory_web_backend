import { Model } from 'mongoose';
import { SaleDocument } from '../sales/schemas/sale.schema';
import { ItemDocument } from '../inventory/schemas/item.schema';
import { CustomerDocument } from '../customers/schemas/customer.schema';
export declare class DashboardService {
    private saleModel;
    private itemModel;
    private customerModel;
    constructor(saleModel: Model<SaleDocument>, itemModel: Model<ItemDocument>, customerModel: Model<CustomerDocument>);
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
    getSalesReport(startDate?: string, endDate?: string, cashierId?: string): Promise<{
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
}
