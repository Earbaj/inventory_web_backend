import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength, IsEnum, IsOptional, IsBoolean, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class LoginDto {
  @ApiProperty({ example: 'admin@shop.com', description: 'User login email' })
  @IsEmail({}, { message: 'Invalid email address' })
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'admin123', description: 'User account password' })
  @IsString()
  @IsNotEmpty()
  @MinLength(6, { message: 'Password must be at least 6 characters' })
  password: string;
}

export class PermissionsDto {
  @ApiPropertyOptional({ example: false })
  @IsBoolean()
  @IsOptional()
  canProcessReturn?: boolean;

  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  canExportExcel?: boolean;

  @ApiPropertyOptional({ example: false })
  @IsBoolean()
  @IsOptional()
  canEditCustomers?: boolean;

  @ApiPropertyOptional({ example: false })
  @IsBoolean()
  @IsOptional()
  canViewBuyPrice?: boolean;
}

export class RegisterDto {
  @ApiProperty({ example: 'Shop Owner' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'admin@shop.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'admin123' })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiPropertyOptional({ example: 'admin', enum: ['admin', 'manager'] })
  @IsEnum(['admin', 'manager'])
  @IsOptional()
  role?: string;
}

export class CreateUserDto {
  @ApiProperty({ example: 'John Manager' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'manager@shop.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'admin123' })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ example: 'manager', enum: ['admin', 'manager'] })
  @IsEnum(['admin', 'manager'])
  role: string;

  @ApiPropertyOptional({ type: PermissionsDto })
  @ValidateNested()
  @Type(() => PermissionsDto)
  @IsOptional()
  permissions?: PermissionsDto;
}

export class UpdatePermissionsDto {
  @ApiProperty({ type: PermissionsDto })
  @ValidateNested()
  @Type(() => PermissionsDto)
  permissions: PermissionsDto;
}

export class ChangePasswordDto {
  @ApiProperty({ example: 'newsecret123' })
  @IsString()
  @MinLength(6)
  newPassword: string;
}

export class SetupSuperAdminDto {
  @ApiProperty({ example: 'Platform Super Admin' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'superadmin@keeper.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'supersecret123' })
  @IsString()
  @MinLength(6)
  password: string;
}

export class ForgotPasswordDto {
  @ApiProperty({ example: 'user@shop.com' })
  @IsEmail({}, { message: 'Invalid email address' })
  @IsNotEmpty()
  email: string;
}

export class ResetPasswordDto {
  @ApiProperty({ example: 'user@shop.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: '123456', description: '6-digit OTP code received via email' })
  @IsString()
  @IsNotEmpty()
  resetCode: string;

  @ApiProperty({ example: 'newsecret123', description: 'New password' })
  @IsString()
  @MinLength(6)
  newPassword: string;
}
