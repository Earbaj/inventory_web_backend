import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

/**
 * Customer Document Type Definition
 * Mongoose ডাটাবেজে কাস্টমার অবজেক্টকে টাইপ-সেফ রাখার জন্য টাইপ ডেফিনেশন।
 */
export type CustomerDocument = Customer & Document;

/**
 * Customer Main Schema
 * শপের কাস্টমারদের নাম, মোবাইল নম্বর, ঠিকানা, ওপেনিং ব্যালেন্স ও ক্লোজিং ব্যালেন্স সংরক্ষণের মূল ডাটাবেজ স্কিমা।
 */
@Schema({ timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } })
export class Customer {
  // কাস্টমারের নাম
  @Prop({ required: true, trim: true })
  name: string;

  // কাস্টমারের মোবাইল নম্বর
  @Prop({ default: '', trim: true })
  phone: string;

  // কাস্টমারের ঠিকানা
  @Prop({ default: '', trim: true })
  address: string;

  // কাস্টমার যোগ করার সময়ের প্রাথমিক ব্যালেন্স (পজিটিভ = অগ্রিম জমা, নেগেটিভ = বাকি/বকেয়া)
  @Prop({ required: true, default: 0 })
  openingBalance: number;

  // কাস্টমারের বর্তমান সর্বশেষ ক্লোজিং ব্যালেন্স (প্রতিটি কেনাবেচা বা বাকি পরিশোধের পর অটোমেটিক আপডেট হয়)
  @Prop({ required: true, default: 0 })
  closingBalance: number;

  // মাল্টি-টেন্যান্সি শপ আইডি (কোন শপের কাস্টমার তা ট্র্যাক রাখার জন্য)
  @Prop({ required: true, type: String, index: true })
  shopId: string;

  // সফট-ডিলিট ফ্লাগ (ভুলবশত ডিলিট হলে রিসাইকেল বিনে জমা রাখা এবং পরবর্তীতে রিস্টোর করার জন্য)
  @Prop({ required: true, type: Boolean, default: false, index: true })
  isDeleted: boolean;

  // কাস্টমার সফট-ডিলিট করার সময়
  @Prop({ type: Date, default: null })
  deletedAt: Date;

  // যে ইউজার কাস্টমারকে সফট-ডিলিট করেছেন তার আইডি
  @Prop({ type: String, default: null })
  deletedBy: string;
}

export const CustomerSchema = SchemaFactory.createForClass(Customer);

/**
 * Virtual 'id' Property
 * ফ্রন্টএন্ড সহজে ব্যবহার করার জন্য MongoDB-এর _id কে 'id' নামে এক্সপোজ করে।
 */
CustomerSchema.virtual('id').get(function (this: Document) {
  return this._id.toHexString();
});
