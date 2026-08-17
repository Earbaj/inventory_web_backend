import { Controller, Post, Body, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ReturnsService } from './returns.service';
import { ProcessReturnDto } from './dto/return.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { GetUser } from '../../common/decorators/get-user.decorator';

@ApiTags('Returns & Refunds')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@Controller('api/returns')
export class ReturnsController {
  constructor(private readonly returnsService: ReturnsService) {}

  @UseGuards(PermissionsGuard)
  @Permissions('canProcessReturn')
  @Post()
  @ApiOperation({ summary: 'Process product return & restock inventory (Requires permission: canProcessReturn)' })
  processReturn(@Body() processReturnDto: ProcessReturnDto, @GetUser() user: any) {
    return this.returnsService.processReturn(processReturnDto, user);
  }

  @Get()
  @ApiOperation({ summary: 'List return transaction history' })
  findAllReturns(@GetUser() user: any) {
    return this.returnsService.findAllReturns(user);
  }
}
