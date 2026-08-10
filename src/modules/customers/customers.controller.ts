import { Controller, Get, Post, Body, Put, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CustomersService } from './customers.service';
import { CreateCustomerDto, UpdateCustomerDto } from './dto/customer.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { Permissions } from '../../common/decorators/permissions.decorator';

@ApiTags('Customers & Ledger')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@Controller('api/customers')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Post()
  @ApiOperation({ summary: 'Create new customer' })
  create(@Body() createCustomerDto: CreateCustomerDto) {
    return this.customersService.create(createCustomerDto);
  }

  @Get()
  @ApiOperation({ summary: 'List all customers' })
  findAll() {
    return this.customersService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get customer by ID' })
  findOne(@Param('id') id: string) {
    return this.customersService.findOne(id);
  }

  @UseGuards(PermissionsGuard)
  @Permissions('canEditCustomers')
  @Put(':id')
  @ApiOperation({ summary: 'Update customer info (Requires permission: canEditCustomers)' })
  update(@Param('id') id: string, @Body() updateCustomerDto: UpdateCustomerDto) {
    return this.customersService.update(id, updateCustomerDto);
  }

  @UseGuards(PermissionsGuard)
  @Permissions('canEditCustomers')
  @Delete(':id')
  @ApiOperation({ summary: 'Delete customer' })
  remove(@Param('id') id: string) {
    return this.customersService.remove(id);
  }

  @Get(':id/ledger')
  @ApiOperation({ summary: 'Get transaction statement ledger for customer' })
  getLedger(@Param('id') id: string) {
    return this.customersService.getLedger(id);
  }
}
