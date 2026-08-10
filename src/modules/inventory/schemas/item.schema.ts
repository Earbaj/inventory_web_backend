import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ItemDocument = Item & Document;

@Schema({ timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } })
export class Item {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ default: '', trim: true })
  sku: string;

  @Prop({ default: 'General', trim: true })
  category: string;

  @Prop({ required: true, default: 0 })
  sellPrice: number;

  @Prop({ required: true, default: 0 })
  buyPrice: number;

  @Prop({ required: true, default: 0 })
  stockQuantity: number;

  @Prop({ default: 'pcs', trim: true })
  unit: string;

  @Prop({ required: true, default: 5 })
  lowStockThreshold: number;
}

export const ItemSchema = SchemaFactory.createForClass(Item);

ItemSchema.virtual('id').get(function (this: Document) {
  return this._id.toHexString();
});
