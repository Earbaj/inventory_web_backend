import { SalesService } from './sales.service';
import { CreateSaleDto, QuerySalesDto } from './dto/sales.dto';
export declare class SalesController {
    private readonly salesService;
    constructor(salesService: SalesService);
    createSale(createSaleDto: CreateSaleDto, user: any): Promise<{
        id: string;
        invoiceNumber: string;
        customerId: string;
        customerName: string;
        customerPhone: string;
        items: {
            itemId: string;
            name: string;
            quantity: number;
            unitPrice: string;
            discount: string;
            discountType: string;
            totalPrice: string;
        }[];
        subtotal: string;
        discount: string;
        grandTotal: string;
        paidAmount: string;
        dueAmount: string;
        paymentStatus: string;
        date: Date;
        createdBy: string;
        createdByName: string;
        isReturned: string;
    }>;
    findAllSales(user: any, query: QuerySalesDto): Promise<{
        data: {
            id: string;
            invoiceNumber: string;
            customerId: string;
            customerName: string;
            customerPhone: string;
            items: {
                itemId: string;
                name: string;
                quantity: number;
                unitPrice: string;
                discount: string;
                discountType: string;
                totalPrice: string;
            }[];
            subtotal: string;
            discount: string;
            grandTotal: string;
            paidAmount: string;
            dueAmount: string;
            paymentStatus: string;
            date: Date;
            createdBy: string;
            createdByName: string;
            isReturned: string;
        }[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
            hasNextPage: boolean;
            hasPrevPage: boolean;
        };
    }>;
    findByInvoice(invoiceNumber: string, user: any): Promise<{
        id: string;
        invoiceNumber: string;
        customerId: string;
        customerName: string;
        customerPhone: string;
        items: {
            itemId: string;
            name: string;
            quantity: number;
            unitPrice: string;
            discount: string;
            discountType: string;
            totalPrice: string;
        }[];
        subtotal: string;
        discount: string;
        grandTotal: string;
        paidAmount: string;
        dueAmount: string;
        paymentStatus: string;
        date: Date;
        createdBy: string;
        createdByName: string;
        isReturned: string;
    }>;
    findOneSale(id: string, user: any): Promise<{
        id: string;
        invoiceNumber: string;
        customerId: string;
        customerName: string;
        customerPhone: string;
        items: {
            itemId: string;
            name: string;
            quantity: number;
            unitPrice: string;
            discount: string;
            discountType: string;
            totalPrice: string;
        }[];
        subtotal: string;
        discount: string;
        grandTotal: string;
        paidAmount: string;
        dueAmount: string;
        paymentStatus: string;
        date: Date;
        createdBy: string;
        createdByName: string;
        isReturned: string;
    }>;
}
