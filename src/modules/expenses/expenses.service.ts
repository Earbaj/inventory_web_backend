import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Expense, ExpenseDocument } from './schemas/expense.schema';
import { CreateExpenseDto, UpdateExpenseDto } from './dto/expense.dto';
import { AuditLogsService } from '../audit-logs/audit-logs.service';

/**
 * Expenses Service
 * দোকানের দৈনন্দিন পরিচালনা খরচ এন্ট্রি, আপডেট, সফট-ডিলিট ও রিপোর্ট হিসেব করার সার্ভিস।
 */
@Injectable()
export class ExpensesService {
  constructor(
    @InjectModel(Expense.name) private expenseModel: Model<ExpenseDocument>,
    private readonly auditLogsService: AuditLogsService,
  ) {}

  /**
   * 1. Create New Expense
   */
  async create(createExpenseDto: CreateExpenseDto, user: any) {
    const expense = new this.expenseModel({
      shopId: user.shopId,
      category: createExpenseDto.category.toLowerCase(),
      title: createExpenseDto.title,
      amount: createExpenseDto.amount,
      date: createExpenseDto.date ? new Date(createExpenseDto.date) : new Date(),
      note: createExpenseDto.note || '',
      createdBy: user.uid || user.id,
      isDeleted: false,
    });

    const saved = await expense.save();

    await this.auditLogsService.logAction({
      shopId: user.shopId,
      user,
      action: 'CREATE_EXPENSE',
      entityType: 'expense',
      entityId: saved._id.toString(),
      details: { title: saved.title, amount: saved.amount, category: saved.category },
    });

    return this.formatExpense(saved);
  }

  /**
   * 2. List All Active Expenses (Paginated & Filtered)
   */
  async findAll(user: any, query: any = {}) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(query.limit) || 10));
    const skip = (page - 1) * limit;

    const filter: any = { shopId: user.shopId, isDeleted: { $ne: true } };
    if (query.category) {
      filter.category = query.category.toLowerCase();
    }
    if (query.startDate || query.endDate) {
      filter.date = {};
      if (query.startDate) filter.date.$gte = new Date(query.startDate);
      if (query.endDate) {
        const end = new Date(query.endDate);
        end.setHours(23, 59, 59, 999);
        filter.date.$lte = end;
      }
    }
    if (query.search) {
      filter.$or = [
        { title: { $regex: query.search, $options: 'i' } },
        { category: { $regex: query.search, $options: 'i' } },
        { note: { $regex: query.search, $options: 'i' } },
      ];
    }

    const sortField = query.sortBy || 'date';
    const sortDirection = query.sortOrder === 'asc' ? 1 : -1;

    const total = await this.expenseModel.countDocuments(filter);
    const expenses = await this.expenseModel
      .find(filter)
      .sort({ [sortField]: sortDirection })
      .skip(skip)
      .limit(limit)
      .exec();

    let totalExpenseAmount = 0;
    expenses.forEach(e => totalExpenseAmount += e.amount);

    const totalPages = Math.ceil(total / limit) || 1;

    return {
      data: expenses.map(e => this.formatExpense(e)),
      totalExpenseAmount: totalExpenseAmount.toString(),
      meta: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  }

  /**
   * 3. Find Single Expense By ID
   */
  async findOne(id: string, user: any) {
    const expense = await this.expenseModel.findOne({
      _id: id,
      shopId: user.shopId,
      isDeleted: { $ne: true },
    });
    if (!expense) throw new NotFoundException('Expense record not found');
    return this.formatExpense(expense);
  }

  /**
   * 4. Update Expense
   */
  async update(id: string, updateExpenseDto: UpdateExpenseDto, user: any) {
    const expense = await this.expenseModel.findOne({
      _id: id,
      shopId: user.shopId,
      isDeleted: { $ne: true },
    });
    if (!expense) throw new NotFoundException('Expense record not found');

    if (updateExpenseDto.category !== undefined) expense.category = updateExpenseDto.category.toLowerCase();
    if (updateExpenseDto.title !== undefined) expense.title = updateExpenseDto.title;
    if (updateExpenseDto.amount !== undefined) expense.amount = updateExpenseDto.amount;
    if (updateExpenseDto.note !== undefined) expense.note = updateExpenseDto.note;

    await expense.save();

    await this.auditLogsService.logAction({
      shopId: user.shopId,
      user,
      action: 'UPDATE_EXPENSE',
      entityType: 'expense',
      entityId: expense._id.toString(),
      details: { title: expense.title, amount: expense.amount },
    });

    return this.formatExpense(expense);
  }

  /**
   * 5. Soft-Delete Expense (Move to Trash)
   */
  async remove(id: string, user: any) {
    const expense = await this.expenseModel.findOne({
      _id: id,
      shopId: user.shopId,
      isDeleted: { $ne: true },
    });
    if (!expense) throw new NotFoundException('Expense record not found');

    expense.isDeleted = true;
    expense.deletedAt = new Date();
    expense.deletedBy = user.uid || user.id;
    await expense.save();

    await this.auditLogsService.logAction({
      shopId: user.shopId,
      user,
      action: 'DELETE_EXPENSE',
      entityType: 'expense',
      entityId: expense._id.toString(),
      details: { title: expense.title, amount: expense.amount },
    });

    return { message: 'Expense record moved to trash (Soft deleted).' };
  }

  /**
   * Response Formatting Helper
   */
  private formatExpense(expense: ExpenseDocument) {
    return {
      id: expense._id.toString(),
      category: expense.category,
      title: expense.title,
      amount: expense.amount.toString(),
      date: expense.date,
      note: expense.note,
      createdBy: expense.createdBy,
    };
  }
}
