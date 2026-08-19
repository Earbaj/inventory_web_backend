import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsNumber } from 'class-validator';
import { PaginationQueryDto } from '../../../common/dto/pagination.dto';

/**
 * Create Customer DTO
 * নতুন কাস্টমার রেজিস্ট্রেশন করার জন্য রিকোয়েস্ট ডাটা ভ্যালিডেশন স্কিমা (ফ্রি টিয়ারে ১জন কাস্টমার সীমাবদ্ধ)।
 */
export class CreateCustomerDto {
  @ApiProperty({ example: 'Rahim Traders', description: 'কাস্টমারের নাম' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ example: '01711000000', description: 'কাস্টমারের মোবাইল নম্বর (ঐচ্ছিক)' })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({ example: 'Motijheel, Dhaka', description: 'কাস্টমারের ঠিকানা (ঐচ্ছিক)' })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiPropertyOptional({ example: 0, description: 'প্রাথমিক ব্যালেন্স (পজিটিভ (+) মানে অগ্রিম জমা, নেগেটিভ (-) মানে বাকি)' })
  @IsNumber()
  @IsOptional()
  openingBalance?: number;
}

/**
 * Update Customer DTO
 * বিদ্যমান কাস্টমারের তথ্য পরিবর্তনের জন্য ডিটিও স্কিমা।
 */
export class UpdateCustomerDto {
  @ApiPropertyOptional({ example: 'Rahim Store', description: 'আপডেটেড নাম' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ example: '01711000000', description: 'আপডেটেড মোবাইল নম্বর' })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({ example: 'Dhanmondi, Dhaka', description: 'আপডেটেড ঠিকানা' })
  @IsString()
  @IsOptional()
  address?: string;
}

/**
 * Query Ledger DTO
 * কাস্টমার লেজার স্টেটমেন্ট ট্রানজেকশন ফিল্টারিং ও পেজিনেশনের ডিটিও।
 */
export class QueryLedgerDto extends PaginationQueryDto {
  @ApiPropertyOptional({ example: '2026-08-01', description: 'শুরুর তারিখ (YYYY-MM-DD)' })
  @IsString()
  @IsOptional()
  startDate?: string;

  @ApiPropertyOptional({ example: '2026-08-19', description: 'শেষের তারিখ (YYYY-MM-DD)' })
  @IsString()
  @IsOptional()
  endDate?: string;
}
