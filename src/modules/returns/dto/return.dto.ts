import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsNumber, Min, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class ReturnItemInputDto {
  @ApiProperty({ example: '65c1a2b3c4d5e6f7a8b9c0d1' })
  @IsString()
  @IsNotEmpty()
  itemId: string;

  @ApiProperty({ example: 1 })
  @IsNumber()
  @Min(1)
  quantity: number;
}

export class ProcessReturnDto {
  @ApiPropertyOptional({ example: 'walk-in' })
  @IsString()
  @IsOptional()
  customerId?: string;

  @ApiProperty({ example: '65c1a2b3c4d5e6f7a8b9c0d2' })
  @IsString()
  @IsNotEmpty()
  saleId: string;

  @ApiProperty({ type: [ReturnItemInputDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReturnItemInputDto)
  returnedItems: ReturnItemInputDto[];
}
