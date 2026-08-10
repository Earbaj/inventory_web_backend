import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsNumber, Min } from 'class-validator';

export class CreateItemDto {
  @ApiProperty({ example: 'Wireless Mouse' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ example: 'SKU-1001' })
  @IsString()
  @IsOptional()
  sku?: string;

  @ApiPropertyOptional({ example: 'Electronics' })
  @IsString()
  @IsOptional()
  category?: string;

  @ApiProperty({ example: 450.00 })
  @IsNumber()
  @Min(0)
  sellPrice: number;

  @ApiProperty({ example: 320.00 })
  @IsNumber()
  @Min(0)
  buyPrice: number;

  @ApiProperty({ example: 50 })
  @IsNumber()
  @Min(0)
  stockQuantity: number;

  @ApiPropertyOptional({ example: 'pcs' })
  @IsString()
  @IsOptional()
  unit?: string;

  @ApiPropertyOptional({ example: 5 })
  @IsNumber()
  @IsOptional()
  lowStockThreshold?: number;
}

export class UpdateItemDto {
  @ApiPropertyOptional({ example: 'Wireless Mouse Ergonomic' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ example: 'SKU-1001' })
  @IsString()
  @IsOptional()
  sku?: string;

  @ApiPropertyOptional({ example: 'Electronics' })
  @IsString()
  @IsOptional()
  category?: string;

  @ApiPropertyOptional({ example: 480.00 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  sellPrice?: number;

  @ApiPropertyOptional({ example: 340.00 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  buyPrice?: number;

  @ApiPropertyOptional({ example: 60 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  stockQuantity?: number;

  @ApiPropertyOptional({ example: 'pcs' })
  @IsString()
  @IsOptional()
  unit?: string;

  @ApiPropertyOptional({ example: 5 })
  @IsNumber()
  @IsOptional()
  lowStockThreshold?: number;
}

export class UpdateStockDto {
  @ApiProperty({ example: 10, description: 'Quantity to add (positive) or deduct (negative)' })
  @IsNumber()
  adjustment: number;
}

export class CreateCategoryDto {
  @ApiProperty({ example: 'Electronics' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ example: 'Computer peripherals and gadgets' })
  @IsString()
  @IsOptional()
  description?: string;
}
