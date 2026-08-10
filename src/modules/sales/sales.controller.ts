import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { SalesService } from './sales.service';
import { CreateSaleDto } from './dto/sales.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { GetUser } from '../../common/decorators/get-user.decorator';

@ApiTags('Sales & POS Billing')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@Controller('api/sales')
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  @Post()
  @ApiOperation({ summary: 'Process POS billing checkout transaction' })
  createSale(@Body() createSaleDto: CreateSaleDto, @GetUser() user: any) {
    return this.salesService.createSale(createSaleDto, user);
  }

  @Get()
  @ApiOperation({ summary: 'List all sales invoices' })
  @ApiQuery({ name: 'cashierId', required: false })
  @ApiQuery({ name: 'paymentStatus', required: false })
  findAllSales(
    @Query('cashierId') cashierId?: string,
    @Query('paymentStatus') paymentStatus?: string,
  ) {
    return this.salesService.findAllSales(cashierId, paymentStatus);
  }

  @Get('invoice/:invoiceNumber')
  @ApiOperation({ summary: 'Get invoice details by invoice number' })
  findByInvoice(@Param('invoiceNumber') invoiceNumber: string) {
    return this.salesService.findByInvoice(invoiceNumber);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get sale details by ID' })
  findOneSale(@Param('id') id: string) {
    return this.salesService.findOneSale(id);
  }
}
