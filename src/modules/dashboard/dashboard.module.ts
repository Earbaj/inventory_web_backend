import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { Sale, SaleSchema } from '../sales/schemas/sale.schema';
import { Item, ItemSchema } from '../inventory/schemas/item.schema';
import { Customer, CustomerSchema } from '../customers/schemas/customer.schema';
import { User, UserSchema } from '../auth/schemas/user.schema';
import { SubscriptionPayment, SubscriptionPaymentSchema } from '../subscriptions/schemas/subscription-payment.schema';

/**
 * Dashboard & Analytics Module
 * ড্যাশবোর্ড ওভারভিউ ও রিপোর্টের জন্য প্রয়োজনীয় ডাটাবেজ মডেল এবং প্রোভাইডারসমূহ যুক্ত করার মডিউল।
 */
@Module({
  imports: [
    // ড্যাশবোর্ড হিসাবের জন্য বিক্রয়, প্রোডাক্ট, কাস্টমার, ইউজার এবং পেমেন্ট মডেল রেজিস্টার
    MongooseModule.forFeature([
      { name: Sale.name, schema: SaleSchema },
      { name: Item.name, schema: ItemSchema },
      { name: Customer.name, schema: CustomerSchema },
      { name: User.name, schema: UserSchema },
      { name: SubscriptionPayment.name, schema: SubscriptionPaymentSchema },
    ]),
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
  exports: [DashboardService],
})
export class DashboardModule {}
