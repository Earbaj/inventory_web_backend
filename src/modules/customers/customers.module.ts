import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CustomersService } from './customers.service';
import { CustomersController } from './customers.controller';
import { Customer, CustomerSchema } from './schemas/customer.schema';
import { Ledger, LedgerSchema } from './schemas/ledger.schema';

/**
 * Customers Module
 * কাস্টমার এবং কাস্টমার লেজার সংক্রান্ত সকল মডেল, প্রোভাইডার ও কন্ট্রোলার হ্যান্ডেল করার মডিউল।
 */
@Module({
  imports: [
    // Customer এবং Ledger কালেকশন স্কিমা MongoDB তে রেজিস্টার করা
    MongooseModule.forFeature([
      { name: Customer.name, schema: CustomerSchema },
      { name: Ledger.name, schema: LedgerSchema },
    ]),
  ],
  controllers: [CustomersController],
  providers: [CustomersService],
  exports: [CustomersService, MongooseModule],
})
export class CustomersModule {}
