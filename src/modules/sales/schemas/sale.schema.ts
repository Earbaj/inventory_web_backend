import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type SaleDocument = Sale & Document;

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

@Schema({ timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } })
export class Sale {
  @Prop({ required: true, index: true })
  invoiceNumber: string;

  @Prop({ required: true, default: 'walk-in' })
  customerId: string;

  @Prop({ required: true, default: 'Walk-in Customer' })
  customerName: string;

  @Prop({ default: '' })
  customerPhone: string;

  @Prop({ type: [SaleItemEmbeddedSchema], default: [] })
  items: SaleItemEmbedded[];

  @Prop({ required: true, default: 0 })
  subtotal: number;

  @Prop({ default: 0 })
  discount: number;

  @Prop({ required: true, default: 0 })
  grandTotal: number;

  @Prop({ required: true, default: 0 })
  paidAmount: number;

  @Prop({ required: true, default: 0 })
  dueAmount: number;

  @Prop({ required: true, enum: ['paid', 'partial', 'due'], default: 'due' })
  paymentStatus: string;

  @Prop({ required: true, default: Date.now })
  date: Date;

  @Prop({ required: true })
  createdBy: string;

  @Prop({ default: '' })
  createdByName: string;

  @Prop({ required: true, enum: ['none', 'partially_returned', 'fully_returned'], default: 'none' })
  isReturned: string;

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

export const SaleSchema = SchemaFactory.createForClass(Sale);

SaleSchema.virtual('id').get(function (this: Document) {
  return this._id.toHexString();
});
