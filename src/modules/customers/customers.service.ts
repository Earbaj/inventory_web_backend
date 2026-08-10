import { Injectable, NotFoundException } from '@nestjs/common';
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

  async create(createCustomerDto: CreateCustomerDto) {
    const openingBalance = createCustomerDto.openingBalance || 0;
    const customer = new this.customerModel({
      name: createCustomerDto.name,
      phone: createCustomerDto.phone || '',
      address: createCustomerDto.address || '',
      openingBalance,
      closingBalance: openingBalance,
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
    });

    await ledger.save();

    return this.formatCustomer(saved);
  }

  async findAll() {
    const customers = await this.customerModel.find().exec();
    return customers.map(c => this.formatCustomer(c));
  }

  async findOne(id: string) {
    const customer = await this.customerModel.findById(id);
    if (!customer) throw new NotFoundException('Customer not found');
    return this.formatCustomer(customer);
  }

  async update(id: string, updateCustomerDto: UpdateCustomerDto) {
    const customer = await this.customerModel.findById(id);
    if (!customer) throw new NotFoundException('Customer not found');

    if (updateCustomerDto.name !== undefined) customer.name = updateCustomerDto.name;
    if (updateCustomerDto.phone !== undefined) customer.phone = updateCustomerDto.phone;
    if (updateCustomerDto.address !== undefined) customer.address = updateCustomerDto.address;

    await customer.save();
    return this.formatCustomer(customer);
  }

  async remove(id: string) {
    const customer = await this.customerModel.findByIdAndDelete(id);
    if (!customer) throw new NotFoundException('Customer not found');
    await this.ledgerModel.deleteMany({ customerId: id });
    return { message: 'Customer and ledger records deleted successfully' };
  }

  async getLedger(customerId: string) {
    const customer = await this.customerModel.findById(customerId);
    if (!customer) throw new NotFoundException('Customer not found');

    const records = await this.ledgerModel.find({ customerId }).sort({ date: 1 }).exec();
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
