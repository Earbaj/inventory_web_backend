import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength, IsEnum, IsOptional, IsBoolean, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * Login Data Transfer Object (DTO)
 * সিস্টেমে লগইন করার জন্য ইমেইল ও পাসওয়ার্ড ভ্যালিডেশন স্কিমা।
 */
export class LoginDto {
  @ApiProperty({ example: 'admin@shop.com', description: 'User login email address' })
  @IsEmail({}, { message: 'উচিত বা সঠিক ইমেইল এড্রেস প্রদান করুন' })
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'admin123', description: 'User account password (min 6 characters)' })
  @IsString()
  @IsNotEmpty()
  @MinLength(6, { message: 'পাসওয়ার্ড সর্বনিম্ন ৬ অক্ষরের হতে হবে' })
  password: string;
}

/**
 * Permissions DTO for Manager Access Control
 * ম্যানেজারদের জন্য নির্দিষ্ট পারমিশন সেট করার ডিটিও।
 */
export class PermissionsDto {
  @ApiPropertyOptional({ example: false, description: 'সেলস ইনভয়েস রিটার্ন করার ক্ষমতা' })
  @IsBoolean()
  @IsOptional()
  canProcessReturn?: boolean;

  @ApiPropertyOptional({ example: true, description: 'এক্সেল রিপোর্ট ডাউনলোড করার ক্ষমতা' })
  @IsBoolean()
  @IsOptional()
  canExportExcel?: boolean;

  @ApiPropertyOptional({ example: false, description: 'কাস্টমার ডাটা এডিট করার ক্ষমতা' })
  @IsBoolean()
  @IsOptional()
  canEditCustomers?: boolean;

  @ApiPropertyOptional({ example: false, description: 'প্রোডাক্ট কেনার দাম (Buy Price) দেখার ক্ষমতা' })
  @IsBoolean()
  @IsOptional()
  canViewBuyPrice?: boolean;
}

/**
 * Registration DTO for New Shop Owners (Admin)
 * রেজিস্ট্রেশন পেজ থেকে নতুন শপ অ্যাডমিন সাইনআপের ডিটিও।
 */
export class RegisterDto {
  @ApiProperty({ example: 'Shop Owner', description: 'শপ মালিকের নাম' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'admin@shop.com', description: 'ইউনিক ইমেইল এড্রেস' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'admin123', description: 'পাসওয়ার্ড (সর্বনিম্ন ৬ টি অক্ষর)' })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiPropertyOptional({ example: 'admin', enum: ['admin', 'manager'] })
  @IsEnum(['admin', 'manager'])
  @IsOptional()
  role?: string;
}

/**
 * Create Manager Account DTO (Admin Only)
 * শপ অ্যাডমিন তার দোকানের জন্য ম্যানেজার তৈরি করার ডিটিও (ফ্রি টিয়ারে ১টি সীমাবদ্ধ)।
 */
export class CreateUserDto {
  @ApiProperty({ example: 'John Manager', description: 'ম্যানেজারের নাম' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'manager@shop.com', description: 'ম্যানেজারের ইমেইল' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'admin123', description: 'ম্যানেজারের পাসওয়ার্ড' })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ example: 'manager', enum: ['admin', 'manager'], description: 'ইউজার রোল' })
  @IsEnum(['admin', 'manager'])
  role: string;

  @ApiPropertyOptional({ type: PermissionsDto, description: 'ম্যানেজারের কাস্টম পারমিশনসমূহ' })
  @ValidateNested()
  @Type(() => PermissionsDto)
  @IsOptional()
  permissions?: PermissionsDto;
}

/**
 * Update Manager Permissions DTO
 * ম্যানেজারের অনুমতি আপডেট করার ডিটিও।
 */
export class UpdatePermissionsDto {
  @ApiProperty({ type: PermissionsDto })
  @ValidateNested()
  @Type(() => PermissionsDto)
  permissions: PermissionsDto;
}

/**
 * Change Password DTO
 * লগইন থাকা অবস্থায় পাসওয়ার্ড পরিবর্তনের ডিটিও।
 */
export class ChangePasswordDto {
  @ApiProperty({ example: 'newsecret123', description: 'নতুন পাসওয়ার্ড' })
  @IsString()
  @MinLength(6)
  newPassword: string;
}

/**
 * One-Time SuperAdmin Setup DTO
 * প্ল্যাটফর্মের জন্য প্রথমবার সুপার অ্যাডমিন তৈরির ডিটিও।
 */
export class SetupSuperAdminDto {
  @ApiProperty({ example: 'Platform Super Admin', description: 'সুপার অ্যাডমিনের নাম' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'superadmin@keeper.com', description: 'সুপার অ্যাডমিনের ইমেইল' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'supersecret123', description: 'পাসওয়ার্ড' })
  @IsString()
  @MinLength(6)
  password: string;
}

/**
 * Forgot Password Request DTO
 * পাসওয়ার্ড ভুলে গেলে ইমেইলে ৬ ডিজিটের ওটিপি কোড পাঠানোর জন্য ডিটিও।
 */
export class ForgotPasswordDto {
  @ApiProperty({ example: 'user@shop.com', description: 'রেজিস্টার্ড ইমেইল এড্রেস' })
  @IsEmail({}, { message: 'সঠিক ইমেইল এড্রেস প্রদান করুন' })
  @IsNotEmpty()
  email: string;
}

/**
 * Reset Password DTO
 * ওটিপি কোড এবং নতুন পাসওয়ার্ড দিয়ে রিসেট করার ডিটিও।
 */
export class ResetPasswordDto {
  @ApiProperty({ example: 'user@shop.com', description: 'রেজিস্টার্ড ইমেইল' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: '123456', description: 'ইমেইলে প্রাপ্ত ৬-ডিজিটের ওটিপি কোড' })
  @IsString()
  @IsNotEmpty()
  resetCode: string;

  @ApiProperty({ example: 'newsecret123', description: 'নতুন পাসওয়ার্ড' })
  @IsString()
  @MinLength(6)
  newPassword: string;
}

/**
 * Update User / Shop Profile DTO
 */
export class UpdateProfileDto {
  @ApiPropertyOptional({ example: 'Rahim General Store', description: 'ইউজারের/দোকানের নাম' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ example: '01711000000', description: 'ফোন নম্বর' })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({ example: 'Dhanmondi, Dhaka', description: 'দোকানের ঠিকানা' })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiPropertyOptional({ example: 'https://example.com/logo.png', description: 'দোকানের লোগো URL' })
  @IsString()
  @IsOptional()
  logoUrl?: string;
}
