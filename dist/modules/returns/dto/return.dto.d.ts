export declare class ReturnItemInputDto {
    itemId: string;
    quantity: number;
}
export declare class ProcessReturnDto {
    customerId?: string;
    saleId: string;
    returnedItems: ReturnItemInputDto[];
}
