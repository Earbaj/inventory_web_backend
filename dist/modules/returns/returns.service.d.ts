import { Model } from 'mongoose';
import { ReturnDocument } from './schemas/return.schema';
import { SaleDocument } from '../sales/schemas/sale.schema';
import { ItemDocument } from '../inventory/schemas/item.schema';
import { CustomerDocument } from '../customers/schemas/customer.schema';
import { LedgerDocument } from '../customers/schemas/ledger.schema';
import { ProcessReturnDto } from './dto/return.dto';
export declare class ReturnsService {
    private returnModel;
    private saleModel;
    private itemModel;
    private customerModel;
    private ledgerModel;
    constructor(returnModel: Model<ReturnDocument>, saleModel: Model<SaleDocument>, itemModel: Model<ItemDocument>, customerModel: Model<CustomerDocument>, ledgerModel: Model<LedgerDocument>);
    processReturn(processReturnDto: ProcessReturnDto, user: any): Promise<{
        id: string;
        customerId: string;
        saleId: string;
        invoiceNumber: string;
        returnedItems: any[];
        totalRefund: string;
        date: Date;
        processedBy: string;
    }>;
    findAllReturns(user: any): Promise<{
        id: string;
        customerId: string;
        saleId: string;
        invoiceNumber: string;
        returnedItems: {
            itemId: string;
            name: string;
            quantity: number;
            refundAmountPerUnit: string;
        }[];
        totalRefund: string;
        date: Date;
        processedBy: string;
    }[]>;
}
