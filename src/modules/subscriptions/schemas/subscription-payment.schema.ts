import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

/**
 * Subscription Payment Document Type Definition
 * ম্যানুয়াল বিকাশ/নগদ পেমেন্ট রিকোয়েস্ট ডক্যুমেন্টের টাইপ ডেফিনেশন।
 */
export type SubscriptionPaymentDocument = SubscriptionPayment & Document;

/**
 * Subscription Payment Database Schema
 * শপ ওনার কর্তৃক জমা দেওয়া ম্যানুয়াল বিকাশ/নগদ পেমেন্ট ট্রানজেকশন (TrxID) ডাটাবেজ স্কিমা।
 */
@Schema({ timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } })
export class SubscriptionPayment {
  // পেমেন্ট প্রদানকারী শপ ওনারের ইউজার আইডি
  @Prop({ required: true, type: String, index: true })
  userId: string;

  // পেমেন্ট প্রদানকারী শপ আইডি
  @Prop({ required: true, type: String, index: true })
  shopId: string;

  // নির্বাচিত সাবস্ক্রিপশন প্যাকেজ আইডি ('free', 'premium_monthly', 'premium_yearly')
  @Prop({ required: true, enum: ['free', 'premium_monthly', 'premium_yearly'] })
  packageId: string;

  // টাকা জমার পরিমাণ (টাকা / BDT)
  @Prop({ required: true, type: Number })
  amount: number;

  // পেমেন্ট মেথড ('manual_bkash', 'manual_nagad', 'manual_bank')
  @Prop({ required: true, enum: ['manual_bkash', 'manual_nagad', 'manual_bank'] })
  paymentMethod: string;

  // ইউজার কর্তৃক জমাদানকৃত বিকাশ/নগদ ট্রানজেকশন আইডি (TrxID)
  @Prop({ required: true, trim: true })
  trxId: string;

  // যে বিকাশ/নগদ নম্বর থেকে টাকা পাঠানো হয়েছে সেই মোবাইল নম্বর
  @Prop({ required: true, trim: true })
  accountNo: string;

  // পেমেন্টের বর্তমান স্ট্যাটাস: 'pending' (সুপার অ্যাডমিনের এপ্রুভালের অপেক্ষায়), 'approved', 'rejected'
  @Prop({ required: true, enum: ['pending', 'approved', 'rejected'], default: 'pending', index: true })
  status: string;

  // রিজেক্ট করা হলে তার কারণ (Rejection Reason)
  @Prop({ type: String, default: null })
  rejectionReason: string;

  // সুপার অ্যাডমিন কর্তৃক এপ্রুভ করার সময়
  @Prop({ type: Date, default: null })
  approvedAt: Date;

  // এপ্রুভকারী বা রিজেক্টকারী সুপার অ্যাডমিনের আইডি
  @Prop({ type: String, default: null })
  approvedBy: string;
}

export const SubscriptionPaymentSchema = SchemaFactory.createForClass(SubscriptionPayment);
