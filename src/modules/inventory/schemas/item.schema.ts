import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

/**
 * Product Item Document Type Definition
 * Mongoose ডাটাবেজে ইনভেন্টরি আইটেম অবজেক্টকে টাইপ-সেফ রাখার জন্য টাইপ ডেফিনেশন।
 */
export type ItemDocument = Item & Document;

/**
 * Product Item Database Schema
 * ইনভেন্টরি ক্যাটালগের পণ্যের নাম, SKU, ক্যাটাগরি, বিক্রয়মূল্য, কেনামূল্য, স্টক এবং অ্যালার্টের ডাটাবেজ স্কিমা।
 */
@Schema({ timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } })
export class Item {
  // পণ্যের নাম (যেমন: "Wireless Optical Mouse")
  @Prop({ required: true, trim: true })
  name: string;

  // পণ্যের কোড বা SKU
  @Prop({ default: '', trim: true })
  sku: string;

  // পণ্যের ক্যাটাগরি (যেমন: "Electronics")
  @Prop({ default: 'General', trim: true })
  category: string;

  // পণ্যের বিক্রয় মূল্য (Sell Price)
  @Prop({ required: true, default: 0 })
  sellPrice: number;

  // পণ্যের কেনা দাম (Cost / Buy Price)
  @Prop({ required: true, default: 0 })
  buyPrice: number;

  // স্টকে কত পিস পণ্য মজুদ আছে
  @Prop({ required: true, default: 0 })
  stockQuantity: number;

  // পণ্যের একক (যেমন: "pcs", "kg", "box")
  @Prop({ default: 'pcs', trim: true })
  unit: string;

  // কম স্টকের সতর্কবার্তা (Low Stock Warning Threshold) সীমা
  @Prop({ required: true, default: 5 })
  lowStockThreshold: number;

  // মাল্টি-টেন্যান্সি শপ আইডি
  @Prop({ required: true, type: String, index: true })
  shopId: string;

  // সফট-ডিলিট ফ্লাগ (ডাটা মুছে না ফেলে রিসাইকেল বিনে স্থানান্তরের জন্য)
  @Prop({ required: true, type: Boolean, default: false, index: true })
  isDeleted: boolean;

  // সফট-ডিলিটের সময়
  @Prop({ type: Date, default: null })
  deletedAt: Date;

  // ডিলিটকারী ইউজারের আইডি
  @Prop({ type: String, default: null })
  deletedBy: string;
}

export const ItemSchema = SchemaFactory.createForClass(Item);

/**
 * Virtual 'id' Property
 */
ItemSchema.virtual('id').get(function (this: Document) {
  return this._id.toHexString();
});
