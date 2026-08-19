import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from '../../../common/dto/pagination.dto';

/**
 * Query Audit Logs DTO
 */
export class QueryAuditLogsDto extends PaginationQueryDto {
  @ApiPropertyOptional({ example: 'CREATE_USER', description: 'অ্যাকশন টাইপ ফিল্টার' })
  @IsString()
  @IsOptional()
  action?: string;

  @ApiPropertyOptional({ example: 'user', description: 'এনটিটি টাইপ ফিল্টার (user, item, customer, sale, trash)' })
  @IsString()
  @IsOptional()
  entityType?: string;

  @ApiPropertyOptional({ example: '2026-08-01', description: 'শুরুর তারিখ (YYYY-MM-DD)' })
  @IsString()
  @IsOptional()
  startDate?: string;

  @ApiPropertyOptional({ example: '2026-08-19', description: 'শেষের তারিখ (YYYY-MM-DD)' })
  @IsString()
  @IsOptional()
  endDate?: string;
}
