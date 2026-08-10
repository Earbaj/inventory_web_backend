import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber, Min } from 'class-validator';

export class ProcessPaymentDto {
  @ApiProperty({ example: '65c1a2b3c4d5e6f7a8b9c0d1' })
  @IsString()
  @IsNotEmpty()
  customerId: string;

  @ApiProperty({ example: 500.00 })
  @IsNumber()
  @Min(0.01)
  amount: number;

  @ApiProperty({ example: 'cash', description: 'cash, bkash, nagad, card, bank' })
  @IsString()
  @IsNotEmpty()
  paymentMethod: string;
}
