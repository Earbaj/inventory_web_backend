import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { Sale, SaleSchema } from '../sales/schemas/sale.schema';
import { Item, ItemSchema } from '../inventory/schemas/item.schema';
import { Customer, CustomerSchema } from '../customers/schemas/customer.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Sale.name, schema: SaleSchema },
      { name: Item.name, schema: ItemSchema },
      { name: Customer.name, schema: CustomerSchema },
    ]),
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
  exports: [DashboardService],
})
export class DashboardModule {}
