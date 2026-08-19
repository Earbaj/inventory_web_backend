import { Injectable, UnauthorizedException, ConflictException, NotFoundException, ForbiddenException, BadRequestException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from './schemas/user.schema';
import { LoginDto, RegisterDto, CreateUserDto, PermissionsDto, ChangePasswordDto, SetupSuperAdminDto, ForgotPasswordDto, ResetPasswordDto, UpdateProfileDto } from './dto/auth.dto';

/**
 * Authentication & User Management Service
 * এই সার্ভিসটিতে সাইনআপ, লগইন, সুপার অ্যাডমিন তৈরি, পাসওয়ার্ড রিকভারি, এবং ইউজার পারমিশন কন্ট্রোল লজিক রয়েছে।
 */
@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private jwtService: JwtService,
  ) {}

  /**
   * 1. One-time Initial SuperAdmin Setup
   * ডাটাবেজে যদি ০টি সুপার অ্যাডমিন থাকে তবেই প্রথমবার প্ল্যাটফর্মের সুপার অ্যাডমিন তৈরি করতে দিবে।
   * ১টি তৈরি হয়ে গেলে পরবর্তী সকল চেষ্টা '403 Forbidden' হিসেবে রিজেক্ট করা হবে।
   */
  async setupSuperAdmin(dto: SetupSuperAdminDto) {
    // ডাটাবেজে আগে থেকে কোনো সুপার অ্যাডমিন আছে কিনা গণনা করুন
    const existingSuperAdminCount = await this.userModel.countDocuments({ role: 'superadmin' });
    if (existingSuperAdminCount > 0) {
      throw new ForbiddenException('SuperAdmin account already exists. Initial setup can only be executed once.');
    }

    const email = dto.email.trim().toLowerCase();
    const existingEmail = await this.userModel.findOne({ email });
    if (existingEmail) {
      throw new ConflictException('User with this email already exists');
    }

    // পাসওয়ার্ড হ্যাশ (এনক্রিপশন) করুন
    const passwordHash = await bcrypt.hash(dto.password, 10);
    const superAdmin = new this.userModel({
      name: dto.name,
      email,
      passwordHash,
      role: 'superadmin',
      subscriptionTier: 'premium',
      shopId: null, // সুপার অ্যাডমিনের কোনো নির্দিষ্ট শপ নেই, তিনি সম্পূর্ণ প্ল্যাটফর্মের মালিক
      permissions: {
        canProcessReturn: true,
        canExportExcel: true,
        canEditCustomers: true,
        canViewBuyPrice: true,
      },
    });

    await superAdmin.save();
    this.logger.log(`One-time SuperAdmin created: ${email}`);

    const payload = { sub: superAdmin._id.toString(), email: superAdmin.email, role: superAdmin.role };
    const token = this.jwtService.sign(payload);

    return {
      message: 'SuperAdmin created successfully',
      token,
      user: {
        uid: superAdmin._id.toString(),
        email: superAdmin.email,
        name: superAdmin.name,
        role: superAdmin.role,
        subscriptionTier: superAdmin.subscriptionTier,
      },
    };
  }

  /**
   * 2. Forgot Password Request (OTP Generation)
   * ইউজার পাসওয়ার্ড ভুলে গেলে তার ইমেইলে ১৫ মিনিট মেয়াদী ৬ ডিজিটের ওটিপি কোড জেনারেট করে পাঠানো হয়।
   */
  async forgotPassword(dto: ForgotPasswordDto) {
    const email = dto.email.trim().toLowerCase();
    const user = await this.userModel.findOne({ email });
    if (!user) {
      throw new NotFoundException('No account found with this email address');
    }

    // ৬ ডিজিটের র্যান্ডম ওটিপি জেনারেট করুন (যেমন: 582910)
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // ১৫ মিনিট মেয়াদ

    user.resetPasswordCode = resetCode;
    user.resetPasswordExpiresAt = expiresAt;
    await user.save();

    // ডেভেলপমেন্ট ও ডেমো উদ্দেশ্যে সার্ভার কনসোলে ওটিপি কোডটি প্রিন্ট করে দেখানো হচ্ছে
    this.logger.log(`[PASSWORD RESET OTP] Email: ${email} | Code: ${resetCode} | Expires: ${expiresAt.toISOString()}`);

    return {
      message: 'Password reset code has been sent to your email address (valid for 15 minutes)',
      email: user.email,
      devNoticeCode: resetCode, // টেস্টিং সুবিধার জন্য কোড রিটার্ন করা হলো
    };
  }

  /**
   * 3. Reset Password Using OTP Code
   * ইমেইলে প্রাপ্ত ওটিপি কোড এবং নতুন পাসওয়ার্ড দিয়ে অ্যাকাউন্ট রিসেট করার লজিক।
   */
  async resetPassword(dto: ResetPasswordDto) {
    const email = dto.email.trim().toLowerCase();
    const user = await this.userModel.findOne({ email });
    if (!user) {
      throw new BadRequestException('Invalid email or password reset code');
    }

    // ওটিপি কোড এবং মেয়াদ যাচাই করুন
    if (
      !user.resetPasswordCode ||
      user.resetPasswordCode !== dto.resetCode.trim() ||
      !user.resetPasswordExpiresAt ||
      new Date(user.resetPasswordExpiresAt) < new Date()
    ) {
      throw new BadRequestException('Invalid or expired password reset code');
    }

    // নতুন পাসওয়ার্ড হ্যাশ করে আপডেট করুন এবং ওটিপি ফিল্ড ক্লিয়ার করুন
    user.passwordHash = await bcrypt.hash(dto.newPassword, 10);
    user.resetPasswordCode = null;
    user.resetPasswordExpiresAt = null;
    await user.save();

    return { message: 'Password has been reset successfully. You can now login with your new password.' };
  }

  /**
   * 4. User Login
   * ইমেইল ও পাসওয়ার্ড যাচাই করে JWT Bearer Token প্রদান করে।
   */
  async login(loginDto: LoginDto) {
    const email = loginDto.email.trim().toLowerCase();
    const user = await this.userModel.findOne({ email });
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // পাসওয়ার্ডের হ্যাশ ম্যাচ করে কিনা চেক করুন
    const isMatch = await bcrypt.compare(loginDto.password, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const payload = { sub: user._id.toString(), email: user.email, role: user.role };
    const token = this.jwtService.sign(payload);

    return {
      token,
      user: {
        uid: user._id.toString(),
        email: user.email,
        name: user.name,
        role: user.role,
        shopId: user.shopId || user._id.toString(),
        subscriptionTier: user.subscriptionTier || 'free',
        subscriptionExpiresAt: user.subscriptionExpiresAt || null,
        permissions: user.permissions,
      },
    };
  }

  /**
   * 5. Register New Shop Owner (Admin Account)
   * সাইনআপের পর অ্যাডমিনের নিজস্ব shopId তৈরি হয় যা তার নিজের ইউজার আইডির সমান।
   */
  async register(registerDto: RegisterDto) {
    const email = registerDto.email.trim().toLowerCase();
    const existing = await this.userModel.findOne({ email });
    if (existing) {
      throw new ConflictException('User with this email already exists');
    }

    const passwordHash = await bcrypt.hash(registerDto.password, 10);
    const role = registerDto.role || 'admin';
    const permissions = role === 'admin'
      ? { canProcessReturn: true, canExportExcel: true, canEditCustomers: true, canViewBuyPrice: true }
      : { canProcessReturn: false, canExportExcel: false, canEditCustomers: false, canViewBuyPrice: false };

    const newUser = new this.userModel({
      name: registerDto.name,
      email,
      passwordHash,
      role,
      subscriptionTier: 'free', // নতুন শপের জন্য ডিফল্ট Free Tier
      permissions,
      shopId: null,
    });

    const savedUser = await newUser.save();
    // শপ অ্যাডমিনের shopId তার নিজের _id এর সাথে সেট করে দেওয়া হলো
    savedUser.shopId = savedUser._id.toString();
    await savedUser.save();

    const payload = { sub: savedUser._id.toString(), email: savedUser.email, role: savedUser.role };
    const token = this.jwtService.sign(payload);

    return {
      token,
      user: {
        uid: savedUser._id.toString(),
        email: savedUser.email,
        name: savedUser.name,
        role: savedUser.role,
        shopId: savedUser.shopId,
        subscriptionTier: savedUser.subscriptionTier,
        subscriptionExpiresAt: savedUser.subscriptionExpiresAt,
        permissions: savedUser.permissions,
      },
    };
  }

  /**
   * 6. Create Manager Account (Shop Admin Only)
   * ফ্রি টিয়ার এনফোর্সমেন্ট: ফ্রি টিয়ারে সর্বমোট ১টির বেশি ম্যানেজার অ্যাকাউন্ট তৈরি করা যাবে না।
   */
  async createUser(createUserDto: CreateUserDto, loggedInUser: any) {
    if (loggedInUser.role !== 'admin' && loggedInUser.role !== 'superadmin') {
      throw new ForbiddenException('Only Shop Admins can create manager accounts');
    }

    const email = createUserDto.email.trim().toLowerCase();
    const existing = await this.userModel.findOne({ email });
    if (existing) {
      throw new ConflictException('User with this email already exists');
    }

    // ফ্রি টিয়ার ম্যানেজার লিমিট চেকিং (সর্বোচ্চ ১ জন ম্যানেজার)
    if (createUserDto.role === 'manager') {
      const managerCount = await this.userModel.countDocuments({ role: 'manager', shopId: loggedInUser.shopId });
      const shopOwner = await this.userModel.findById(loggedInUser.shopId || loggedInUser.uid || loggedInUser.id);
      
      if (shopOwner && shopOwner.subscriptionTier === 'free' && managerCount >= 1) {
        throw new BadRequestException(
          'Free tier is limited to 1 manager account only. Please upgrade to premium.'
        );
      }
    }

    const passwordHash = await bcrypt.hash(createUserDto.password, 10);
    const permissions = createUserDto.permissions || (createUserDto.role === 'admin'
      ? { canProcessReturn: true, canExportExcel: true, canEditCustomers: true, canViewBuyPrice: true }
      : { canProcessReturn: false, canExportExcel: false, canEditCustomers: false, canViewBuyPrice: false });

    const user = new this.userModel({
      name: createUserDto.name,
      email,
      passwordHash,
      role: createUserDto.role,
      shopId: loggedInUser.shopId, // ম্যানেজারকে অ্যাডমিনের শপ আইডির সাথে ট্যাগ করা হলো
      subscriptionTier: loggedInUser.subscriptionTier || 'free',
      permissions,
    });

    await user.save();

    return {
      uid: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
      shopId: user.shopId,
      permissions: user.permissions,
    };
  }

  /**
   * 7. Get All Users (Scoped to current shop for Admins, system-wide for SuperAdmin) (Paginated)
   */
  async getAllUsers(loggedInUser: any, query: any = {}) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(query.limit) || 10));
    const skip = (page - 1) * limit;

    const filter: any = {};
    if (loggedInUser.role !== 'superadmin') {
      filter.shopId = loggedInUser.shopId;
    }

    if (query.search) {
      filter.$or = [
        { name: { $regex: query.search, $options: 'i' } },
        { email: { $regex: query.search, $options: 'i' } },
        { role: { $regex: query.search, $options: 'i' } },
      ];
    }

    const sortField = query.sortBy || 'createdAt';
    const sortDirection = query.sortOrder === 'asc' ? 1 : -1;

    const total = await this.userModel.countDocuments(filter);
    const users = await this.userModel
      .find(filter)
      .select('-passwordHash')
      .sort({ [sortField]: sortDirection })
      .skip(skip)
      .limit(limit)
      .exec();

    const totalPages = Math.ceil(total / limit) || 1;

    return {
      data: users.map(user => ({
        id: user._id.toString(),
        uid: user._id.toString(),
        email: user.email,
        name: user.name,
        role: user.role,
        shopId: user.shopId,
        subscriptionTier: user.subscriptionTier,
        subscriptionExpiresAt: user.subscriptionExpiresAt,
        permissions: user.permissions,
      })),
      meta: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  }

  /**
   * 7b. Get Single User / Staff Member Details By ID
   */
  async getUserById(uid: string, loggedInUser: any) {
    const user = await this.userModel.findById(uid).select('-passwordHash');
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (loggedInUser.role !== 'superadmin' && user.shopId !== loggedInUser.shopId) {
      throw new ForbiddenException('Cannot access user from another shop');
    }

    return {
      id: user._id.toString(),
      uid: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
      shopId: user.shopId,
      subscriptionTier: user.subscriptionTier,
      subscriptionExpiresAt: user.subscriptionExpiresAt,
      permissions: user.permissions,
    };
  }

  /**
   * 8. Update Manager Permissions (Admin Only)
   */
  async updateUserPermissions(uid: string, permissions: PermissionsDto, loggedInUser: any) {
    const user = await this.userModel.findById(uid);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (loggedInUser.role !== 'superadmin' && user.shopId !== loggedInUser.shopId) {
      throw new ForbiddenException('Cannot modify user from another shop');
    }

    user.permissions = {
      ...user.permissions,
      ...permissions,
    };

    await user.save();

    return {
      uid: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
      permissions: user.permissions,
    };
  }

  /**
   * 9. Change Logged In User Password
   */
  async changePassword(uid: string, changePasswordDto: ChangePasswordDto) {
    const user = await this.userModel.findById(uid);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.passwordHash = await bcrypt.hash(changePasswordDto.newPassword, 10);
    await user.save();

    return { message: 'Password updated successfully' };
  }

  /**
   * 10. Delete User Account (Admin / SuperAdmin Only)
   */
  async deleteUser(uid: string, loggedInUser: any) {
    const user = await this.userModel.findById(uid);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (loggedInUser.role !== 'superadmin' && user.shopId !== loggedInUser.shopId) {
      throw new ForbiddenException('Cannot delete user from another shop');
    }

    await this.userModel.findByIdAndDelete(uid);
    return { message: 'User deleted successfully' };
  }

  /**
   * 11. List All Registered Shops (SuperAdmin Only) (Paginated)
   * প্ল্যাটফর্মের সকল নিবন্ধিত শপ ও দোকানের অনার একাউন্ট দেখা।
   */
  async getShopsList(loggedInUser: any, query: any = {}) {
    if (loggedInUser.role !== 'superadmin') {
      throw new ForbiddenException('Only SuperAdmin can view registered shops list');
    }

    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(query.limit) || 10));
    const skip = (page - 1) * limit;

    const filter: any = { role: 'admin' };
    if (query.subscriptionTier) {
      filter.subscriptionTier = query.subscriptionTier;
    }
    if (query.search) {
      filter.$or = [
        { name: { $regex: query.search, $options: 'i' } },
        { email: { $regex: query.search, $options: 'i' } },
        { shopId: { $regex: query.search, $options: 'i' } },
      ];
    }

    const sortField = query.sortBy || 'createdAt';
    const sortDirection = query.sortOrder === 'asc' ? 1 : -1;

    const total = await this.userModel.countDocuments(filter);
    const shopOwners = await this.userModel
      .find(filter)
      .select('-passwordHash')
      .sort({ [sortField]: sortDirection })
      .skip(skip)
      .limit(limit)
      .exec();

    const data = await Promise.all(
      shopOwners.map(async owner => {
        const sId = owner.shopId || owner._id.toString();
        const managerCount = await this.userModel.countDocuments({ role: 'manager', shopId: sId });
        return {
          id: owner._id.toString(),
          shopId: sId,
          name: owner.name,
          email: owner.email,
          role: owner.role,
          subscriptionTier: owner.subscriptionTier || 'free',
          subscriptionExpiresAt: owner.subscriptionExpiresAt || null,
          managerCount,
          createdAt: (owner as any).createdAt || new Date(),
        };
      })
    );

    const totalPages = Math.ceil(total / limit) || 1;

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  }

  /**
   * 12. Get Single Shop Details By ID (SuperAdmin Only)
   */
  async getShopById(id: string, loggedInUser: any) {
    if (loggedInUser.role !== 'superadmin') {
      throw new ForbiddenException('Only SuperAdmin can view shop details');
    }

    const owner = await this.userModel.findOne({ _id: id, role: 'admin' }).select('-passwordHash');
    if (!owner) {
      throw new NotFoundException('Shop record not found');
    }

    const sId = owner.shopId || owner._id.toString();
    const managers = await this.userModel.find({ role: 'manager', shopId: sId }).select('-passwordHash');

    return {
      id: owner._id.toString(),
      shopId: sId,
      name: owner.name,
      email: owner.email,
      role: owner.role,
      subscriptionTier: owner.subscriptionTier || 'free',
      subscriptionExpiresAt: owner.subscriptionExpiresAt || null,
      managers: managers.map(m => ({
        uid: m._id.toString(),
        name: m.name,
        email: m.email,
        permissions: m.permissions,
      })),
      createdAt: (owner as any).createdAt || new Date(),
    };
  }

  /**
   * 13. Update User / Shop Profile Details
   */
  async updateProfile(updateProfileDto: UpdateProfileDto, loggedInUser: any) {
    const userId = loggedInUser.uid || loggedInUser.id || loggedInUser.sub;
    const user = await this.userModel.findById(userId);
    if (!user) throw new NotFoundException('User not found');

    if (updateProfileDto.name !== undefined) user.name = updateProfileDto.name;
    if (updateProfileDto.phone !== undefined) user.phone = updateProfileDto.phone;
    if (updateProfileDto.address !== undefined) user.address = updateProfileDto.address;
    if (updateProfileDto.logoUrl !== undefined) user.logoUrl = updateProfileDto.logoUrl;

    await user.save();

    return {
      uid: user._id.toString(),
      email: user.email,
      name: user.name,
      phone: user.phone || '',
      address: user.address || '',
      logoUrl: user.logoUrl || '',
      role: user.role,
      shopId: user.shopId,
      subscriptionTier: user.subscriptionTier,
      subscriptionExpiresAt: user.subscriptionExpiresAt,
      permissions: user.permissions,
    };
  }
}
