import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';

/**
 * Passport JWT Authentication Strategy
 * যেকোনো ইনকামিং এপিআই রিকোয়েস্টে Bearer Token ভ্যালিডেট এবং ডিকোড করার জন্য এই স্ট্র্যাটেজি কাজ করে।
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {
    super({
      // Authorization Header থেকে Bearer <TOKEN> হিসেবে JWT সংগ্রহ করা হবে
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      // JWT সিক্রেট কি (অবশ্যই সিকিউর ও এনভায়রনমেন্ট ফাইল থেকে সংগৃহীত)
      secretOrKey: process.env.JWT_SECRET || 'keeper_pos_super_secret_jwt_key_2026',
    });
  }

  /**
   * Token Payload Validation Method
   * টোকেন ডিকোড হওয়ার পর ইউজারকে ডাটাবেজে চেক করে রিকোয়েস্ট অবজেক্টে (req.user) অ্যাটাচ করে দেয়।
   */
  async validate(payload: { sub: string; email: string }) {
    // ডাটাবেজ থেকে পাসওয়ার্ড ছাড়া ইউজার ডাটা তুলে আনুন
    const user = await this.userModel.findById(payload.sub).select('-passwordHash');
    if (!user) {
      throw new UnauthorizedException('User account no longer exists');
    }

    // req.user এ এই অবজেক্টটি রিটার্ন হবে যা সমস্ত সার্ভিস ও গার্ডে পাওয়া যাবে
    return {
      uid: user._id.toString(),
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
      permissions: user.permissions,
      // শপের মাল্টি-টেন্যান্সি আইডি
      shopId: user.shopId || user._id.toString(),
      // ইউজারের বর্তমান সাবস্ক্রিপশন প্ল্যান টিয়ার
      subscriptionTier: user.subscriptionTier || 'free',
      // মেয়াদের শেষ তারিখ
      subscriptionExpiresAt: user.subscriptionExpiresAt || null,
    };
  }
}
