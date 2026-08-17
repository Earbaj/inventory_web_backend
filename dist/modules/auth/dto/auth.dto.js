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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResetPasswordDto = exports.ForgotPasswordDto = exports.SetupSuperAdminDto = exports.ChangePasswordDto = exports.UpdatePermissionsDto = exports.CreateUserDto = exports.RegisterDto = exports.PermissionsDto = exports.LoginDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
class LoginDto {
}
exports.LoginDto = LoginDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'admin@shop.com', description: 'User login email address' }),
    (0, class_validator_1.IsEmail)({}, { message: 'উচিত বা সঠিক ইমেইল এড্রেস প্রদান করুন' }),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], LoginDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'admin123', description: 'User account password (min 6 characters)' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MinLength)(6, { message: 'পাসওয়ার্ড সর্বনিম্ন ৬ অক্ষরের হতে হবে' }),
    __metadata("design:type", String)
], LoginDto.prototype, "password", void 0);
class PermissionsDto {
}
exports.PermissionsDto = PermissionsDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: false, description: 'সেলস ইনভয়েস রিটার্ন করার ক্ষমতা' }),
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], PermissionsDto.prototype, "canProcessReturn", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: true, description: 'এক্সেল রিপোর্ট ডাউনলোড করার ক্ষমতা' }),
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], PermissionsDto.prototype, "canExportExcel", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: false, description: 'কাস্টমার ডাটা এডিট করার ক্ষমতা' }),
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], PermissionsDto.prototype, "canEditCustomers", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: false, description: 'প্রোডাক্ট কেনার দাম (Buy Price) দেখার ক্ষমতা' }),
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], PermissionsDto.prototype, "canViewBuyPrice", void 0);
class RegisterDto {
}
exports.RegisterDto = RegisterDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Shop Owner', description: 'শপ মালিকের নাম' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], RegisterDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'admin@shop.com', description: 'ইউনিক ইমেইল এড্রেস' }),
    (0, class_validator_1.IsEmail)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], RegisterDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'admin123', description: 'পাসওয়ার্ড (সর্বনিম্ন ৬ টি অক্ষর)' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(6),
    __metadata("design:type", String)
], RegisterDto.prototype, "password", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'admin', enum: ['admin', 'manager'] }),
    (0, class_validator_1.IsEnum)(['admin', 'manager']),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], RegisterDto.prototype, "role", void 0);
class CreateUserDto {
}
exports.CreateUserDto = CreateUserDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'John Manager', description: 'ম্যানেজারের নাম' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateUserDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'manager@shop.com', description: 'ম্যানেজারের ইমেইল' }),
    (0, class_validator_1.IsEmail)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateUserDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'admin123', description: 'ম্যানেজারের পাসওয়ার্ড' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(6),
    __metadata("design:type", String)
], CreateUserDto.prototype, "password", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'manager', enum: ['admin', 'manager'], description: 'ইউজার রোল' }),
    (0, class_validator_1.IsEnum)(['admin', 'manager']),
    __metadata("design:type", String)
], CreateUserDto.prototype, "role", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: PermissionsDto, description: 'ম্যানেজারের কাস্টম পারমিশনসমূহ' }),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => PermissionsDto),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", PermissionsDto)
], CreateUserDto.prototype, "permissions", void 0);
class UpdatePermissionsDto {
}
exports.UpdatePermissionsDto = UpdatePermissionsDto;
__decorate([
    (0, swagger_1.ApiProperty)({ type: PermissionsDto }),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => PermissionsDto),
    __metadata("design:type", PermissionsDto)
], UpdatePermissionsDto.prototype, "permissions", void 0);
class ChangePasswordDto {
}
exports.ChangePasswordDto = ChangePasswordDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'newsecret123', description: 'নতুন পাসওয়ার্ড' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(6),
    __metadata("design:type", String)
], ChangePasswordDto.prototype, "newPassword", void 0);
class SetupSuperAdminDto {
}
exports.SetupSuperAdminDto = SetupSuperAdminDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Platform Super Admin', description: 'সুপার অ্যাডমিনের নাম' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], SetupSuperAdminDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'superadmin@keeper.com', description: 'সুপার অ্যাডমিনের ইমেইল' }),
    (0, class_validator_1.IsEmail)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], SetupSuperAdminDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'supersecret123', description: 'পাসওয়ার্ড' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(6),
    __metadata("design:type", String)
], SetupSuperAdminDto.prototype, "password", void 0);
class ForgotPasswordDto {
}
exports.ForgotPasswordDto = ForgotPasswordDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'user@shop.com', description: 'রেজিস্টার্ড ইমেইল এড্রেস' }),
    (0, class_validator_1.IsEmail)({}, { message: 'সঠিক ইমেইল এড্রেস প্রদান করুন' }),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], ForgotPasswordDto.prototype, "email", void 0);
class ResetPasswordDto {
}
exports.ResetPasswordDto = ResetPasswordDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'user@shop.com', description: 'রেজিস্টার্ড ইমেইল' }),
    (0, class_validator_1.IsEmail)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], ResetPasswordDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '123456', description: 'ইমেইলে প্রাপ্ত ৬-ডিজিটের ওটিপি কোড' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], ResetPasswordDto.prototype, "resetCode", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'newsecret123', description: 'নতুন পাসওয়ার্ড' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(6),
    __metadata("design:type", String)
], ResetPasswordDto.prototype, "newPassword", void 0);
//# sourceMappingURL=auth.dto.js.map