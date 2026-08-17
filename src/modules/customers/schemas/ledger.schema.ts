import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

/**
 * Customer Ledger Document Type Definition
 * কাস্টমারের সমস্ত কেনাবেচা, জমা, এবং ফেরত হিসাবের লেজার স্টেটমেন্ট ডক্যুমেন্ট টাইপ।
 */
export type LedgerDocument = Ledger & Document;

/**
 * Customer Ledger Schema
 * কাস্টমারের প্রতিটি লেনদেনের স্টেটমেন্ট হিস্ট্রি (হিসাবের খাতা) সংরক্ষণের ডাটাবেজ স্কিমা।
 */
@Schema({ timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } })
export class Ledger {
  // কোন কাস্টমারের লেনদেন তা নির্দেশকারী Foreign Key (Customer Reference)
  @Prop({ required: true, type: MongooseSchema.Types.ObjectId, ref: 'Customer' })
  customerId: string;

  // লেনদেনের ধরণ: 'sale' (কেনাবেচা), 'payment' (বাকি পরিশোধ), 'return' (পণ্য ফেরত), 'opening' (প্রাথমিক জের)
  @Prop({ required: true, enum: ['sale', 'payment', 'return', 'opening'] })
  type: string;

  // মূল লেনদেনের ইনভয়েস/পেমেন্ট/রিটার্ন রেকর্ডের আইডি (Ref ID)
  @Prop({ required: true })
  referenceId: string;

  // লেনদেনের তারিখ ও সময়
  @Prop({ required: true, default: Date.now })
  date: Date;

  // লেনদেনের সংক্ষিপ্ত বিবরণ (যেমন: "Invoice #INV-20260817-0001")
  @Prop({ required: true })
  description: string;

  // এই লেনদেনের টাকার পরিমাণ
  @Prop({ required: true })
  amount: number;

  // এই লেনদেনের পূর্বে কাস্টমারের ব্যালেন্স কত ছিল
  @Prop({ required: true })
  previousBalance: number;

  // এই লেনদেনের পর কাস্টমারের নতুন ব্যালেন্স কত হলো
  @Prop({ required: true })
  newBalance: number;

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

export const LedgerSchema = SchemaFactory.createForClass(Ledger);

/**
 * Virtual 'id' Property
 */
LedgerSchema.virtual('id').get(function (this: Document) {
  return this._id.toHexString();
});
