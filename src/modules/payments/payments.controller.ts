import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { ProcessPaymentDto } from './dto/payment.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { GetUser } from '../../common/decorators/get-user.decorator';

@ApiTags('Payments & Collections')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@Controller('api/payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post()
  @ApiOperation({ summary: 'Process customer payment against outstanding due balance' })
  processPayment(@Body() processPaymentDto: ProcessPaymentDto, @GetUser() user: any) {
    return this.paymentsService.processPayment(processPaymentDto, user);
  }
}
