import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type ReturnDocument = Return & Document;

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

@Schema({ timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } })
export class Return {
  @Prop({ required: true, default: 'walk-in' })
  customerId: string;

  @Prop({ required: true, type: MongooseSchema.Types.ObjectId, ref: 'Sale' })
  saleId: string;

  @Prop({ required: true })
  invoiceNumber: string;

  @Prop({ type: [ReturnedItemDetailSchema], default: [] })
  returnedItems: ReturnedItemDetail[];

  @Prop({ required: true, default: 0 })
  totalRefund: number;

  @Prop({ required: true, default: Date.now })
  date: Date;

  @Prop({ required: true })
  processedBy: string;
}

export const ReturnSchema = SchemaFactory.createForClass(Return);

ReturnSchema.virtual('id').get(function (this: Document) {
  return this._id.toHexString();
});
