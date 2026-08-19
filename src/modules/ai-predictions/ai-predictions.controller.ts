import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AiPredictionsService } from './ai-predictions.service';
import { AiQueryDto } from './dto/ai-predictions.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { GetUser } from '../../common/decorators/get-user.decorator';

/**
 * Gemini Flash AI Prediction Controller
 * পণ্য চাহিদা পূর্বাভাস, কাস্টমার ক্রেডিট স্কোর এবং এআই শপ বিজনেজ এডভাইজারি এইচটিটিপি রাউটস।
 */
@ApiTags('Gemini Flash AI Predictions & Insights')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@Controller('api/ai')
export class AiPredictionsController {
  constructor(private readonly aiPredictionsService: AiPredictionsService) {}

  /**
   * 1. AI Product Demand & Sales Forecasting Endpoint
   * শপের জন্য Gemini Flash AI চালিত পণ্য চাহিদা পূর্বাভাস ও ডেড স্টক রিস্ক অ্যানালাইসিস।
   */
  @Get('predict-demand')
  @ApiOperation({ summary: 'AI-driven product demand forecasting and slow-moving risk prediction' })
  predictProductDemand(@GetUser() user: any) {
    return this.aiPredictionsService.predictProductDemand(user);
  }

  /**
   * 2. AI Customer Credit Score & Reliability Endpoint
   * কাস্টমারের লেনদেন হিস্ট্রি এনালাইসিস করে ১-১০০ স্কেলে Gemini Flash AI ক্রেডিট স্কোর ও বাকি লিমিট নির্ধারণ।
   */
  @Get('customer-credit-score/:customerId')
  @ApiOperation({ summary: 'AI customer reliability rating (1-100 score, credit risk level & max due limit)' })
  predictCustomerCreditScore(
    @Param('customerId') customerId: string,
    @GetUser() user: any,
  ) {
    return this.aiPredictionsService.predictCustomerCreditScore(customerId, user);
  }

  /**
   * 3. AI Shop Growth & Strategy Advisor Endpoint
   * দোকানদারের ব্যবসা বৃদ্ধি ও লাভ বাড়ানোর জন্য Gemini Flash AI চালিত বিশেষ পরামর্শ ও একশন টিপস।
   */
  @Get('business-advisor')
  @ApiOperation({ summary: 'AI small business growth advisor, health grade & actionable profit tips' })
  getAiBusinessAdvice(@GetUser() user: any) {
    return this.aiPredictionsService.getAiBusinessAdvice(user);
  }
}
