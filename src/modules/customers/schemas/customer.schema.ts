import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CustomerDocument = Customer & Document;

@Schema({ timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } })
export class Customer {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ default: '', trim: true })
  phone: string;

  @Prop({ default: '', trim: true })
  address: string;

  @Prop({ required: true, default: 0 })
  openingBalance: number;

  @Prop({ required: true, default: 0 })
  closingBalance: number;
}

export const CustomerSchema = SchemaFactory.createForClass(Customer);

CustomerSchema.virtual('id').get(function (this: Document) {
  return this._id.toHexString();
});
