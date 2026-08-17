import { Injectable, NotFoundException, BadRequestException, ForbiddenException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SubscriptionPayment, SubscriptionPaymentDocument } from './schemas/subscription-payment.schema';
import { User, UserDocument } from '../auth/schemas/user.schema';
import { SubmitManualPaymentDto, RejectPaymentDto } from './dto/subscription.dto';

/**
 * Subscriptions & Manual bKash Payments Service
 * প্ল্যাটফর্ম সাবস্ক্রিপশন প্যাকেজ, ম্যানুয়াল বিকাশ/নগদ পেমেন্ট জমা, সুপার অ্যাডমিন রিভিউ এবং সাবস্ক্রিপশন মেয়াদের ডেট এক্সটেনশন সার্ভিস।
 */
@Injectable()
export class SubscriptionsService {
  private readonly logger = new Logger(SubscriptionsService.name);

  constructor(
    @InjectModel(SubscriptionPayment.name) private subscriptionPaymentModel: Model<SubscriptionPaymentDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  /**
   * 1. Public Subscription Package Catalog
   * প্ল্যাটফর্মের প্যাকেজ সমূহের বিবরণ (Free Starter, Premium Monthly, Premium Yearly)।
   */
  getPackages() {
    return [
      {
        id: 'free',
        name: 'Free Starter',
        price: 0,
        currency: 'BDT',
        durationDays: 0,
        limits: {
          customers: 1,
          managers: 1,
          items: 5,
          sales: 5,
        },
        description: 'ফ্রি স্টার্টার টিয়ার। সর্বোচ্চ ১টি কাস্টমার, ১টি ম্যানেজার, ৫টি আইটেম ও ৫টি বিক্রির সুবিধা।',
      },
      {
        id: 'premium_monthly',
        name: 'Premium Monthly',
        price: 1000,
        currency: 'BDT',
        durationDays: 30,
        limits: {
          customers: 'unlimited',
          managers: 'unlimited',
          items: 'unlimited',
          sales: 'unlimited',
        },
        description: '৩০ দিনের জন্য আনলিমিটেড অল-এক্সেস প্রিমিয়াম প্যাকেজ।',
      },
      {
        id: 'premium_yearly',
        name: 'Premium Yearly (Save 17%)',
        price: 10000,
        currency: 'BDT',
        durationDays: 365,
        limits: {
          customers: 'unlimited',
          managers: 'unlimited',
          items: 'unlimited',
          sales: 'unlimited',
        },
        description: '১ বছরের (৩৬৫ দিন) জন্য ছাড়কৃত প্রিমিয়াম প্যাকেজ।',
      },
    ];
  }

  /**
   * 2. Get Manual Payment Instructions & Merchant Accounts Info
   * টাকা পাঠানোর জন্য মার্চেন্ট বিকাশ/নগদ নম্বর ও নির্দেশনাসমূহ।
   */
  getPaymentInfo() {
    return {
      bkashNumber: process.env.BKASH_MERCHANT_NUMBER || '01700000000',
      nagadNumber: process.env.NAGAD_MERCHANT_NUMBER || '01700000000',
      bankDetails: {
        bankName: 'Dutch Bangla Bank Ltd',
        accountName: 'Keeper POS Software Solutions',
        accountNumber: '123-456-7890123',
        branch: 'Motijheel, Dhaka',
      },
      instructions: [
        '১. প্রদানকৃত বিকাশ/নগদ মার্চেন্ট অথবা পার্সোনাল নম্বরে সঠিক সাবস্ক্রিপশন ফি সেন্ড মানি করুন।',
        '২. কনফার্মেশন মেসেজে প্রাপ্ত Transaction ID (TrxID) কপি করুন।',
        '৩. ফর্মটিতে TrxID ও আপনার বিকাশ/নগদ নম্বর সাবমিট করুন।',
        '৪. সুপার অ্যাডমিন ট্রানজেকশন ভেরিফাই করে আপনার প্রিমিয়াম সাবস্ক্রিপশন চালু করে দেবে।',
      ],
    };
  }

  /**
   * 3. Submit Manual Subscription Payment Request (Shop Admin Only)
   * শপ ওনার পেমেন্ট সম্পন্ন করে TrxID ও মোবাইল নম্বর সাবমিট করবেন।
   */
  async submitManualPayment(dto: SubmitManualPaymentDto, user: any) {
    if (user.role !== 'admin' && user.role !== 'superadmin') {
      throw new ForbiddenException('Only Shop Admins can purchase subscription packages');
    }

    const payment = new this.subscriptionPaymentModel({
      userId: user.uid || user.id,
      shopId: user.shopId || user.uid,
      packageId: dto.packageId,
      amount: dto.amount,
      paymentMethod: dto.paymentMethod,
      trxId: dto.trxId.trim().toUpperCase(),
      accountNo: dto.accountNo.trim(),
      status: 'pending',
    });

    const saved = await payment.save();
    this.logger.log(`New Manual Subscription Payment Request submitted: ID ${saved._id} by Shop ${user.shopId}`);

    return {
      message: 'Subscription payment request submitted successfully. SuperAdmin will review and approve.',
      payment: saved,
    };
  }

  /**
   * 4. Get Payment Request History for Current Shop Owner
   */
  async getMyPaymentRequests(user: any) {
    return this.subscriptionPaymentModel
      .find({ shopId: user.shopId })
      .sort({ createdAt: -1 })
      .exec();
  }

  /**
   * 5. Get All Pending Payment Requests (SuperAdmin Only)
   * সুপার অ্যাডমিনের পর্যালোচনার জন্য পেন্ডিং পেমেন্ট রিকোয়েস্টের তালিকা।
   */
  async getPendingPayments(user: any) {
    if (user.role !== 'superadmin') {
      throw new ForbiddenException('Only SuperAdmin can view pending subscription payments');
    }

    const pendingPayments = await this.subscriptionPaymentModel
      .find({ status: 'pending' })
      .sort({ createdAt: 1 })
      .exec();

    // শপ মালিকের ইমেইল ও নাম যুক্ত করা
    const result = [];
    for (const payment of pendingPayments) {
      const shopOwner = await this.userModel.findById(payment.userId).select('name email subscriptionTier subscriptionExpiresAt');
      result.push({
        ...payment.toObject(),
        shopOwner: shopOwner ? { name: shopOwner.name, email: shopOwner.email } : null,
      });
    }

    return result;
  }

  /**
   * 6. SuperAdmin Approves Subscription Payment Request & Extends Expiry Date
   * পেমেন্ট এপ্রুভাল লজিক:
   * - পেমেন্ট স্ট্যাটাস 'approved' করা।
   * - ইউজারের সাবস্ক্রিপশন মেয়াদের শেষ তারিখের সাথে ৩০ দিন বা ৩৬৫ দিন যোগ করা।
   * - শপের সকল ইউজার ও ম্যানেজারের টিয়ার 'premium' এ উন্নীত করা।
   */
  async approvePayment(paymentId: string, superAdminUser: any) {
    if (superAdminUser.role !== 'superadmin') {
      throw new ForbiddenException('Only SuperAdmin can approve subscription payments');
    }

    const payment = await this.subscriptionPaymentModel.findById(paymentId);
    if (!payment || payment.status !== 'pending') {
      throw new BadRequestException('Invalid or already processed payment request');
    }

    const shopOwner = await this.userModel.findById(payment.userId);
    if (!shopOwner) {
      throw new NotFoundException('Shop Owner account not found');
    }

    // প্যাকেজ অনুযায়ী মেয়াদের দিন সংখ্যা নির্ধারণ
    let addedDays = 30; // ডিফল্ট মাসভিত্তিক
    if (payment.packageId === 'premium_yearly') {
      addedDays = 365;
    }

    // মেয়াদী তারিখ হিসাব: পূর্বে মেয়াদ বাকি থাকলে তার সাথে যোগ হবে, নতুবা বর্তমান সময় থেকে শুরু হবে
    let currentExpiry = new Date();
    if (shopOwner.subscriptionExpiresAt && new Date(shopOwner.subscriptionExpiresAt) > new Date()) {
      currentExpiry = new Date(shopOwner.subscriptionExpiresAt);
    }

    const newExpiry = new Date(currentExpiry.getTime() + addedDays * 24 * 60 * 60 * 1000);

    // শপ ওনারের সাবস্ক্রিপশন প্রিমিয়াম এ আপগ্রেড এবং মেয়াদ আপডেট
    shopOwner.subscriptionTier = 'premium';
    shopOwner.subscriptionExpiresAt = newExpiry;
    await shopOwner.save();

    // এই শপের আওতাধীন সকল ম্যানেজারের সাবস্ক্রিপশন প্রিমিয়ামে আপগ্রেড করা
    await this.userModel.updateMany(
      { shopId: shopOwner.shopId },
      { subscriptionTier: 'premium', subscriptionExpiresAt: newExpiry }
    );

    // পেমেন্ট স্ট্যাটাস এপ্রুভড হিসেবে আপডেট
    payment.status = 'approved';
    payment.approvedAt = new Date();
    payment.approvedBy = superAdminUser.uid || superAdminUser.id;
    await payment.save();

    this.logger.log(`Subscription Approved for Shop ${shopOwner.shopId} until ${newExpiry.toISOString()}`);

    return {
      message: 'Subscription payment approved successfully',
      subscriptionTier: shopOwner.subscriptionTier,
      expiresAt: newExpiry,
      payment,
    };
  }

  /**
   * 7. SuperAdmin Rejects Subscription Payment Request
   */
  async rejectPayment(paymentId: string, dto: RejectPaymentDto, superAdminUser: any) {
    if (superAdminUser.role !== 'superadmin') {
      throw new ForbiddenException('Only SuperAdmin can reject subscription payments');
    }

    const payment = await this.subscriptionPaymentModel.findById(paymentId);
    if (!payment || payment.status !== 'pending') {
      throw new BadRequestException('Invalid or already processed payment request');
    }

    payment.status = 'rejected';
    payment.rejectionReason = dto.reason;
    payment.approvedBy = superAdminUser.uid || superAdminUser.id;
    await payment.save();

    return {
      message: 'Subscription payment request rejected',
      payment,
    };
  }
}
