import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SalesService } from './sales.service';
import { CreateSaleDto, QuerySalesDto } from './dto/sales.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { GetUser } from '../../common/decorators/get-user.decorator';

/**
 * Sales & POS Billing Controller
 * পিওএস চেকআউট, ইনভয়েস মেমো জেনারেট এবং বিক্রয় ফিল্টারিং করার এপিআই এন্ডপয়েন্ট।
 */
@ApiTags('Sales & POS Billing')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@Controller('api/sales')
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  /**
   * 1. Process POS Billing Checkout Endpoint
   * নতুন বিক্রি প্রসেস করা ও মেমো জেনারেট করা (ফ্রি টিয়ারে সর্বোচ্চ ৫টি সেলস করা সম্ভব)।
   */
  @Post()
  @ApiOperation({ summary: 'Process POS billing checkout transaction' })
  createSale(@Body() createSaleDto: CreateSaleDto, @GetUser() user: any) {
    return this.salesService.createSale(createSaleDto, user);
  }

  /**
   * 2. List All Sales Invoices Endpoint
   * শপের সকল বিক্রয় ইনভয়েসের পেজিনেটেড তালিকা দেখা (ক্যাশিয়ার, পেমেন্ট স্ট্যাটাস, ডেট ও সার্চ ফিল্টারসহ)।
   */
  @Get()
  @ApiOperation({ summary: 'List all sales invoices (Paginated)' })
  findAllSales(
    @GetUser() user: any,
    @Query() query: QuerySalesDto,
  ) {
    return this.salesService.findAllSales(user, query);
  }

  /**
   * 3. Get Invoice Details By Invoice Number Endpoint
   * ইনভয়েস নম্বর (যেমন: INV-20260817-0001) দিয়ে মেমো তথ্য পাওয়া।
   */
  @Get('invoice/:invoiceNumber')
  @ApiOperation({ summary: 'Get invoice details by invoice number' })
  findByInvoice(@Param('invoiceNumber') invoiceNumber: string, @GetUser() user: any) {
    return this.salesService.findByInvoice(invoiceNumber, user);
  }

  /**
   * 4. Get Sale Details By ID Endpoint
   */
  @Get(':id')
  @ApiOperation({ summary: 'Get sale details by ID' })
  findOneSale(@Param('id') id: string, @GetUser() user: any) {
    return this.salesService.findOneSale(id, user);
  }

  /**
   * 5. Generate WhatsApp Direct Invoice Receipt Link
   */
  @Get(':id/whatsapp-link')
  @ApiOperation({ summary: 'Generate WhatsApp direct chat link for sales invoice receipt' })
  generateWhatsAppLink(@Param('id') id: string, @GetUser() user: any) {
    return this.salesService.generateWhatsAppLink(id, user);
  }
}
