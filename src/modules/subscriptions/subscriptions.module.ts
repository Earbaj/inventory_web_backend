import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SubscriptionPayment, SubscriptionPaymentSchema } from './schemas/subscription-payment.schema';
import { User, UserSchema } from '../auth/schemas/user.schema';
import { SubscriptionsService } from './subscriptions.service';
import { SubscriptionsController } from './subscriptions.controller';

/**
 * Subscriptions Module
 * প্ল্যাটফর্ম প্যাকেজ সাবস্ক্রিপশন, পেমেন্ট ডাটাবেজ মডেল এবং সার্ভিসসমূহ যুক্ত করার নেস্টজেএস মডিউল।
 */
@Module({
  imports: [
    // SubscriptionPayment এবং User কালেকশন স্কিমা MongoDB তে রেজিস্টার করা
    MongooseModule.forFeature([
      { name: SubscriptionPayment.name, schema: SubscriptionPaymentSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [SubscriptionsController],
  providers: [SubscriptionsService],
  exports: [SubscriptionsService],
})
export class SubscriptionsModule {}
