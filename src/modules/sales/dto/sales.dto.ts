import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsNumber, Min, IsArray, ValidateNested, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * Sale Item Input DTO
 * ইনভয়েসের একক পণ্যের পরিমান, একক মূল্য ও ছাড়ের ইনপুট ভ্যালিডেশন স্কিমা।
 */
export class SaleItemDto {
  @ApiProperty({ example: '65c1a2b3c4d5e6f7a8b9c0d1', description: 'পণ্যের ইউনিক আইডি' })
  @IsString()
  @IsNotEmpty()
  itemId: string;

  @ApiProperty({ example: 2, description: 'ক্রয়কৃত পণ্যের পিস/সংখ্যা' })
  @IsNumber()
  @Min(1)
  quantity: number;

  @ApiProperty({ example: 450.00, description: 'প্রতি পিসের একক বিক্রয় মূল্য' })
  @IsNumber()
  @Min(0)
  unitPrice: number;

  @ApiPropertyOptional({ example: 0, description: 'পণ্যের কাস্টম ডিসকাউন্ট' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  discount?: number;

  @ApiPropertyOptional({ example: 'amount', enum: ['amount', 'percent'], description: 'ডিসকাউন্টের ধরণ (টাকা নাকি শতাংশ)' })
  @IsEnum(['amount', 'percent'])
  @IsOptional()
  discountType?: string;
}

/**
 * Create POS Checkout Sale DTO
 * POS বিলিং এবং মেমো জেনারেট করার ইনপুট ডিটিও স্কিমা (ফ্রি টিয়ারে সর্বোচ্চ ৫টি সেলস করা সম্ভব)।
 */
export class CreateSaleDto {
  @ApiPropertyOptional({ example: 'walk-in', description: 'কাস্টমার আইডি (সাধারণ ক্রেতার জন্য walk-in)' })
  @IsString()
  @IsOptional()
  customerId?: string;

  @ApiPropertyOptional({ example: 'Walk-in Customer', description: 'কাস্টমারের নাম' })
  @IsString()
  @IsOptional()
  customerName?: string;

  @ApiPropertyOptional({ example: '', description: 'কাস্টমারের ফোন নম্বর' })
  @IsString()
  @IsOptional()
  customerPhone?: string;

  @ApiProperty({ type: [SaleItemDto], description: 'বিক্রয়কৃত পণ্যসমূহের তালিকা' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SaleItemDto)
  items: SaleItemDto[];

  @ApiPropertyOptional({ example: 0, description: 'ইনভয়েসের উপর সামগ্রিক ডিসকাউন্ট' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  discount?: number;

  @ApiProperty({ example: 900.00, description: 'কাস্টমার কর্তৃক নগদ জমা টাকার পরিমাণ' })
  @IsNumber()
  @Min(0)
  paidAmount: number;
}
