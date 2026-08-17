import { Injectable, NotFoundException, BadRequestException, ForbiddenException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SubscriptionPayment, SubscriptionPaymentDocument } from './schemas/subscription-payment.schema';
import { User, UserDocument } from '../auth/schemas/user.schema';
import { SubmitManualPaymentDto, RejectPaymentDto } from './dto/subscription.dto';

@Injectable()
export class SubscriptionsService {
  private readonly logger = new Logger(SubscriptionsService.name);

  constructor(
    @InjectModel(SubscriptionPayment.name) private subscriptionPaymentModel: Model<SubscriptionPaymentDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  /**
   * Public Subscription Package Catalog
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
        description: 'Starter tier with strict basic usage limits.',
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
        description: 'Full unlimited access for 30 days.',
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
        description: 'Full unlimited access for 1 year with discounted price.',
      },
    ];
  }

  /**
   * Get Manual Payment Instructions & bKash Merchant Info
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
        '1. Send exact package fee to the provided bKash / Nagad Personal/Merchant Send Money number.',
        '2. Copy the Transaction ID (TrxID) received in confirmation SMS.',
        '3. Fill out the payment request form with your TrxID and Sender Account Number.',
        '4. SuperAdmin will verify your payment and activate your Premium Subscription.',
      ],
    };
  }

  /**
   * Submit a Manual Subscription Payment Request (Shop Admin)
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
   * Get Payment Request History for Current Shop Owner
   */
  async getMyPaymentRequests(user: any) {
    return this.subscriptionPaymentModel
      .find({ shopId: user.shopId })
      .sort({ createdAt: -1 })
      .exec();
  }

  /**
   * Get All Pending Payment Requests (SuperAdmin Only)
   */
  async getPendingPayments(user: any) {
    if (user.role !== 'superadmin') {
      throw new ForbiddenException('Only SuperAdmin can view pending subscription payments');
    }

    const pendingPayments = await this.subscriptionPaymentModel
      .find({ status: 'pending' })
      .sort({ createdAt: 1 })
      .exec();

    // Populate user/shop details
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
   * SuperAdmin Approves Subscription Payment Request & Upgrades Expiry
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

    // Determine extension days based on package
    let addedDays = 30; // Default monthly
    if (payment.packageId === 'premium_yearly') {
      addedDays = 365;
    }

    // Expiration Calculation Logic: Extend from existing active expiry if in future, else from NOW
    let currentExpiry = new Date();
    if (shopOwner.subscriptionExpiresAt && new Date(shopOwner.subscriptionExpiresAt) > new Date()) {
      currentExpiry = new Date(shopOwner.subscriptionExpiresAt);
    }

    const newExpiry = new Date(currentExpiry.getTime() + addedDays * 24 * 60 * 60 * 1000);

    // Update Shop Owner Subscription Tier & Expiry Date
    shopOwner.subscriptionTier = 'premium';
    shopOwner.subscriptionExpiresAt = newExpiry;
    await shopOwner.save();

    // Also update all managers in this shop to premium
    await this.userModel.updateMany(
      { shopId: shopOwner.shopId },
      { subscriptionTier: 'premium', subscriptionExpiresAt: newExpiry }
    );

    // Update Payment Request Record Status
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
   * SuperAdmin Rejects Subscription Payment Request
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
