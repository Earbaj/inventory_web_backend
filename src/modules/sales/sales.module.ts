import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SalesService } from './sales.service';
import { SalesController } from './sales.controller';
import { Sale, SaleSchema } from './schemas/sale.schema';
import { Item, ItemSchema } from '../inventory/schemas/item.schema';
import { Customer, CustomerSchema } from '../customers/schemas/customer.schema';
import { Ledger, LedgerSchema } from '../customers/schemas/ledger.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Sale.name, schema: SaleSchema },
      { name: Item.name, schema: ItemSchema },
      { name: Customer.name, schema: CustomerSchema },
      { name: Ledger.name, schema: LedgerSchema },
    ]),
  ],
  controllers: [SalesController],
  providers: [SalesService],
  exports: [SalesService, MongooseModule],
})
export class SalesModule {}
