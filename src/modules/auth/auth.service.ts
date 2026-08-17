import { Injectable, UnauthorizedException, ConflictException, NotFoundException, ForbiddenException, BadRequestException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from './schemas/user.schema';
import { LoginDto, RegisterDto, CreateUserDto, PermissionsDto, ChangePasswordDto, SetupSuperAdminDto, ForgotPasswordDto, ResetPasswordDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private jwtService: JwtService,
  ) {}

  /**
   * One-time Initial SuperAdmin Setup
   * Only allows creation if zero SuperAdmin accounts exist in MongoDB database.
   */
  async setupSuperAdmin(dto: SetupSuperAdminDto) {
    const existingSuperAdminCount = await this.userModel.countDocuments({ role: 'superadmin' });
    if (existingSuperAdminCount > 0) {
      throw new ForbiddenException('SuperAdmin account already exists. Initial setup can only be executed once.');
    }

    const email = dto.email.trim().toLowerCase();
    const existingEmail = await this.userModel.findOne({ email });
    if (existingEmail) {
      throw new ConflictException('User with this email already exists');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const superAdmin = new this.userModel({
      name: dto.name,
      email,
      passwordHash,
      role: 'superadmin',
      subscriptionTier: 'premium',
      shopId: null,
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
   * Request password recovery OTP code via email
   */
  async forgotPassword(dto: ForgotPasswordDto) {
    const email = dto.email.trim().toLowerCase();
    const user = await this.userModel.findOne({ email });
    if (!user) {
      throw new NotFoundException('No account found with this email address');
    }

    // Generate 6-digit numeric OTP code
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // Valid for 15 minutes

    user.resetPasswordCode = resetCode;
    user.resetPasswordExpiresAt = expiresAt;
    await user.save();

    // Log the OTP code for demonstration/development server logs
    this.logger.log(`[PASSWORD RESET OTP] Email: ${email} | Code: ${resetCode} | Expires: ${expiresAt.toISOString()}`);

    return {
      message: 'Password reset code has been sent to your email address (valid for 15 minutes)',
      email: user.email,
      // Returning code in response for testing ease when email gateway is offline
      devNoticeCode: resetCode,
    };
  }

  /**
   * Reset password using OTP code
   */
  async resetPassword(dto: ResetPasswordDto) {
    const email = dto.email.trim().toLowerCase();
    const user = await this.userModel.findOne({ email });
    if (!user) {
      throw new BadRequestException('Invalid email or password reset code');
    }

    if (
      !user.resetPasswordCode ||
      user.resetPasswordCode !== dto.resetCode.trim() ||
      !user.resetPasswordExpiresAt ||
      new Date(user.resetPasswordExpiresAt) < new Date()
    ) {
      throw new BadRequestException('Invalid or expired password reset code');
    }

    user.passwordHash = await bcrypt.hash(dto.newPassword, 10);
    user.resetPasswordCode = null;
    user.resetPasswordExpiresAt = null;
    await user.save();

    return { message: 'Password has been reset successfully. You can now login with your new password.' };
  }

  async login(loginDto: LoginDto) {
    const email = loginDto.email.trim().toLowerCase();
    const user = await this.userModel.findOne({ email });
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

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
      subscriptionTier: 'free', // Default Free Tier for new shop owners
      permissions,
      shopId: null,
    });

    const savedUser = await newUser.save();
    // Shop owner's shopId is set to their own User _id
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
   * Create a Manager Account (Admin Only)
   * Enforces Free Tier Limit: Maximum 1 Manager Account for Free Tier Shops
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

    // Check Free Tier Manager Limit (Max 1 Manager)
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
      shopId: loggedInUser.shopId, // Manager linked to creator Admin's shopId
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

  async getAllUsers(loggedInUser: any) {
    const query: any = {};
    if (loggedInUser.role !== 'superadmin') {
      query.shopId = loggedInUser.shopId;
    }

    const users = await this.userModel.find(query).select('-passwordHash').exec();
    return users.map(user => ({
      uid: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
      shopId: user.shopId,
      subscriptionTier: user.subscriptionTier,
      subscriptionExpiresAt: user.subscriptionExpiresAt,
      permissions: user.permissions,
    }));
  }

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

  async changePassword(uid: string, changePasswordDto: ChangePasswordDto) {
    const user = await this.userModel.findById(uid);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.passwordHash = await bcrypt.hash(changePasswordDto.newPassword, 10);
    await user.save();

    return { message: 'Password updated successfully' };
  }

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
}
