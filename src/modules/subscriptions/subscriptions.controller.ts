import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { SubscriptionsService } from './subscriptions.service';
import { SubmitManualPaymentDto, RejectPaymentDto } from './dto/subscription.dto';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { GetUser } from '../../common/decorators/get-user.decorator';

/**
 * Subscriptions & Manual Payments Controller
 * প্ল্যাটফর্ম সাবস্ক্রিপশন প্যাকেজ, বিকাশ/নগদ পেমেন্ট রিকোয়েস্ট এবং সুপার অ্যাডমিন পেমেন্ট এপ্রুভাল এপিআই এন্ডপয়েন্ট।
 */
@ApiTags('Subscriptions & Manual Payments')
@Controller('api/subscriptions')
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  /**
   * 1. Get List of Available Subscription Packages Endpoint
   * সকল সাবস্ক্রিপশন প্যাকেজের ক্যাটালগ ও লিমিট পাওয়া।
   */
  @Get('packages')
  @ApiOperation({ summary: 'Get list of available subscription packages' })
  getPackages() {
    return this.subscriptionsService.getPackages();
  }

  /**
   * 2. Get Manual Payment Instructions Endpoint
   * বিকাশ/নগদ মার্চেন্ট নম্বর এবং টাকা পাঠানোর নিয়মাবলী পাওয়া।
   */
  @Get('payment-info')
  @ApiOperation({ summary: 'Get manual payment instructions & merchant bKash/Nagad details' })
  getPaymentInfo() {
    return this.subscriptionsService.getPaymentInfo();
  }

  /**
   * 3. Submit Manual Subscription Payment Request Endpoint (Shop Admin Only)
   * শপ ওনার পেমেন্ট করার পর ট্রানজেকশন আইডি (TrxID) ও ফোন নম্বর জমা দেওয়ার এপিআই।
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'superadmin')
  @ApiBearerAuth()
  @Post('payments/manual')
  @ApiOperation({ summary: 'Submit manual subscription payment request with TrxID (Shop Admin)' })
  submitManualPayment(
    @Body() dto: SubmitManualPaymentDto,
    @GetUser() user: any,
  ) {
    return this.subscriptionsService.submitManualPayment(dto, user);
  }

  /**
   * 4. Get Payment Request History for Current Shop Endpoint
   */
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('payments/my')
  @ApiOperation({ summary: 'Get payment request history for current shop (Paginated)' })
  getMyPaymentRequests(@GetUser() user: any, @Query() query: PaginationQueryDto) {
    return this.subscriptionsService.getMyPaymentRequests(user, query);
  }

  /**
   * 5. List Pending Subscription Payments Endpoint (SuperAdmin Only)
   * সুপার অ্যাডমিনের জন্য সকল পেন্ডিং পেমেন্ট রিকোয়েস্টের তালিকা।
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('superadmin')
  @ApiBearerAuth()
  @Get('payments/pending')
  @ApiOperation({ summary: 'List all pending subscription payment requests (SuperAdmin only) (Paginated)' })
  getPendingPayments(@GetUser() user: any, @Query() query: PaginationQueryDto) {
    return this.subscriptionsService.getPendingPayments(user, query);
  }

  /**
   * 6. Approve Subscription Payment Request Endpoint (SuperAdmin Only)
   * পেমেন্ট এপ্রুভ করা এবং শপের প্রিমিয়াম মেয়াদের তারিখ (৩০ বা ৩৬৫ দিন) বাড়িয়ে দেওয়া।
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('superadmin')
  @ApiBearerAuth()
  @Patch('payments/:id/approve')
  @ApiOperation({ summary: 'Approve subscription payment request & extend tier expiry (SuperAdmin only)' })
  approvePayment(
    @Param('id') paymentId: string,
    @GetUser() user: any,
  ) {
    return this.subscriptionsService.approvePayment(paymentId, user);
  }

  /**
   * 7. Reject Subscription Payment Request Endpoint (SuperAdmin Only)
   * ভুল পেমেন্ট রিকোয়েস্ট কারণ উল্লেখ করে রিজেক্ট করা।
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('superadmin')
  @ApiBearerAuth()
  @Patch('payments/:id/reject')
  @ApiOperation({ summary: 'Reject subscription payment request with reason (SuperAdmin only)' })
  rejectPayment(
    @Param('id') paymentId: string,
    @Body() dto: RejectPaymentDto,
    @GetUser() user: any,
  ) {
    return this.subscriptionsService.rejectPayment(paymentId, dto, user);
  }
}
