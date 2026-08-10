import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type LedgerDocument = Ledger & Document;

@Schema({ timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } })
export class Ledger {
  @Prop({ required: true, type: MongooseSchema.Types.ObjectId, ref: 'Customer' })
  customerId: string;

  @Prop({ required: true, enum: ['sale', 'payment', 'return', 'opening'] })
  type: string;

  @Prop({ required: true })
  referenceId: string;

  @Prop({ required: true, default: Date.now })
  date: Date;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  amount: number;

  @Prop({ required: true })
  previousBalance: number;

  @Prop({ required: true })
  newBalance: number;
}

export const LedgerSchema = SchemaFactory.createForClass(Ledger);

LedgerSchema.virtual('id').get(function (this: Document) {
  return this._id.toHexString();
});
