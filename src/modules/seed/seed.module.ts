import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SeedService } from './seed.service';
import { User, UserSchema } from '../auth/schemas/user.schema';
import { Category, CategorySchema } from '../inventory/schemas/category.schema';
import { Item, ItemSchema } from '../inventory/schemas/item.schema';
import { Customer, CustomerSchema } from '../customers/schemas/customer.schema';
import { Ledger, LedgerSchema } from '../customers/schemas/ledger.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Category.name, schema: CategorySchema },
      { name: Item.name, schema: ItemSchema },
      { name: Customer.name, schema: CustomerSchema },
      { name: Ledger.name, schema: LedgerSchema },
    ]),
  ],
  providers: [SeedService],
  exports: [SeedService],
})
export class SeedModule {}
