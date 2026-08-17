import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Item, ItemSchema } from '../inventory/schemas/item.schema';
import { Customer, CustomerSchema } from '../customers/schemas/customer.schema';
import { Sale, SaleSchema } from '../sales/schemas/sale.schema';
import { Return, ReturnSchema } from '../returns/schemas/return.schema';
import { Ledger, LedgerSchema } from '../customers/schemas/ledger.schema';
import { TrashService } from './trash.service';
import { TrashController } from './trash.controller';

/**
 * Trash & Recycle Bin Module
 * রিসাইকেল বিন এবং ডাটা রিকভারি ফিচারসমূহের সার্ভিস ও মডেল রেজিস্ট্রেশন মডিউল।
 */
@Module({
  imports: [
    // Item, Customer, Sale, Return এবং Ledger কালেকশন স্কিমা MongoDB তে রেজিস্টার করা
    MongooseModule.forFeature([
      { name: Item.name, schema: ItemSchema },
      { name: Customer.name, schema: CustomerSchema },
      { name: Sale.name, schema: SaleSchema },
      { name: Return.name, schema: ReturnSchema },
      { name: Ledger.name, schema: LedgerSchema },
    ]),
  ],
  controllers: [TrashController],
  providers: [TrashService],
  exports: [TrashService],
})
export class TrashModule {}
