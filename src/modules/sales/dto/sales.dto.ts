import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsNumber, Min, IsArray, ValidateNested, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';

export class SaleItemDto {
  @ApiProperty({ example: '65c1a2b3c4d5e6f7a8b9c0d1' })
  @IsString()
  @IsNotEmpty()
  itemId: string;

  @ApiProperty({ example: 2 })
  @IsNumber()
  @Min(1)
  quantity: number;

  @ApiProperty({ example: 450.00 })
  @IsNumber()
  @Min(0)
  unitPrice: number;

  @ApiPropertyOptional({ example: 0 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  discount?: number;

  @ApiPropertyOptional({ example: 'amount', enum: ['amount', 'percent'] })
  @IsEnum(['amount', 'percent'])
  @IsOptional()
  discountType?: string;
}

export class CreateSaleDto {
  @ApiPropertyOptional({ example: 'walk-in' })
  @IsString()
  @IsOptional()
  customerId?: string;

  @ApiPropertyOptional({ example: 'Walk-in Customer' })
  @IsString()
  @IsOptional()
  customerName?: string;

  @ApiPropertyOptional({ example: '' })
  @IsString()
  @IsOptional()
  customerPhone?: string;

  @ApiProperty({ type: [SaleItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SaleItemDto)
  items: SaleItemDto[];

  @ApiPropertyOptional({ example: 0 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  discount?: number;

  @ApiProperty({ example: 900.00 })
  @IsNumber()
  @Min(0)
  paidAmount: number;
}
