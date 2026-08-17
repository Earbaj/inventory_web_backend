import { Controller, Get, Post, Body, Put, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CustomersService } from './customers.service';
import { CreateCustomerDto, UpdateCustomerDto } from './dto/customer.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { GetUser } from '../../common/decorators/get-user.decorator';

/**
 * Customers Controller
 * কাস্টমার সম্পর্কিত এইচটিটিপি রাউটসমূহ (কাস্টমার তৈরি, তালিকা, এডিট, সফট-ডিলিট এবং লেজার খাতা)।
 */
@ApiTags('Customers & Ledger')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@Controller('api/customers')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  /**
   * 1. Create Customer Endpoint
   * নতুন কাস্টমার এন্ট্রি করা (ফ্রি টিয়ারে সর্বোচ্চ ১ জন কাস্টমার তৈরি করা যায়)।
   */
  @Post()
  @ApiOperation({ summary: 'Create new customer (Max 1 for Free Tier)' })
  create(@Body() createCustomerDto: CreateCustomerDto, @GetUser() user: any) {
    return this.customersService.create(createCustomerDto, user);
  }

  /**
   * 2. List All Active Customers Endpoint
   * নিজের শপের এক্টিভ কাস্টমারদের তালিকা পাওয়া।
   */
  @Get()
  @ApiOperation({ summary: 'List all shop customers' })
  findAll(@GetUser() user: any) {
    return this.customersService.findAll(user);
  }

  /**
   * 3. Get Single Customer Profile Endpoint
   */
  @Get(':id')
  @ApiOperation({ summary: 'Get customer by ID' })
  findOne(@Param('id') id: string, @GetUser() user: any) {
    return this.customersService.findOne(id, user);
  }

  /**
   * 4. Update Customer Info Endpoint
   * কাস্টমার প্রোফাইল আপডেট করা (পারমিশন: `canEditCustomers` প্রয়োজন)।
   */
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

  /**
   * 5. Soft-Delete Customer Endpoint
   * কাস্টমার ডিলিট করা (ডাটা পুরোপুরি মুছে না গিয়ে রিসাইকেল বিনে জমা হবে)।
   */
  @UseGuards(PermissionsGuard)
  @Permissions('canEditCustomers')
  @Delete(':id')
  @ApiOperation({ summary: 'Delete customer (Moves to Recycle Bin/Trash)' })
  remove(@Param('id') id: string, @GetUser() user: any) {
    return this.customersService.remove(id, user);
  }

  /**
   * 6. Get Customer Ledger Statement Endpoint
   * কাস্টমারের সম্পূর্ণ লেনদেনের স্টেটমেন্ট বা হিসাবের খাতা পাওয়া।
   */
  @Get(':id/ledger')
  @ApiOperation({ summary: 'Get transaction statement ledger for customer' })
  getLedger(@Param('id') id: string, @GetUser() user: any) {
    return this.customersService.getLedger(id, user);
  }
}
