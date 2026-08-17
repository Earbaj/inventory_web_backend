import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ _id: false })
export class ManagerPermissions {
  @Prop({ default: false })
  canProcessReturn: boolean;

  @Prop({ default: false })
  canExportExcel: boolean;

  @Prop({ default: false })
  canEditCustomers: boolean;

  @Prop({ default: false })
  canViewBuyPrice: boolean;
}

export const ManagerPermissionsSchema = SchemaFactory.createForClass(ManagerPermissions);

@Schema({ timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } })
export class User {
  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email: string;

  @Prop({ required: true })
  passwordHash: string;

  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, enum: ['superadmin', 'admin', 'manager'], default: 'admin' })
  role: string;

  // Subscription plan tier: 'free' (default limits), 'basic', 'premium' (unlimited)
  @Prop({ required: true, enum: ['free', 'basic', 'premium'], default: 'free' })
  subscriptionTier: string;

  // Expiration timestamp for active premium/basic subscription
  @Prop({ type: Date, default: null })
  subscriptionExpiresAt: Date;

  // Multi-Tenancy Shop Identifier (Admin _id for shop owner, Creator Admin _id for managers)
  @Prop({ type: String, default: null, index: true })
  shopId: string;

  // 6-digit OTP code for password recovery
  @Prop({ type: String, default: null })
  resetPasswordCode: string;

  // Expiration timestamp for password recovery OTP
  @Prop({ type: Date, default: null })
  resetPasswordExpiresAt: Date;

  @Prop({ type: ManagerPermissionsSchema, default: () => ({}) })
  permissions: ManagerPermissions;
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.virtual('uid').get(function (this: Document) {
  return this._id.toHexString();
});
