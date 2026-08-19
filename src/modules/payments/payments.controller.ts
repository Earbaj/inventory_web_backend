import { Controller, Post, Body, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { ProcessPaymentDto, QueryPaymentsDto } from './dto/payment.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { GetUser } from '../../common/decorators/get-user.decorator';

/**
 * Customer Due Payments Controller
 * কাস্টমারের বাকি আদায় জমার এইচটিটিপি রাউটস।
 */
@ApiTags('Payments & Collections')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@Controller('api/payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  /**
   * 1. Process Customer Due Payment Endpoint
   * কাস্টমারের বকেয়া টাকা আদায় ও জমা এন্ট্রি করার এপিআই এন্ডপয়েন্ট।
   */
  @Post()
  @ApiOperation({ summary: 'Process customer payment against outstanding due balance' })
  processPayment(@Body() processPaymentDto: ProcessPaymentDto, @GetUser() user: any) {
    return this.paymentsService.processPayment(processPaymentDto, user);
  }

  /**
   * 2. List Customer Payments History Endpoint
   * শপের বাকি আদায় জমার পেজিনেটেড ও তারিখ-ভিত্তিক ইতিহাস তালিকা পাওয়া।
   */
  @Get()
  @ApiOperation({ summary: 'List customer payment collection history (Paginated & Date Filtered)' })
  findAllPayments(@GetUser() user: any, @Query() query: QueryPaymentsDto) {
    return this.paymentsService.findAllPayments(user, query);
  }
}
