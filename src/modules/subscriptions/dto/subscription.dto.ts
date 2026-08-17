import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

/**
 * Submit Manual bKash/Nagad Payment DTO
 * শপ ওনার কর্তৃক ম্যানুয়াল বিকাশ পেমেন্ট ট্রানজেকশন তথ্য (TrxID) সাবমিট করার ডিটিও।
 */
export class SubmitManualPaymentDto {
  @ApiProperty({ example: 'premium_monthly', enum: ['premium_monthly', 'premium_yearly'], description: 'প্যাকেজ আইডি' })
  @IsEnum(['premium_monthly', 'premium_yearly'], { message: 'সঠিক সাবস্ক্রিপশন প্যাকেজ সিলেক্ট করুন' })
  @IsNotEmpty()
  packageId: string;

  @ApiProperty({ example: 1000, description: 'পরিশোধিত টাকার পরিমাণ (BDT)' })
  @IsNumber()
  @Min(1)
  amount: number;

  @ApiProperty({ example: 'manual_bkash', enum: ['manual_bkash', 'manual_nagad', 'manual_bank'], description: 'পেমেন্ট মেথড' })
  @IsEnum(['manual_bkash', 'manual_nagad', 'manual_bank'])
  @IsNotEmpty()
  paymentMethod: string;

  @ApiProperty({ example: 'BK88231920X', description: 'টাকা পাঠানোর পর বিকাশ মেসেজে প্রাপ্ত ট্রানজেকশন আইডি (TrxID)' })
  @IsString()
  @IsNotEmpty()
  trxId: string;

  @ApiProperty({ example: '01700000000', description: 'যে মোবাইল নম্বর থেকে টাকা পাঠানো হয়েছে' })
  @IsString()
  @IsNotEmpty()
  accountNo: string;
}

/**
 * Reject Subscription Payment DTO (SuperAdmin Only)
 * পেমেন্ট রিকোয়েস্ট রিজেক্ট করার কারণ উল্লেখ করার ডিটিও।
 */
export class RejectPaymentDto {
  @ApiProperty({ example: 'Transaction ID not found in bKash merchant statement', description: 'রিজেক্ট করার কারণ' })
  @IsString()
  @IsNotEmpty()
  reason: string;
}
