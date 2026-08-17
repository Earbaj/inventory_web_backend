import { Controller, Get, Post, Body, Put, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CustomersService } from './customers.service';
import { CreateCustomerDto, UpdateCustomerDto } from './dto/customer.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { GetUser } from '../../common/decorators/get-user.decorator';

@ApiTags('Customers & Ledger')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@Controller('api/customers')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Post()
  @ApiOperation({ summary: 'Create new customer (Max 1 for Free Tier)' })
  create(@Body() createCustomerDto: CreateCustomerDto, @GetUser() user: any) {
    return this.customersService.create(createCustomerDto, user);
  }

  @Get()
  @ApiOperation({ summary: 'List all shop customers' })
  findAll(@GetUser() user: any) {
    return this.customersService.findAll(user);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get customer by ID' })
  findOne(@Param('id') id: string, @GetUser() user: any) {
    return this.customersService.findOne(id, user);
  }

  @UseGuards(PermissionsGuard)
  @Permissions('canEditCustomers')
  @Put(':id')
  @ApiOperation({ summary: 'Update customer info (Requires permission: canEditCustomers)' })
  update(
    @Param('id') id: string,
    @Body() updateCustomerDto: UpdateCustomerDto,
    @GetUser() user: any,
  ) {
    return this.customersService.update(id, updateCustomerDto, user);
  }

  @UseGuards(PermissionsGuard)
  @Permissions('canEditCustomers')
  @Delete(':id')
  @ApiOperation({ summary: 'Delete customer (Moves to Recycle Bin/Trash)' })
  remove(@Param('id') id: string, @GetUser() user: any) {
    return this.customersService.remove(id, user);
  }

  @Get(':id/ledger')
  @ApiOperation({ summary: 'Get transaction statement ledger for customer' })
  getLedger(@Param('id') id: string, @GetUser() user: any) {
    return this.customersService.getLedger(id, user);
  }
}
