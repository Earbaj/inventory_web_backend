import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { Payment, PaymentSchema } from './schemas/payment.schema';
import { Customer, CustomerSchema } from '../customers/schemas/customer.schema';
import { Ledger, LedgerSchema } from '../customers/schemas/ledger.schema';

/**
 * Customer Due Payments Module
 * কাস্টমারের বাকি টাকা জমার জন্য প্রয়োজনীয় পেমেন্ট, কাস্টমার এবং লেজার মডেল রেজিস্টার করার মডিউল।
 */
@Module({
  imports: [
    // Payment, Customer এবং Ledger কালেকশন স্কিমা MongoDB তে রেজিস্টার করা
    MongooseModule.forFeature([
      { name: Payment.name, schema: PaymentSchema },
      { name: Customer.name, schema: CustomerSchema },
      { name: Ledger.name, schema: LedgerSchema },
    ]),
  ],
  controllers: [PaymentsController],
  providers: [PaymentsService],
  exports: [PaymentsService, MongooseModule],
})
export class PaymentsModule {}
