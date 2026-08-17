"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var AuthService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const bcrypt = require("bcrypt");
const user_schema_1 = require("./schemas/user.schema");
let AuthService = AuthService_1 = class AuthService {
    constructor(userModel, jwtService) {
        this.userModel = userModel;
        this.jwtService = jwtService;
        this.logger = new common_1.Logger(AuthService_1.name);
    }
    async setupSuperAdmin(dto) {
        const existingSuperAdminCount = await this.userModel.countDocuments({ role: 'superadmin' });
        if (existingSuperAdminCount > 0) {
            throw new common_1.ForbiddenException('SuperAdmin account already exists. Initial setup can only be executed once.');
        }
        const email = dto.email.trim().toLowerCase();
        const existingEmail = await this.userModel.findOne({ email });
        if (existingEmail) {
            throw new common_1.ConflictException('User with this email already exists');
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
    async forgotPassword(dto) {
        const email = dto.email.trim().toLowerCase();
        const user = await this.userModel.findOne({ email });
        if (!user) {
            throw new common_1.NotFoundException('No account found with this email address');
        }
        const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
        user.resetPasswordCode = resetCode;
        user.resetPasswordExpiresAt = expiresAt;
        await user.save();
        this.logger.log(`[PASSWORD RESET OTP] Email: ${email} | Code: ${resetCode} | Expires: ${expiresAt.toISOString()}`);
        return {
            message: 'Password reset code has been sent to your email address (valid for 15 minutes)',
            email: user.email,
            devNoticeCode: resetCode,
        };
    }
    async resetPassword(dto) {
        const email = dto.email.trim().toLowerCase();
        const user = await this.userModel.findOne({ email });
        if (!user) {
            throw new common_1.BadRequestException('Invalid email or password reset code');
        }
        if (!user.resetPasswordCode ||
            user.resetPasswordCode !== dto.resetCode.trim() ||
            !user.resetPasswordExpiresAt ||
            new Date(user.resetPasswordExpiresAt) < new Date()) {
            throw new common_1.BadRequestException('Invalid or expired password reset code');
        }
        user.passwordHash = await bcrypt.hash(dto.newPassword, 10);
        user.resetPasswordCode = null;
        user.resetPasswordExpiresAt = null;
        await user.save();
        return { message: 'Password has been reset successfully. You can now login with your new password.' };
    }
    async login(loginDto) {
        const email = loginDto.email.trim().toLowerCase();
        const user = await this.userModel.findOne({ email });
        if (!user) {
            throw new common_1.UnauthorizedException('Invalid email or password');
        }
        const isMatch = await bcrypt.compare(loginDto.password, user.passwordHash);
        if (!isMatch) {
            throw new common_1.UnauthorizedException('Invalid email or password');
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
    async register(registerDto) {
        const email = registerDto.email.trim().toLowerCase();
        const existing = await this.userModel.findOne({ email });
        if (existing) {
            throw new common_1.ConflictException('User with this email already exists');
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
            subscriptionTier: 'free',
            permissions,
            shopId: null,
        });
        const savedUser = await newUser.save();
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
    async createUser(createUserDto, loggedInUser) {
        if (loggedInUser.role !== 'admin' && loggedInUser.role !== 'superadmin') {
            throw new common_1.ForbiddenException('Only Shop Admins can create manager accounts');
        }
        const email = createUserDto.email.trim().toLowerCase();
        const existing = await this.userModel.findOne({ email });
        if (existing) {
            throw new common_1.ConflictException('User with this email already exists');
        }
        if (createUserDto.role === 'manager') {
            const managerCount = await this.userModel.countDocuments({ role: 'manager', shopId: loggedInUser.shopId });
            const shopOwner = await this.userModel.findById(loggedInUser.shopId || loggedInUser.uid || loggedInUser.id);
            if (shopOwner && shopOwner.subscriptionTier === 'free' && managerCount >= 1) {
                throw new common_1.BadRequestException('Free tier is limited to 1 manager account only. Please upgrade to premium.');
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
            shopId: loggedInUser.shopId,
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
    async getAllUsers(loggedInUser) {
        const query = {};
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
    async updateUserPermissions(uid, permissions, loggedInUser) {
        const user = await this.userModel.findById(uid);
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        if (loggedInUser.role !== 'superadmin' && user.shopId !== loggedInUser.shopId) {
            throw new common_1.ForbiddenException('Cannot modify user from another shop');
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
    async changePassword(uid, changePasswordDto) {
        const user = await this.userModel.findById(uid);
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        user.passwordHash = await bcrypt.hash(changePasswordDto.newPassword, 10);
        await user.save();
        return { message: 'Password updated successfully' };
    }
    async deleteUser(uid, loggedInUser) {
        const user = await this.userModel.findById(uid);
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        if (loggedInUser.role !== 'superadmin' && user.shopId !== loggedInUser.shopId) {
            throw new common_1.ForbiddenException('Cannot delete user from another shop');
        }
        await this.userModel.findByIdAndDelete(uid);
        return { message: 'User deleted successfully' };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = AuthService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(user_schema_1.User.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map