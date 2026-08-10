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

  @Prop({ required: true, enum: ['admin', 'manager'], default: 'manager' })
  role: string;

  @Prop({ type: ManagerPermissionsSchema, default: () => ({}) })
  permissions: ManagerPermissions;
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.virtual('uid').get(function (this: Document) {
  return this._id.toHexString();
});
