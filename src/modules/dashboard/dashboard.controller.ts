import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { GetUser } from '../../common/decorators/get-user.decorator';

@ApiTags('Dashboard & Reports')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@Controller('api')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('dashboard/stats')
  @ApiOperation({ summary: 'Get overall KPIs (Total Sales, Net Profit, Low Stock count, Outstanding Due, etc.)' })
  getDashboardStats(@GetUser() user: any) {
    return this.dashboardService.getDashboardStats(user);
  }

  @Get('reports/sales')
  @ApiOperation({ summary: 'Get aggregated sales report filtered by date range and cashier' })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  @ApiQuery({ name: 'cashierId', required: false })
  getSalesReport(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('cashierId') cashierId?: string,
  ) {
    return this.dashboardService.getSalesReport(startDate, endDate, cashierId);
  }
}
