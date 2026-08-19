import { Controller, Get, Post, Body, Put, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ExpensesService } from './expenses.service';
import { CreateExpenseDto, UpdateExpenseDto, QueryExpensesDto } from './dto/expense.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { GetUser } from '../../common/decorators/get-user.decorator';

/**
 * Shop Expenses Controller
 * দোকানের দৈনন্দিন পরিচালনা খরচ (ভাড়া, বিদ্যুৎ বিল, কর্মচারীর বেতন, যাতায়াত) ট্র্যাকিং করার এপিআই এন্ডপয়েন্ট।
 */
@ApiTags('Shop Expenses & Operational Overheads')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@Controller('api/expenses')
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}

  /**
   * 1. Create Expense Endpoint
   */
  @Post()
  @ApiOperation({ summary: 'Create a new operational shop expense record' })
  create(@Body() createExpenseDto: CreateExpenseDto, @GetUser() user: any) {
    return this.expensesService.create(createExpenseDto, user);
  }

  /**
   * 2. List Active Expenses Endpoint
   */
  @Get()
  @ApiOperation({ summary: 'List active shop expenses (Paginated, Category & Date Range Filtered)' })
  findAll(@GetUser() user: any, @Query() query: QueryExpensesDto) {
    return this.expensesService.findAll(user, query);
  }

  /**
   * 3. Get Single Expense By ID Endpoint
   */
  @Get(':id')
  @ApiOperation({ summary: 'Get expense record by ID' })
  findOne(@Param('id') id: string, @GetUser() user: any) {
    return this.expensesService.findOne(id, user);
  }

  /**
   * 4. Update Expense Endpoint
   */
  @Put(':id')
  @ApiOperation({ summary: 'Update expense record' })
  update(
    @Param('id') id: string,
    @Body() updateExpenseDto: UpdateExpenseDto,
    @GetUser() user: any,
  ) {
    return this.expensesService.update(id, updateExpenseDto, user);
  }

  /**
   * 5. Soft-Delete Expense Endpoint
   */
  @Delete(':id')
  @ApiOperation({ summary: 'Soft-delete expense record (Moves to Recycle Bin/Trash)' })
  remove(@Param('id') id: string, @GetUser() user: any) {
    return this.expensesService.remove(id, user);
  }
}
