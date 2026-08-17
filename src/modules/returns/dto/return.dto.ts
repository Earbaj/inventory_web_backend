import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsNumber, Min, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * Return Item Input DTO
 * ফেরত দেয়া নির্দিষ্ট পণ্যের আইডি এবং পরিমাণের ইনপুট ভ্যালিডেশন স্কিমা।
 */
export class ReturnItemInputDto {
  @ApiProperty({ example: '65c1a2b3c4d5e6f7a8b9c0d1', description: 'ফেরত দেওয়া পণ্যের আইডি' })
  @IsString()
  @IsNotEmpty()
  itemId: string;

  @ApiProperty({ example: 1, description: 'ফেরত দেওয়া পিসের সংখ্যা' })
  @IsNumber()
  @Min(1)
  quantity: number;
}

/**
 * Process Return DTO
 * মেমো/ইনভয়েস থেকে পণ্য ফেরত ও স্টকে যুক্ত করার ডিটিও স্কিমা।
 */
export class ProcessReturnDto {
  @ApiPropertyOptional({ example: 'walk-in', description: 'কাস্টমার আইডি (ডিফল্ট: walk-in)' })
  @IsString()
  @IsOptional()
  customerId?: string;

  @ApiProperty({ example: '65c1a2b3c4d5e6f7a8b9c0d2', description: 'মূল সেলস ট্রানজেকশনের আইডি' })
  @IsString()
  @IsNotEmpty()
  saleId: string;

  @ApiProperty({ type: [ReturnItemInputDto], description: 'ফেরত প্রদানকৃত পণ্যসমূহের তালিকা' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReturnItemInputDto)
  returnedItems: ReturnItemInputDto[];
}
