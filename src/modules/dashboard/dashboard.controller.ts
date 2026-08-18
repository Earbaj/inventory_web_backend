import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { GetUser } from '../../common/decorators/get-user.decorator';

/**
 * Dashboard & Reports Controller
 * ব্যবসায়িক ওভারভিউ, বিক্রয় ইনসাইট ও সুপার অ্যাডমিন প্ল্যাটফর্ম মেট্রিক্সের এইচটিটিপি রাউটস।
 */
@ApiTags('Dashboard & Reports')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@Controller('api')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  /**
   * 1. Get Shop Dashboard Stats Endpoint
   * শপের সামগ্রিক KPIs (মোট বিক্রি, ক্যাশ সংগ্রহ, মোট বাকি, নিট লাভ, কম স্টকের পণ্য সংকেত) পাওয়ার রাউট।
   */
  @Get('dashboard/stats')
  @ApiOperation({ summary: 'Get overall KPIs (Total Sales, Net Profit, Low Stock count, Outstanding Due, etc.)' })
  getDashboardStats(@GetUser() user: any) {
    return this.dashboardService.getDashboardStats(user);
  }

  /**
   * 2. Get SuperAdmin Platform Dashboard Endpoint
   * প্ল্যাটফর্মের মোট শপ সংখ্যা, সাবস্ক্রিপশন ফি সংগ্রহ, পেন্ডিং পেমেন্ট রিকোয়েস্ট ও স্ট্যাটস দেখার রাউট।
   */
  @Get('dashboard/superadmin')
  @ApiOperation({ summary: 'Get SuperAdmin platform overview metrics (Shops count, Revenue, Pending Payments)' })
  getSuperAdminDashboard(@GetUser() user: any) {
    return this.dashboardService.getSuperAdminDashboard(user);
  }

  /**
   * 3. Get Filtered Sales Report Endpoint
   * তারিখ ফিল্টার, ক্যাশিয়ার আইডি এবং পেজিনেশন দিয়ে ফিল্টারকৃত বিস্তারিত বিক্রয় রিপোর্ট পাওয়ার রাউট।
   */
  @Get('reports/sales')
  @ApiOperation({ summary: 'Get aggregated sales report filtered by date range, cashier, and pagination' })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  @ApiQuery({ name: 'cashierId', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  getSalesReport(
    @GetUser() user: any,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('cashierId') cashierId?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.dashboardService.getSalesReport(user, startDate, endDate, cashierId, page, limit);
  }
}
