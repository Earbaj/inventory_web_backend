import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type SubscriptionPaymentDocument = SubscriptionPayment & Document;

@Schema({ timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } })
export class SubscriptionPayment {
  @Prop({ required: true, type: String, index: true })
  userId: string; // Shop Owner User ID

  @Prop({ required: true, type: String, index: true })
  shopId: string; // Shop ID

  @Prop({ required: true, enum: ['free', 'premium_monthly', 'premium_yearly'] })
  packageId: string;

  @Prop({ required: true, type: Number })
  amount: number; // Payment Amount in BDT

  @Prop({ required: true, enum: ['manual_bkash', 'manual_nagad', 'manual_bank'] })
  paymentMethod: string;

  @Prop({ required: true, trim: true })
  trxId: string; // Transaction ID submitted by user

  @Prop({ required: true, trim: true })
  accountNo: string; // Mobile/Bank account number from which money was sent

  @Prop({ required: true, enum: ['pending', 'approved', 'rejected'], default: 'pending', index: true })
  status: string;

  @Prop({ type: String, default: null })
  rejectionReason: string;

  @Prop({ type: Date, default: null })
  approvedAt: Date;

  @Prop({ type: String, default: null })
  approvedBy: string; // SuperAdmin User ID who approved/rejected
}

export const SubscriptionPaymentSchema = SchemaFactory.createForClass(SubscriptionPayment);
