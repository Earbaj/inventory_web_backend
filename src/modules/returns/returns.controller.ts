import { Controller, Post, Body, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ReturnsService } from './returns.service';
import { ProcessReturnDto } from './dto/return.dto';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { GetUser } from '../../common/decorators/get-user.decorator';

/**
 * Returns & Refunds Controller
 * সেলস রিটার্ন, পণ্য ফেরত এবং ইনভেন্টরি রি-স্টক (Restock) প্রসেস করার এপিআই এন্ডপয়েন্ট।
 */
@ApiTags('Returns & Refunds')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@Controller('api/returns')
export class ReturnsController {
  constructor(private readonly returnsService: ReturnsService) {}

  /**
   * 1. Process Sales Return Endpoint
   * পণ্য ফেরত নেওয়া ও স্টকে যোগ করার এপিআই (পারমিশন: `canProcessReturn` প্রয়োজন)।
   */
  @UseGuards(PermissionsGuard)
  @Permissions('canProcessReturn')
  @Post()
  @ApiOperation({ summary: 'Process product return & restock inventory (Requires permission: canProcessReturn)' })
  processReturn(@Body() processReturnDto: ProcessReturnDto, @GetUser() user: any) {
    return this.returnsService.processReturn(processReturnDto, user);
  }

  /**
   * 2. List Return Transaction History Endpoint
   */
  @Get()
  @ApiOperation({ summary: 'List return transaction history (Paginated)' })
  findAllReturns(@GetUser() user: any, @Query() query: PaginationQueryDto) {
    return this.returnsService.findAllReturns(user, query);
  }
}
