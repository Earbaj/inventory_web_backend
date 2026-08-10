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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const bcrypt = require("bcrypt");
const user_schema_1 = require("./schemas/user.schema");
let AuthService = class AuthService {
    constructor(userModel, jwtService) {
        this.userModel = userModel;
        this.jwtService = jwtService;
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
            permissions,
        });
        await newUser.save();
        const payload = { sub: newUser._id.toString(), email: newUser.email, role: newUser.role };
        const token = this.jwtService.sign(payload);
        return {
            token,
            user: {
                uid: newUser._id.toString(),
                email: newUser.email,
                name: newUser.name,
                role: newUser.role,
                permissions: newUser.permissions,
            },
        };
    }
    async createUser(createUserDto) {
        const email = createUserDto.email.trim().toLowerCase();
        const existing = await this.userModel.findOne({ email });
        if (existing) {
            throw new common_1.ConflictException('User with this email already exists');
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
            permissions,
        });
        await user.save();
        return {
            uid: user._id.toString(),
            email: user.email,
            name: user.name,
            role: user.role,
            permissions: user.permissions,
        };
    }
    async getAllUsers() {
        const users = await this.userModel.find().select('-passwordHash').exec();
        return users.map(user => ({
            uid: user._id.toString(),
            email: user.email,
            name: user.name,
            role: user.role,
            permissions: user.permissions,
        }));
    }
    async updateUserPermissions(uid, permissions) {
        const user = await this.userModel.findById(uid);
        if (!user) {
            throw new common_1.NotFoundException('User not found');
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
    async deleteUser(uid) {
        const res = await this.userModel.findByIdAndDelete(uid);
        if (!res) {
            throw new common_1.NotFoundException('User not found');
        }
        return { message: 'User deleted successfully' };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(user_schema_1.User.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map