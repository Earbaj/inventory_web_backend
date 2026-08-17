import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Customer, CustomerDocument } from './schemas/customer.schema';
import { Ledger, LedgerDocument } from './schemas/ledger.schema';
import { CreateCustomerDto, UpdateCustomerDto } from './dto/customer.dto';

@Injectable()
export class CustomersService {
  constructor(
    @InjectModel(Customer.name) private customerModel: Model<CustomerDocument>,
    @InjectModel(Ledger.name) private ledgerModel: Model<LedgerDocument>,
  ) {}

  async create(createCustomerDto: CreateCustomerDto, user: any) {
    // Check Free Tier Customer Limit (Max 1 Customer for Free Tier)
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
      shopId: user.shopId,
      isDeleted: false,
    });

    const saved = await customer.save();

    // Create initial opening balance ledger record
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

  async findAll(user: any) {
    const customers = await this.customerModel
      .find({ shopId: user.shopId, isDeleted: { $ne: true } })
      .exec();
    return customers.map(c => this.formatCustomer(c));
  }

  async findOne(id: string, user: any) {
    const customer = await this.customerModel.findOne({
      _id: id,
      shopId: user.shopId,
      isDeleted: { $ne: true },
    });
    if (!customer) throw new NotFoundException('Customer not found');
    return this.formatCustomer(customer);
  }

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

  async remove(id: string, user: any) {
    const customer = await this.customerModel.findOne({
      _id: id,
      shopId: user.shopId,
      isDeleted: { $ne: true },
    });
    if (!customer) throw new NotFoundException('Customer not found');

    // Perform Soft-Delete (Move to Recycle Bin)
    customer.isDeleted = true;
    customer.deletedAt = new Date();
    customer.deletedBy = user.uid || user.id;
    await customer.save();

    // Soft-delete associated ledger records
    await this.ledgerModel.updateMany(
      { customerId: id, shopId: user.shopId },
      { isDeleted: true, deletedAt: new Date(), deletedBy: user.uid || user.id }
    );

    return { message: 'Customer moved to trash (Soft deleted). Can be restored from Recycle Bin.' };
  }

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
