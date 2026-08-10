import { Model } from 'mongoose';
import { PaymentDocument } from './schemas/payment.schema';
import { CustomerDocument } from '../customers/schemas/customer.schema';
import { LedgerDocument } from '../customers/schemas/ledger.schema';
import { ProcessPaymentDto } from './dto/payment.dto';
export declare class PaymentsService {
    private paymentModel;
    private customerModel;
    private ledgerModel;
    constructor(paymentModel: Model<PaymentDocument>, customerModel: Model<CustomerDocument>, ledgerModel: Model<LedgerDocument>);
    processPayment(processPaymentDto: ProcessPaymentDto, user: any): Promise<{
        id: string;
        customerId: string;
        customerName: string;
        amount: string;
        paymentMethod: string;
        date: Date;
        receivedBy: string;
        previousBalance: string;
        newBalance: string;
    }>;
}
