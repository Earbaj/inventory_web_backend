import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsNumber, Min } from 'class-validator';

/**
 * Create Inventory Item DTO
 * ইনভেন্টরিতে নতুন পণ্য যোগ করার ইনপুট ভ্যালিডেশন স্কিমা (ফ্রি টিয়ারে সর্বোচ্চ ৫টি পণ্য তৈরি করা সম্ভব)।
 */
export class CreateItemDto {
  @ApiProperty({ example: 'Wireless Mouse', description: 'পণ্যের নাম' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ example: 'SKU-1001', description: 'পণ্যের কোড বা SKU' })
  @IsString()
  @IsOptional()
  sku?: string;

  @ApiPropertyOptional({ example: 'Electronics', description: 'পণ্যের ক্যাটাগরি' })
  @IsString()
  @IsOptional()
  category?: string;

  @ApiProperty({ example: 450.00, description: 'বিক্রয় মূল্যে' })
  @IsNumber()
  @Min(0)
  sellPrice: number;

  @ApiProperty({ example: 320.00, description: 'কেনা দাম (Cost Price)' })
  @IsNumber()
  @Min(0)
  buyPrice: number;

  @ApiProperty({ example: 50, description: 'প্রাথমিক স্টক পরিমাণ' })
  @IsNumber()
  @Min(0)
  stockQuantity: number;

  @ApiPropertyOptional({ example: 'pcs', description: 'পণ্যের একক (যেমন: pcs, kg, rim)' })
  @IsString()
  @IsOptional()
  unit?: string;

  @ApiPropertyOptional({ example: 5, description: 'কম স্টকের সতর্কবার্তা সীমা (ডিফল্ট: ৫)' })
  @IsNumber()
  @IsOptional()
  lowStockThreshold?: number;
}

/**
 * Update Inventory Item DTO
 * বিদ্যমান পণ্যের তথ্য পরিবর্তন করার ডিটিও।
 */
export class UpdateItemDto {
  @ApiPropertyOptional({ example: 'Wireless Mouse Ergonomic', description: 'নতুন নাম' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ example: 'SKU-1001', description: 'নতুন SKU' })
  @IsString()
  @IsOptional()
  sku?: string;

  @ApiPropertyOptional({ example: 'Electronics', description: 'নতুন ক্যাটাগরি' })
  @IsString()
  @IsOptional()
  category?: string;

  @ApiPropertyOptional({ example: 480.00, description: 'নতুন বিক্রয় মূল্য' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  sellPrice?: number;

  @ApiPropertyOptional({ example: 340.00, description: 'নতুন কেনা দাম' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  buyPrice?: number;

  @ApiPropertyOptional({ example: 60, description: 'নতুন স্টক পরিমাণ' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  stockQuantity?: number;

  @ApiPropertyOptional({ example: 'pcs', description: 'নতুন একক' })
  @IsString()
  @IsOptional()
  unit?: string;

  @ApiPropertyOptional({ example: 5, description: 'নতুন স্টকের সতর্কবার্তা সীমা' })
  @IsNumber()
  @IsOptional()
  lowStockThreshold?: number;
}

/**
 * Update Stock Quantity DTO
 * পণ্যের ম্যানুয়াল স্টক সমন্বয় (Stock Adjustment) করার জন্য ডিটিও।
 */
export class UpdateStockDto {
  @ApiProperty({ example: 10, description: 'স্টক বাড়াতে পজিটিভ (+) সংখ্যা এবং স্টক কমাতে নেগেটিভ (-) সংখ্যা দিন' })
  @IsNumber()
  adjustment: number;
}

/**
 * Create Category DTO
 * নতুন ক্যাটাগরি তৈরি করার ডিটিও।
 */
export class CreateCategoryDto {
  @ApiProperty({ example: 'Electronics', description: 'ক্যাটাগরির নাম' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ example: 'Computer peripherals and gadgets', description: 'ক্যাটাগরির বিবরণ' })
  @IsString()
  @IsOptional()
  description?: string;
}
