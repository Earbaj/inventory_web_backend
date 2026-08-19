import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Item, ItemSchema } from '../inventory/schemas/item.schema';
import { Sale, SaleSchema } from '../sales/schemas/sale.schema';
import { Customer, CustomerSchema } from '../customers/schemas/customer.schema';
import { Ledger, LedgerSchema } from '../customers/schemas/ledger.schema';
import { AiPredictionsService } from './ai-predictions.service';
import { AiPredictionsController } from './ai-predictions.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Item.name, schema: ItemSchema },
      { name: Sale.name, schema: SaleSchema },
      { name: Customer.name, schema: CustomerSchema },
      { name: Ledger.name, schema: LedgerSchema },
    ]),
  ],
  controllers: [AiPredictionsController],
  providers: [AiPredictionsService],
  exports: [AiPredictionsService],
})
export class AiPredictionsModule {}
