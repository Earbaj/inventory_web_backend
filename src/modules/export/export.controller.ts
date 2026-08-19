import { Controller, Get, Param, Res, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Response } from 'express';
import { ExportService } from './export.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { GetUser } from '../../common/decorators/get-user.decorator';

/**
 * Bulk CSV Export Controller
 * ইনভেন্টরি, কাস্টমার ব্যালেন্স ও সেলস রিপোর্ট সিএসভি ডাউনলোড করার এপিআই এন্ডপয়েন্ট।
 */
@ApiTags('Bulk CSV Data Export')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@Controller('api/export')
export class ExportController {
  constructor(private readonly exportService: ExportService) {}

  /**
   * 1. Export Inventory Products to CSV
   */
  @Get('inventory')
  @ApiOperation({ summary: 'Export inventory product list to CSV file' })
  async exportInventoryCsv(@GetUser() user: any, @Res() res: Response) {
    const csvData = await this.exportService.exportInventoryCsv(user);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="inventory_export.csv"');
    return res.send(csvData);
  }

  /**
   * 2. Export Customer List to CSV
   */
  @Get('customers')
  @ApiOperation({ summary: 'Export customer list and due balances to CSV file' })
  async exportCustomersCsv(@GetUser() user: any, @Res() res: Response) {
    const csvData = await this.exportService.exportCustomersCsv(user);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="customers_export.csv"');
    return res.send(csvData);
  }

  /**
   * 3. Export Sales Invoices to CSV (Requires permission: `canExportExcel` or Admin)
   */
  @UseGuards(PermissionsGuard)
  @Permissions('canExportExcel')
  @Get('sales')
  @ApiOperation({ summary: 'Export sales invoices history to CSV file (Requires permission: canExportExcel)' })
  async exportSalesCsv(@GetUser() user: any, @Res() res: Response) {
    const csvData = await this.exportService.exportSalesCsv(user);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="sales_export.csv"');
    return res.send(csvData);
  }

  /**
   * 4. Export Single Customer Ledger Statement to CSV
   */
  @Get('ledger/:customerId')
  @ApiOperation({ summary: 'Export single customer transaction ledger statement to CSV file' })
  async exportCustomerLedgerCsv(@Param('customerId') customerId: string, @GetUser() user: any, @Res() res: Response) {
    const csvData = await this.exportService.exportCustomerLedgerCsv(customerId, user);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="customer_${customerId}_ledger.csv"`);
    return res.send(csvData);
  }
}
