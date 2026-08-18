import { PaginationQueryDto } from '../../../common/dto/pagination.dto';
export declare class SaleItemDto {
    itemId: string;
    quantity: number;
    unitPrice: number;
    discount?: number;
    discountType?: string;
}
export declare class CreateSaleDto {
    customerId?: string;
    customerName?: string;
    customerPhone?: string;
    items: SaleItemDto[];
    discount?: number;
    paidAmount: number;
}
export declare class QuerySalesDto extends PaginationQueryDto {
    cashierId?: string;
    paymentStatus?: string;
    startDate?: string;
    endDate?: string;
}
