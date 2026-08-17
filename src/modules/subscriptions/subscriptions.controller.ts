import { Controller, Get, Post, Patch, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { SubscriptionsService } from './subscriptions.service';
import { SubmitManualPaymentDto, RejectPaymentDto } from './dto/subscription.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { GetUser } from '../../common/decorators/get-user.decorator';

@ApiTags('Subscriptions & Manual Payments')
@Controller('api/subscriptions')
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Get('packages')
  @ApiOperation({ summary: 'Get list of available subscription packages' })
  getPackages() {
    return this.subscriptionsService.getPackages();
  }

  @Get('payment-info')
  @ApiOperation({ summary: 'Get manual payment instructions & merchant bKash/Nagad details' })
  getPaymentInfo() {
    return this.subscriptionsService.getPaymentInfo();
  }

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

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('payments/my')
  @ApiOperation({ summary: 'Get payment request history for current shop' })
  getMyPaymentRequests(@GetUser() user: any) {
    return this.subscriptionsService.getMyPaymentRequests(user);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('superadmin')
  @ApiBearerAuth()
  @Get('payments/pending')
  @ApiOperation({ summary: 'List all pending subscription payment requests (SuperAdmin only)' })
  getPendingPayments(@GetUser() user: any) {
    return this.subscriptionsService.getPendingPayments(user);
  }

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
