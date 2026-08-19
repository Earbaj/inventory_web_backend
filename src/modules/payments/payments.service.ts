import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Payment, PaymentDocument } from './schemas/payment.schema';
import { Customer, CustomerDocument } from '../customers/schemas/customer.schema';
import { Ledger, LedgerDocument } from '../customers/schemas/ledger.schema';
import { ProcessPaymentDto } from './dto/payment.dto';

/**
 * Customer Due Payments Service
 * কাস্টমারের বাকি আদায় জমা নেওয়া, ক্লোজিং ব্যালেন্স সমন্বয় করা এবং লেজার খাতা এন্ট্রি দেওয়ার সার্ভিস।
 */
@Injectable()
export class PaymentsService {
  constructor(
    @InjectModel(Payment.name) private paymentModel: Model<PaymentDocument>,
    @InjectModel(Customer.name) private customerModel: Model<CustomerDocument>,
    @InjectModel(Ledger.name) private ledgerModel: Model<LedgerDocument>,
  ) {}

  /**
   * 1. Process Customer Due Payment
   * কাস্টমারের বাকি জমা প্রসেস করা:
   * - কাস্টমারের ব্যালেন্স আপডেট (বাকি কমবে অথবা জমা বাড়বে)।
   * - পেমেন্ট ট্রানজেকশন রেকর্ড সংরক্ষণ।
   * - কাস্টমার লেজার খাতায় (Ledger Statement) অটোমেটিক 'payment' টাইপের এন্ট্রি প্রদান।
   */
  async processPayment(processPaymentDto: ProcessPaymentDto, user: any) {
    const customer = await this.customerModel.findOne({
      _id: processPaymentDto.customerId,
      shopId: user.shopId,
      isDeleted: { $ne: true },
    });
    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    const amount = processPaymentDto.amount;
    const previousBalance = customer.closingBalance;
    // জমার টাকা কাস্টমার ব্যালেন্সে যোগ হবে (বাকি কমবে বা অগ্রিম বাড়বে)
    const newBalance = previousBalance + amount;

    customer.closingBalance = newBalance;
    await customer.save();

    // পেমেন্ট রেকর্ড ডাটাবেজে তৈরি
    const payment = new this.paymentModel({
      customerId: customer._id.toString(),
      amount,
      paymentMethod: processPaymentDto.paymentMethod.toLowerCase(),
      date: new Date(),
      receivedBy: user.uid || user.id,
      shopId: user.shopId,
      isDeleted: false,
    });

    const savedPayment = await payment.save();

    // কাস্টমারের লেজার স্টেটমেন্ট খাতায় 'payment' রেকর্ডিং
    const ledgerRecord = new this.ledgerModel({
      customerId: customer._id.toString(),
      type: 'payment',
      referenceId: savedPayment._id.toString(),
      date: new Date(),
      description: `Payment received via ${processPaymentDto.paymentMethod.toUpperCase()}`,
      amount,
      previousBalance,
      newBalance,
      shopId: user.shopId,
      isDeleted: false,
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

  /**
   * 2. List Customer Payments History (Paginated & Date Filtered)
   * শপের বাকি আদায় লেনদেনের সময়ভিত্তিক ইতিহাস তালিকা পাওয়া।
   */
  async findAllPayments(user: any, query: any = {}) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(query.limit) || 10));
    const skip = (page - 1) * limit;

    const filter: any = { shopId: user.shopId, isDeleted: { $ne: true } };
    if (query.customerId) {
      filter.customerId = query.customerId;
    }
    if (query.paymentMethod) {
      filter.paymentMethod = query.paymentMethod.toLowerCase();
    }
    if (query.startDate || query.endDate) {
      filter.date = {};
      if (query.startDate) filter.date.$gte = new Date(query.startDate);
      if (query.endDate) {
        const end = new Date(query.endDate);
        end.setHours(23, 59, 59, 999);
        filter.date.$lte = end;
      }
    }

    const sortField = query.sortBy || 'date';
    const sortDirection = query.sortOrder === 'asc' ? 1 : -1;

    const total = await this.paymentModel.countDocuments(filter);
    const payments = await this.paymentModel
      .find(filter)
      .sort({ [sortField]: sortDirection })
      .skip(skip)
      .limit(limit)
      .exec();

    const data = await Promise.all(
      payments.map(async p => {
        let customerName = 'Unknown Customer';
        if (p.customerId) {
          const cust = await this.customerModel.findById(p.customerId).select('name');
          if (cust) customerName = cust.name;
        }
        return {
          id: p._id.toString(),
          customerId: p.customerId,
          customerName,
          amount: p.amount.toString(),
          paymentMethod: p.paymentMethod,
          date: p.date,
          receivedBy: p.receivedBy,
        };
      })
    );

    const totalPages = Math.ceil(total / limit) || 1;

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  }
}
