import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ExpenseDocument = Expense & Document;

/**
 * Shop Expense Schema
 * দোকানের দৈনন্দিন পরিচালনা খরচ (ভাড়া, বিল, বেতন, যাতায়াত) ট্র্যাকিং করার স্কিমা।
 */
@Schema({ timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } })
export class Expense {
  @Prop({ required: true, type: String, index: true })
  shopId: string;

  @Prop({ required: true, index: true, default: 'misc' })
  category: string; // e.g. 'rent', 'utility', 'salary', 'transport', 'misc'

  @Prop({ required: true })
  title: string;

  @Prop({ required: true, min: 0.01 })
  amount: number;

  @Prop({ required: true, default: Date.now, index: true })
  date: Date;

  @Prop({ type: String, default: '' })
  note: string;

  @Prop({ required: true })
  createdBy: string;

  @Prop({ required: true, type: Boolean, default: false, index: true })
  isDeleted: boolean;

  @Prop({ type: Date, default: null })
  deletedAt: Date;

  @Prop({ type: String, default: null })
  deletedBy: string;
}

export const ExpenseSchema = SchemaFactory.createForClass(Expense);

ExpenseSchema.virtual('id').get(function (this: Document) {
  return this._id.toHexString();
});
