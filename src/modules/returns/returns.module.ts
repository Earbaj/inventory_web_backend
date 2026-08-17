import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ReturnsService } from './returns.service';
import { ReturnsController } from './returns.controller';
import { Return, ReturnSchema } from './schemas/return.schema';
import { Sale, SaleSchema } from '../sales/schemas/sale.schema';
import { Item, ItemSchema } from '../inventory/schemas/item.schema';
import { Customer, CustomerSchema } from '../customers/schemas/customer.schema';
import { Ledger, LedgerSchema } from '../customers/schemas/ledger.schema';

/**
 * Returns Module
 * সেলস রিটার্ন, পণ্য রি-স্টক এবং রিফান্ড সংক্রান্ত মডেল ও সার্ভিস রেজিস্টার করার মডিউল।
 */
@Module({
  imports: [
    // Return, Sale, Item, Customer এবং Ledger কালেকশন স্কিমা MongoDB তে রেজিস্টার করা
    MongooseModule.forFeature([
      { name: Return.name, schema: ReturnSchema },
      { name: Sale.name, schema: SaleSchema },
      { name: Item.name, schema: ItemSchema },
      { name: Customer.name, schema: CustomerSchema },
      { name: Ledger.name, schema: LedgerSchema },
    ]),
  ],
  controllers: [ReturnsController],
  providers: [ReturnsService],
  exports: [ReturnsService, MongooseModule],
})
export class ReturnsModule {}
