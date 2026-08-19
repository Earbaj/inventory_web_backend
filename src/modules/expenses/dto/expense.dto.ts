import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber, Min, IsOptional } from 'class-validator';
import { PaginationQueryDto } from '../../../common/dto/pagination.dto';

/**
 * Create Expense DTO
 */
export class CreateExpenseDto {
  @ApiProperty({ example: 'misc', enum: ['rent', 'utility', 'salary', 'transport', 'misc'], description: 'খরচের ক্যাটাগরি' })
  @IsString()
  @IsNotEmpty()
  category: string;

  @ApiProperty({ example: 'Shop Electricity Bill', description: 'খরচের বিবরণ/শিরোনাম' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 1500.00, description: 'টাকার পরিমাণ (সর্বনিম্ন 0.01)' })
  @IsNumber()
  @Min(0.01)
  amount: number;

  @ApiPropertyOptional({ example: '2026-08-19', description: 'তারিখ (ঐচ্ছিক, ডিফল্ট: বর্তমান সময়)' })
  @IsString()
  @IsOptional()
  date?: string;

  @ApiPropertyOptional({ example: 'Paid via bKash Merchant', description: 'অতিরিক্ত নোট (ঐচ্ছিক)' })
  @IsString()
  @IsOptional()
  note?: string;
}

/**
 * Update Expense DTO
 */
export class UpdateExpenseDto {
  @ApiPropertyOptional({ example: 'utility', description: 'ক্যাটাগরি' })
  @IsString()
  @IsOptional()
  category?: string;

  @ApiPropertyOptional({ example: 'Updated Electricity Bill', description: 'শিরোনাম' })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({ example: 1600.00, description: 'টাকার পরিমাণ' })
  @IsNumber()
  @Min(0.01)
  @IsOptional()
  amount?: number;

  @ApiPropertyOptional({ example: 'Updated Note', description: 'নোট' })
  @IsString()
  @IsOptional()
  note?: string;
}

/**
 * Query Expenses DTO
 */
export class QueryExpensesDto extends PaginationQueryDto {
  @ApiPropertyOptional({ example: 'utility', description: 'ক্যাটাগরি ফিল্টার' })
  @IsString()
  @IsOptional()
  category?: string;

  @ApiPropertyOptional({ example: '2026-08-01', description: 'শুরুর তারিখ (YYYY-MM-DD)' })
  @IsString()
  @IsOptional()
  startDate?: string;

  @ApiPropertyOptional({ example: '2026-08-19', description: 'শেষের তারিখ (YYYY-MM-DD)' })
  @IsString()
  @IsOptional()
  endDate?: string;
}
