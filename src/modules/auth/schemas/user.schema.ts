import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

/**
 * User Document Type Definition for Mongoose
 * Mongoose ডাটাবেজে ইউজার ডক্যুমেন্টকে টাইপ-সেফ রাখার জন্য এই টাইপটি ব্যবহার করা হয়।
 */
export type UserDocument = User & Document;

/**
 * Manager Permissions Embedded Schema
 * ম্যানেজার ব্যবহারকারীদের জন্য বিশেষ পারমিশন সেট করার স্কিমা।
 */
@Schema({ _id: false })
export class ManagerPermissions {
  // সেলস রিটার্ন বা ক্যাশব্যাক প্রসেস করার পারমিশন
  @Prop({ default: false })
  canProcessReturn: boolean;

  // এক্সেল ফাইল ডিক্রিজ বা রিপোর্ট এক্সপোর্ট করার পারমিশন
  @Prop({ default: false })
  canExportExcel: boolean;

  // কাস্টমার তথ্য এডিট বা নতুন কাস্টমার যোগ করার পারমিশন
  @Prop({ default: false })
  canEditCustomers: boolean;

  // প্রোডাক্টের কেনাদাম (Buy Price / Cost) দেখার পারমিশন
  @Prop({ default: false })
  canViewBuyPrice: boolean;
}

export const ManagerPermissionsSchema = SchemaFactory.createForClass(ManagerPermissions);

/**
 * User Main Database Schema
 * সিস্টেমের সকল ইউজার (SuperAdmin, Admin, Manager) সংরক্ষণের মূল MongoDB স্কিমা।
 */
@Schema({ timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } })
export class User {
  // ইউজারের ইউনিক ইমেইল অ্যাড্রেস (লগইনের জন্য ব্যবহার করা হয়)
  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email: string;

  // ইউজারের হ্যাশ করা সুরক্ষিত পাসওয়ার্ড (bcrypt দিয়ে এনক্রিপ্ট করা)
  @Prop({ required: true })
  passwordHash: string;

  // ইউজারের নাম (যেমন: শপ ওনারের নাম বা ম্যানেজারের নাম)
  @Prop({ required: true, trim: true })
  name: string;

  // রোল আর্কিটেকচার: 'superadmin' (প্ল্যাটফর্মের মালিক), 'admin' (শপের মালিক), 'manager' (শপের কর্মী)
  @Prop({ required: true, enum: ['superadmin', 'admin', 'manager'], default: 'admin' })
  role: string;

  // সাবস্ক্রিপশন প্যাকেজ টিয়ার: 'free' (ডিফল্ট সীমাবদ্ধ প্যাকেজ), 'basic', 'premium' (আনলিমিটেড প্যাকেজ)
  @Prop({ required: true, enum: ['free', 'basic', 'premium'], default: 'free' })
  subscriptionTier: string;

  // প্রিমিয়াম বা বেসিক সাবস্ক্রিপশনের মেয়াদ শেষ হওয়ার তারিখ (Expiry Timestamp)
  @Prop({ type: Date, default: null })
  subscriptionExpiresAt: Date;

  // মাল্টি-টেন্যান্সি শপ আইডি (Admin-এর ক্ষেত্রে নিজের _id এবং Manager-এর ক্ষেত্রে ক্রিয়েটকারী Admin-এর _id)
  @Prop({ type: String, default: null, index: true })
  shopId: string;

  // পাসওয়ার্ড রিকভারি OTP কোড (৬ ডিজিটের ওটিপি কোড)
  @Prop({ type: String, default: null })
  resetPasswordCode: string;

  // পাসওয়ার্ড রিকভারি ওটিপি মেয়াদের তারিখ (১৫ মিনিট মেয়াদী)
  @Prop({ type: Date, default: null })
  resetPasswordExpiresAt: Date;

  // ম্যানেজারের নির্দিষ্ট পারমিশন অবজেক্ট
  @Prop({ type: ManagerPermissionsSchema, default: () => ({}) })
  permissions: ManagerPermissions;
}

export const UserSchema = SchemaFactory.createForClass(User);

/**
 * Virtual 'uid' Property
 * Frontend এ স্বাচ্ছন্দ্যে আইডি পাওয়ার জন্য MongoDB-এর _id কে 'uid' ভার্চুয়াল ফিল্ড হিসেবে পাওয়া যাবে।
 */
UserSchema.virtual('uid').get(function (this: Document) {
  return this._id.toHexString();
});
