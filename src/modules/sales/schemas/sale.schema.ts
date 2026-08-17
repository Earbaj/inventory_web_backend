import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

/**
 * Sale Document Type Definition
 * POS বিক্রয় ইনভয়েস ডক্যুমেন্টের টাইপ ডেফিনেশন।
 */
export type SaleDocument = Sale & Document;

/**
 * Sale Item Embedded Schema
 * ইনভয়েসের ভিতরে প্রতিটি বিক্রীত পণ্যের বিবরণ (আইটেম আইডি, পরিমান, একক মূল্য, ছাড় ও মোট মূল্য)।
 */
@Schema({ _id: false })
export class SaleItemEmbedded {
  @Prop({ required: true })
  itemId: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true, default: 1 })
  quantity: number;

  @Prop({ required: true, default: 0 })
  unitPrice: number;

  @Prop({ default: 0 })
  discount: number;

  @Prop({ default: 'amount', enum: ['amount', 'percent'] })
  discountType: string;

  @Prop({ required: true, default: 0 })
  totalPrice: number;
}

export const SaleItemEmbeddedSchema = SchemaFactory.createForClass(SaleItemEmbedded);

/**
 * Sale Main Database Schema
 * মেমো/ইনভয়েস বিক্রয় ট্রানজেকশনের মূল ডাটাবেজ স্কিমা।
 */
@Schema({ timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } })
export class Sale {
  // ইউনিক ইনভয়েস সিরিয়াল নম্বর (যেমন: "INV-20260817-0001")
  @Prop({ required: true, index: true })
  invoiceNumber: string;

  // ক্রেতা কাস্টমারের আইডি (সাধারণ কাস্টমার হলে 'walk-in')
  @Prop({ required: true, default: 'walk-in' })
  customerId: string;

  // কাস্টমারের নাম
  @Prop({ required: true, default: 'Walk-in Customer' })
  customerName: string;

  // কাস্টমারের মোবাইল নম্বর
  @Prop({ default: '' })
  customerPhone: string;

  // বিক্রিত সকল পণ্যের তালিকা
  @Prop({ type: [SaleItemEmbeddedSchema], default: [] })
  items: SaleItemEmbedded[];

  // পণ্যের মোট মূল্য (ছাড়ের পূর্বে Subtotal)
  @Prop({ required: true, default: 0 })
  subtotal: number;

  // সার্বিক ইনভয়েস ছাড় (Overall Discount)
  @Prop({ default: 0 })
  discount: number;

  // সর্বমোট প্রদেয় মূল্য (Grand Total = Subtotal - Discount)
  @Prop({ required: true, default: 0 })
  grandTotal: number;

  // ক্যাশ প্রদানকৃত জমার পরিমাণ (Paid Amount)
  @Prop({ required: true, default: 0 })
  paidAmount: number;

  // অবশিষ্ট বাকি/বকেয়া (Due Amount = Grand Total - Paid Amount)
  @Prop({ required: true, default: 0 })
  dueAmount: number;

  // পরিশোধের স্ট্যাটাস: 'paid' (পূর্ণ পরিশোধ), 'partial' (আংশিক জমা), 'due' (সম্পূর্ণ বাকি)
  @Prop({ required: true, enum: ['paid', 'partial', 'due'], default: 'due' })
  paymentStatus: string;

  // বিক্রয়ের তারিখ ও সময়
  @Prop({ required: true, default: Date.now })
  date: Date;

  // যে ক্যাশিয়ার/স্টাফ মেমোটি তৈরি করেছেন তার আইডি
  @Prop({ required: true })
  createdBy: string;

  // ক্যাশিয়ারের নাম
  @Prop({ default: '' })
  createdByName: string;

  // পণ্য ফেরতের স্ট্যাটাস: 'none', 'partially_returned', 'fully_returned'
  @Prop({ required: true, enum: ['none', 'partially_returned', 'fully_returned'], default: 'none' })
  isReturned: string;

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

export const SaleSchema = SchemaFactory.createForClass(Sale);

/**
 * Virtual 'id' Property
 */
SaleSchema.virtual('id').get(function (this: Document) {
  return this._id.toHexString();
});
