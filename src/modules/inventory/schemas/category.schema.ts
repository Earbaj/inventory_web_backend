import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

/**
 * Product Category Document Type Definition
 * পণ্য ক্যাটাগরি ডক্যুমেন্টের জন্য টাইপ ডেফিনেশন।
 */
export type CategoryDocument = Category & Document;

/**
 * Category Database Schema
 * পণ্য গ্রুপিং করার ক্যাটাগরি স্কিমা (যেমন: Electronics, Grocery, Stationery)।
 */
@Schema({ timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } })
export class Category {
  // ক্যাটাগরির নাম
  @Prop({ required: true, trim: true })
  name: string;

  // ক্যাটাগরির বিবরণ
  @Prop({ default: '', trim: true })
  description: string;

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

export const CategorySchema = SchemaFactory.createForClass(Category);

/**
 * Virtual 'id' Property
 */
CategorySchema.virtual('id').get(function (this: Document) {
  return this._id.toHexString();
});
