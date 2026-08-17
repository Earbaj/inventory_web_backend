import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

/**
 * Customer Due Payment Document Type Definition
 * কাস্টমারের বাকি পরিশোধ পেমেন্ট ডক্যুমেন্টের জন্য টাইপ ডেফিনেশন।
 */
export type PaymentDocument = Payment & Document;

/**
 * Customer Due Payment Database Schema
 * কাস্টমারের বকেয়া জমা নেওয়ার ট্রানজেকশন রেকর্ড সংরক্ষণের ডাটাবেজ স্কিমা।
 */
@Schema({ timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } })
export class Payment {
  // যে কাস্টমার বাকি জমা দিয়েছেন তার আইডি (Foreign Key Reference)
  @Prop({ required: true, type: MongooseSchema.Types.ObjectId, ref: 'Customer' })
  customerId: string;

  // সংগৃহীত জমার পরিমাণ (টাকার অংক)
  @Prop({ required: true })
  amount: number;

  // মূল্য পরিশোধের মাধ্যম (যেমন: 'cash', 'bkash', 'nagad', 'bank')
  @Prop({ required: true, default: 'cash' })
  paymentMethod: string;

  // টাকা আদায়ের তারিখ ও সময়
  @Prop({ required: true, default: Date.now })
  date: Date;

  // যে ক্যাশিয়ার বা ইউজার টাকা গ্রহণ করেছেন তার নাম/আইডি
  @Prop({ required: true })
  receivedBy: string;

  // মাল্টি-টেন্যান্সি শপ আইডি
  @Prop({ required: true, type: String, index: true })
  shopId: string;

  // সফট-ডিলিট ফ্লাগ
  @Prop({ required: true, type: Boolean, default: false, index: true })
  isDeleted: boolean;

  // সফট-ডিলিটের তারিখ
  @Prop({ type: Date, default: null })
  deletedAt: Date;

  // ডিলিটকারী ইউজারের আইডি
  @Prop({ type: String, default: null })
  deletedBy: string;
}

export const PaymentSchema = SchemaFactory.createForClass(Payment);

/**
 * Virtual 'id' Property
 */
PaymentSchema.virtual('id').get(function (this: Document) {
  return this._id.toHexString();
});
