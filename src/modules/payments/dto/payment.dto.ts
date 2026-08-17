import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber, Min } from 'class-validator';

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
