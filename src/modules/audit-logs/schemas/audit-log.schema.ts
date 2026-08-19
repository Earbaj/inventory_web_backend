import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type AuditLogDocument = AuditLog & Document;

/**
 * Audit Log Schema
 * শপ ও সিকিউরিটি অ্যাক্টিভিটি অডিট লগ রাখার জন্য মঙ্গুজের স্কিমা।
 */
@Schema({ timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } })
export class AuditLog {
  @Prop({ required: true, type: String, index: true })
  shopId: string;

  @Prop({ required: true, type: String, index: true })
  userId: string;

  @Prop({ required: true })
  userName: string;

  @Prop({ required: true })
  userRole: string;

  @Prop({ required: true, index: true })
  action: string; // e.g. 'CREATE_USER', 'UPDATE_PERMISSIONS', 'STOCK_ADJUSTMENT', 'RESTORE_TRASH', 'DELETE_ITEM'

  @Prop({ required: true, index: true })
  entityType: string; // e.g. 'user', 'item', 'customer', 'sale', 'trash'

  @Prop({ type: String, default: null })
  entityId: string;

  @Prop({ type: Object, default: {} })
  details: Record<string, any>;

  @Prop({ required: true, default: Date.now, index: true })
  date: Date;
}

export const AuditLogSchema = SchemaFactory.createForClass(AuditLog);

AuditLogSchema.virtual('id').get(function (this: Document) {
  return this._id.toHexString();
});
