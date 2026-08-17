import { ReturnsService } from './returns.service';
import { ProcessReturnDto } from './dto/return.dto';
export declare class ReturnsController {
    private readonly returnsService;
    constructor(returnsService: ReturnsService);
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
