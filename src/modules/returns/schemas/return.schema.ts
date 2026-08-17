import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

/**
 * Return Document Type Definition
 * পণ্য ফেরত ও রিফান্ড ডক্যুমেন্টের জন্য টাইপ ডেফিনেশন।
 */
export type ReturnDocument = Return & Document;

/**
 * Returned Item Detail Embedded Schema
 * ইনভয়েস থেকে কি কি পণ্য কত পিস ফেরত দেওয়া হলো তার বিস্তারিত স্কিমা।
 */
@Schema({ _id: false })
export class ReturnedItemDetail {
  @Prop({ required: true })
  itemId: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true, default: 1 })
  quantity: number;

  @Prop({ required: true, default: 0 })
  refundAmountPerUnit: number;
}

export const ReturnedItemDetailSchema = SchemaFactory.createForClass(ReturnedItemDetail);

/**
 * Return Main Schema
 * পণ্য ফেরত ও ইনভেন্টরিতে স্টক রি-স্টক (Restock) করার সেলস রিটার্ন স্কিমা।
 */
@Schema({ timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } })
export class Return {
  // ফেরত প্রদানকারী কাস্টমারের আইডি
  @Prop({ required: true, default: 'walk-in' })
  customerId: string;

  // মূল সেলস ট্রানজেকশনের আইডি (Sale Reference)
  @Prop({ required: true, type: MongooseSchema.Types.ObjectId, ref: 'Sale' })
  saleId: string;

  // ইনভয়েস নম্বর (যেমন: "INV-20260817-0001")
  @Prop({ required: true })
  invoiceNumber: string;

  // ফেরত দেওয়া পণ্যসমূহের তালিকা
  @Prop({ type: [ReturnedItemDetailSchema], default: [] })
  returnedItems: ReturnedItemDetail[];

  // সর্বমোট রিফান্ড ফেরত মূল্য (Total Refund Amount)
  @Prop({ required: true, default: 0 })
  totalRefund: number;

  // পণ্য ফেরতের তারিখ
  @Prop({ required: true, default: Date.now })
  date: Date;

  // ফেরত প্রসেসকারী স্টাফ/অ্যাডমিনের আইডি
  @Prop({ required: true })
  processedBy: string;

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

export const ReturnSchema = SchemaFactory.createForClass(Return);

/**
 * Virtual 'id' Property
 */
ReturnSchema.virtual('id').get(function (this: Document) {
  return this._id.toHexString();
});
