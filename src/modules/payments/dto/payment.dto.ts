import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber, Min, IsOptional } from 'class-validator';
import { PaginationQueryDto } from '../../../common/dto/pagination.dto';

/**
 * Process Customer Payment DTO
 * কাস্টমারের বাকি পরিশোধ সংগ্রহ করার ইনপুট ভ্যালিডেশন স্কিমা।
 */
export class ProcessPaymentDto {
  @ApiProperty({ example: '65c1a2b3c4d5e6f7a8b9c0d1', description: 'কাস্টমারের ইউনিক MongoDB আইডি' })
  @IsString()
  @IsNotEmpty()
  customerId: string;

  @ApiProperty({ example: 500.00, description: 'পরিশোধকৃত জমার পরিমাণ (সর্বনিম্ন 0.01 ৳)' })
  @IsNumber()
  @Min(0.01)
  amount: number;

  @ApiProperty({ example: 'cash', description: 'পেমেন্ট মেথড (যেমন: cash, bkash, nagad, card, bank)' })
  @IsString()
  @IsNotEmpty()
  paymentMethod: string;
}

/**
 * Query Payments DTO
 * বাকি আদায় হিস্ট্রি ফিল্টারিং ও পেজিনেশনের ডিটিও।
 */
export class QueryPaymentsDto extends PaginationQueryDto {
  @ApiPropertyOptional({ example: '65c1a2b3c4d5e6f7a8b9c0d1', description: 'নির্দিষ্ট কাস্টমার আইডি ফিল্টার' })
  @IsString()
  @IsOptional()
  customerId?: string;

  @ApiPropertyOptional({ example: 'cash', description: 'পেমেন্ট মেথড ফিল্টার (cash, bkash, nagad)' })
  @IsString()
  @IsOptional()
  paymentMethod?: string;

  @ApiPropertyOptional({ example: '2026-08-01', description: 'শুরুর তারিখ (YYYY-MM-DD)' })
  @IsString()
  @IsOptional()
  startDate?: string;

  @ApiPropertyOptional({ example: '2026-08-19', description: 'শেষের তারিখ (YYYY-MM-DD)' })
  @IsString()
  @IsOptional()
  endDate?: string;
}
