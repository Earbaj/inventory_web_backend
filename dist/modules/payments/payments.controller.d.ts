import { PaymentsService } from './payments.service';
import { ProcessPaymentDto } from './dto/payment.dto';
export declare class PaymentsController {
    private readonly paymentsService;
    constructor(paymentsService: PaymentsService);
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
