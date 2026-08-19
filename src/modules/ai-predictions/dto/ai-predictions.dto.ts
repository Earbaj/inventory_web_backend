import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

/**
 * AI Prediction Options DTO
 */
export class AiQueryDto {
  @ApiPropertyOptional({ example: 'bn', description: 'ভাষা নির্বাচন (bn / en)' })
  @IsString()
  @IsOptional()
  lang?: string;
}
