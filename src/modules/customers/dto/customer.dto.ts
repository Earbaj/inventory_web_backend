import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsNumber } from 'class-validator';

export class CreateCustomerDto {
  @ApiProperty({ example: 'Rahim Traders' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ example: '01711000000' })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({ example: 'Motijheel, Dhaka' })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiPropertyOptional({ example: 0, description: 'Positive is advance (+), negative is due (-)' })
  @IsNumber()
  @IsOptional()
  openingBalance?: number;
}

export class UpdateCustomerDto {
  @ApiPropertyOptional({ example: 'Rahim Store' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ example: '01711000000' })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({ example: 'Dhanmondi, Dhaka' })
  @IsString()
  @IsOptional()
  address?: string;
}
