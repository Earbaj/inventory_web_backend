import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuditLogsService } from './audit-logs.service';
import { QueryAuditLogsDto } from './dto/audit-log.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { GetUser } from '../../common/decorators/get-user.decorator';

/**
 * Audit Logs Controller
 * শপের সিকিউরিটি অ্যাক্টিভিটি অডিট ট্রেইল ইতিহাস দেখার এন্ডপয়েন্ট।
 */
@ApiTags('Audit Logs & Security Trail')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'superadmin')
@ApiBearerAuth()
@Controller('api/audit-logs')
export class AuditLogsController {
  constructor(private readonly auditLogsService: AuditLogsService) {}

  /**
   * List Security Audit Logs Endpoint (Admin / SuperAdmin Only)
   */
  @Get()
  @ApiOperation({ summary: 'List security audit trail logs (Shop Admin / SuperAdmin only) (Paginated)' })
  findAll(@GetUser() user: any, @Query() query: QueryAuditLogsDto) {
    return this.auditLogsService.findAll(user, query);
  }
}
