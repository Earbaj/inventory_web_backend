import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class SubmitManualPaymentDto {
  @ApiProperty({ example: 'premium_monthly', enum: ['premium_monthly', 'premium_yearly'] })
  @IsEnum(['premium_monthly', 'premium_yearly'], { message: 'Invalid package selection' })
  @IsNotEmpty()
  packageId: string;

  @ApiProperty({ example: 1000, description: 'Amount paid in BDT' })
  @IsNumber()
  @Min(1)
  amount: number;

  @ApiProperty({ example: 'manual_bkash', enum: ['manual_bkash', 'manual_nagad', 'manual_bank'] })
  @IsEnum(['manual_bkash', 'manual_nagad', 'manual_bank'])
  @IsNotEmpty()
  paymentMethod: string;

  @ApiProperty({ example: 'BK88231920X', description: 'Transaction ID (TrxID) received after payment' })
  @IsString()
  @IsNotEmpty()
  trxId: string;

  @ApiProperty({ example: '01700000000', description: 'Account/Mobile number used to send payment' })
  @IsString()
  @IsNotEmpty()
  accountNo: string;
}

export class RejectPaymentDto {
  @ApiProperty({ example: 'Transaction ID not found in bKash statement' })
  @IsString()
  @IsNotEmpty()
  reason: string;
}
