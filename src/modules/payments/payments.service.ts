import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Payment, PaymentDocument } from './schemas/payment.schema';
import { Customer, CustomerDocument } from '../customers/schemas/customer.schema';
import { Ledger, LedgerDocument } from '../customers/schemas/ledger.schema';
import { ProcessPaymentDto } from './dto/payment.dto';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectModel(Payment.name) private paymentModel: Model<PaymentDocument>,
    @InjectModel(Customer.name) private customerModel: Model<CustomerDocument>,
    @InjectModel(Ledger.name) private ledgerModel: Model<LedgerDocument>,
  ) {}

  async processPayment(processPaymentDto: ProcessPaymentDto, user: any) {
    const customer = await this.customerModel.findById(processPaymentDto.customerId);
    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    const amount = processPaymentDto.amount;
    const previousBalance = customer.closingBalance;
    // Payment increases customer balance (reduces due or increases advance)
    const newBalance = previousBalance + amount;

    customer.closingBalance = newBalance;
    await customer.save();

    const payment = new this.paymentModel({
      customerId: customer._id.toString(),
      amount,
      paymentMethod: processPaymentDto.paymentMethod.toLowerCase(),
      date: new Date(),
      receivedBy: user.uid || user.id,
    });

    const savedPayment = await payment.save();

    const ledgerRecord = new this.ledgerModel({
      customerId: customer._id.toString(),
      type: 'payment',
      referenceId: savedPayment._id.toString(),
      date: new Date(),
      description: `Payment received via ${processPaymentDto.paymentMethod.toUpperCase()}`,
      amount,
      previousBalance,
      newBalance,
    });

    await ledgerRecord.save();

    return {
      id: savedPayment._id.toString(),
      customerId: customer._id.toString(),
      customerName: customer.name,
      amount: amount.toString(),
      paymentMethod: processPaymentDto.paymentMethod,
      date: savedPayment.date,
      receivedBy: savedPayment.receivedBy,
      previousBalance: previousBalance.toString(),
      newBalance: newBalance.toString(),
    };
  }
}
