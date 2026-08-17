import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type PaymentDocument = Payment & Document;

@Schema({ timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } })
export class Payment {
  @Prop({ required: true, type: MongooseSchema.Types.ObjectId, ref: 'Customer' })
  customerId: string;

  @Prop({ required: true })
  amount: number;

  @Prop({ required: true, default: 'cash' })
  paymentMethod: string;

  @Prop({ required: true, default: Date.now })
  date: Date;

  @Prop({ required: true })
  receivedBy: string;

  // Multi-Tenancy Shop ID
  @Prop({ required: true, type: String, index: true })
  shopId: string;

  // Soft-Delete Recycle Bin Fields
  @Prop({ required: true, type: Boolean, default: false, index: true })
  isDeleted: boolean;

  @Prop({ type: Date, default: null })
  deletedAt: Date;

  @Prop({ type: String, default: null })
  deletedBy: string;
}

export const PaymentSchema = SchemaFactory.createForClass(Payment);

PaymentSchema.virtual('id').get(function (this: Document) {
  return this._id.toHexString();
});
