import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Customer, CustomerDocument } from './schemas/customer.schema';
import { Ledger, LedgerDocument } from './schemas/ledger.schema';
import { CreateCustomerDto, UpdateCustomerDto } from './dto/customer.dto';

/**
 * Customers & Ledger Management Service
 * কাস্টমার তৈরি, তথ্য আপডেট, সফট-ডিলিট এবং লেনদেন স্টেটমেন্ট (লেজার খাতা) ম্যানেজ করার সার্ভিস।
 */
@Injectable()
export class CustomersService {
  constructor(
    @InjectModel(Customer.name) private customerModel: Model<CustomerDocument>,
    @InjectModel(Ledger.name) private ledgerModel: Model<LedgerDocument>,
  ) {}

  /**
   * 1. Create Customer
   * নতুন কাস্টমার রেজিস্টার করা এবং লেজার খাতায় ওপেনিং ব্যালেন্স এন্ট্রি দেওয়া।
   * ফ্রি টিয়ার লিমিটেশন: ফ্রি প্ল্যানে সর্বোচ্চ ১ জন কাস্টমার তৈরি করা যাবে।
   */
  async create(createCustomerDto: CreateCustomerDto, user: any) {
    // ফ্রি টিয়ার কাস্টমার লিমিট চেক (সর্বোচ্চ ১টি কাস্টমার)
    if (user.subscriptionTier === 'free') {
      const activeCustomerCount = await this.customerModel.countDocuments({
        shopId: user.shopId,
        isDeleted: { $ne: true },
      });
      if (activeCustomerCount >= 1) {
        throw new BadRequestException(
          'Free tier is limited to 1 customer only. Please upgrade to premium.'
        );
      }
    }

    const openingBalance = createCustomerDto.openingBalance || 0;
    const customer = new this.customerModel({
      name: createCustomerDto.name,
      phone: createCustomerDto.phone || '',
      address: createCustomerDto.address || '',
      openingBalance,
      closingBalance: openingBalance,
      shopId: user.shopId, // রিকোয়েস্ট পাঠানো ইউজারের shopId বসবে
      isDeleted: false,
    });

    const saved = await customer.save();

    // প্রাথমিক জের (Opening Balance) লেজার রেকর্ডে সংরক্ষণ
    const ledger = new this.ledgerModel({
      customerId: saved._id,
      type: 'opening',
      referenceId: saved._id.toString(),
      date: new Date(),
      description: 'Opening Balance',
      amount: openingBalance,
      previousBalance: 0,
      newBalance: openingBalance,
      shopId: user.shopId,
      isDeleted: false,
    });

    await ledger.save();

    return this.formatCustomer(saved);
  }

  /**
   * 2. List All Active Customers for Current Shop
   * লগইন থাকা ইউজারের শপের এক্টিভ (isDeleted: false) কাস্টমারদের তালিকা।
   */
  async findAll(user: any) {
    const customers = await this.customerModel
      .find({ shopId: user.shopId, isDeleted: { $ne: true } })
      .exec();
    return customers.map(c => this.formatCustomer(c));
  }

  /**
   * 3. Find Single Customer Profile By ID
   */
  async findOne(id: string, user: any) {
    const customer = await this.customerModel.findOne({
      _id: id,
      shopId: user.shopId,
      isDeleted: { $ne: true },
    });
    if (!customer) throw new NotFoundException('Customer not found');
    return this.formatCustomer(customer);
  }

  /**
   * 4. Update Customer Info
   */
  async update(id: string, updateCustomerDto: UpdateCustomerDto, user: any) {
    const customer = await this.customerModel.findOne({
      _id: id,
      shopId: user.shopId,
      isDeleted: { $ne: true },
    });
    if (!customer) throw new NotFoundException('Customer not found');

    if (updateCustomerDto.name !== undefined) customer.name = updateCustomerDto.name;
    if (updateCustomerDto.phone !== undefined) customer.phone = updateCustomerDto.phone;
    if (updateCustomerDto.address !== undefined) customer.address = updateCustomerDto.address;

    await customer.save();
    return this.formatCustomer(customer);
  }

  /**
   * 5. Soft-Delete Customer (Move to Recycle Bin)
   * সরাসরি ডাটা মুছে ফেলা হয় না, isDeleted: true ফ্লাগ বসিয়ে রিসাইকেল বিনে জমা রাখা হয়।
   */
  async remove(id: string, user: any) {
    const customer = await this.customerModel.findOne({
      _id: id,
      shopId: user.shopId,
      isDeleted: { $ne: true },
    });
    if (!customer) throw new NotFoundException('Customer not found');

    // সফট-ডিলিট প্রয়োগ
    customer.isDeleted = true;
    customer.deletedAt = new Date();
    customer.deletedBy = user.uid || user.id;
    await customer.save();

    // কাস্টমারের সাথে যুক্ত লেজার রেকর্ড সফট-ডিলিট করা
    await this.ledgerModel.updateMany(
      { customerId: id, shopId: user.shopId },
      { isDeleted: true, deletedAt: new Date(), deletedBy: user.uid || user.id }
    );

    return { message: 'Customer moved to trash (Soft deleted). Can be restored from Recycle Bin.' };
  }

  /**
   * 6. Get Customer Ledger Statement History
   * কাস্টমারের সমস্ত কেনাবেচা, জমা এবং পণ্য ফেরতের কালানুক্রমিক হিসেব বিবরণী।
   */
  async getLedger(customerId: string, user: any) {
    const customer = await this.customerModel.findOne({
      _id: customerId,
      shopId: user.shopId,
      isDeleted: { $ne: true },
    });
    if (!customer) throw new NotFoundException('Customer not found');

    const records = await this.ledgerModel
      .find({ customerId, shopId: user.shopId, isDeleted: { $ne: true } })
      .sort({ date: 1 })
      .exec();

    return records.map(r => ({
      id: r._id.toString(),
      type: r.type,
      referenceId: r.referenceId,
      date: r.date,
      description: r.description,
      amount: r.amount.toString(),
      previousBalance: r.previousBalance.toString(),
      newBalance: r.newBalance.toString(),
    }));
  }

  /**
   * Response Formatting Helper
   */
  private formatCustomer(customer: CustomerDocument) {
    return {
      id: customer._id.toString(),
      name: customer.name,
      phone: customer.phone,
      address: customer.address,
      openingBalance: customer.openingBalance.toString(),
      closingBalance: customer.closingBalance.toString(),
    };
  }
}
