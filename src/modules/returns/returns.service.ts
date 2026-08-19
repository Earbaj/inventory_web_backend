import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Return, ReturnDocument } from './schemas/return.schema';
import { Sale, SaleDocument } from '../sales/schemas/sale.schema';
import { Item, ItemDocument } from '../inventory/schemas/item.schema';
import { Customer, CustomerDocument } from '../customers/schemas/customer.schema';
import { Ledger, LedgerDocument } from '../customers/schemas/ledger.schema';
import { ProcessReturnDto } from './dto/return.dto';

/**
 * Sales Returns & Restocking Service
 * পণ্য ফেরত, স্টকে পণ্য রি-স্টক (Restock) করা, ইনভয়েস মূল্য পুনর্গণনা এবং কাস্টমার লেজার অ্যাডজাস্টমেন্ট করার সার্ভিস।
 */
@Injectable()
export class ReturnsService {
  constructor(
    @InjectModel(Return.name) private returnModel: Model<ReturnDocument>,
    @InjectModel(Sale.name) private saleModel: Model<SaleDocument>,
    @InjectModel(Item.name) private itemModel: Model<ItemDocument>,
    @InjectModel(Customer.name) private customerModel: Model<CustomerDocument>,
    @InjectModel(Ledger.name) private ledgerModel: Model<LedgerDocument>,
  ) {}

  /**
   * 1. Process Sales Return
   * ইনভয়েস থেকে পণ্য ফেরত প্রসেস করা:
   * - প্রতিটি পণ্যের ইউনিট রিফান্ড প্রাইস হিসাব করা।
   * - পণ্য পুনরায় স্টকে রি-স্টক (Restock: stockQuantity += quantity) করা।
   * - মূল ইনভয়েসের সাবটোটাল, গ্র্যান্ড টোটাল এবং বাকি (Due) আপডেট করা।
   * - রেজিস্টার্ড কাস্টমার হলে তার ব্যালেন্স ও লেজার স্টেটমেন্ট খাতায় 'return' হিসাব যুক্ত করা।
   */
  async processReturn(processReturnDto: ProcessReturnDto, user: any) {
    const sale = await this.saleModel.findOne({ _id: processReturnDto.saleId, shopId: user.shopId, isDeleted: { $ne: true } });
    if (!sale) {
      throw new NotFoundException('Original sale invoice record not found');
    }

    let totalRefund = 0;
    const returnedDetails = [];
    const updatedSaleItems = [];

    for (const saleItem of sale.items) {
      const returnInfo = processReturnDto.returnedItems.find(
        r => r.itemId === saleItem.itemId,
      );

      if (returnInfo) {
        if (returnInfo.quantity > saleItem.quantity) {
          throw new BadRequestException(`Cannot return more than purchased quantity (${saleItem.quantity}) for '${saleItem.name}'`);
        }

        // ডিসকাউন্ট বিবেচনা করে প্রতিটি পণ্যের রিফান্ড মূল্য হিসাব করা
        let finalUnitPrice = saleItem.unitPrice;
        if (saleItem.discountType === 'percent') {
          const factor = (100 - saleItem.discount) / 100;
          finalUnitPrice = saleItem.unitPrice * factor;
        } else {
          const discountPerUnit = saleItem.discount / saleItem.quantity;
          finalUnitPrice = saleItem.unitPrice - discountPerUnit;
        }

        const itemRefund = finalUnitPrice * returnInfo.quantity;
        totalRefund += itemRefund;

        // ইনভেন্টরিতে ফেরত দেওয়া প্রোডাক্ট পুনরায় স্টকে যোগ (Restock) করা
        const item = await this.itemModel.findOne({ _id: saleItem.itemId, shopId: user.shopId, isDeleted: { $ne: true } });
        if (item) {
          item.stockQuantity += returnInfo.quantity;
          await item.save();
        }

        returnedDetails.push({
          itemId: saleItem.itemId,
          name: saleItem.name,
          quantity: returnInfo.quantity,
          refundAmountPerUnit: finalUnitPrice,
        });

        const newQty = saleItem.quantity - returnInfo.quantity;
        if (newQty > 0) {
          const newTotal = saleItem.totalPrice - itemRefund;
          updatedSaleItems.push({
            itemId: saleItem.itemId,
            name: saleItem.name,
            quantity: newQty,
            unitPrice: saleItem.unitPrice,
            discount: saleItem.discount,
            discountType: saleItem.discountType,
            totalPrice: Math.max(0, newTotal),
          });
        }
      } else {
        updatedSaleItems.push(saleItem);
      }
    }

    let newSubtotal = 0;
    for (const item of updatedSaleItems) {
      newSubtotal += item.totalPrice;
    }

    const newGrandTotal = Math.max(0, newSubtotal - sale.discount);
    const newDue = Math.max(0, newGrandTotal - sale.paidAmount);
    const paymentStatus = newDue === 0 ? 'paid' : (sale.paidAmount > 0 ? 'partial' : 'due');
    const isReturnedStatus = updatedSaleItems.length === 0 ? 'fully_returned' : 'partially_returned';

    // মেমো/ইনভয়েস আপডেট করা
    sale.items = updatedSaleItems as any;
    sale.subtotal = newSubtotal;
    sale.grandTotal = newGrandTotal;
    sale.dueAmount = newDue;
    sale.paymentStatus = paymentStatus;
    sale.isReturned = isReturnedStatus;
    await sale.save();

    const refundMethod = (processReturnDto.refundMethod || 'cash').toLowerCase();

    // রিটার্ন ট্রানজেকশন রেকর্ড ডাটাবেজে সংরক্ষণ
    const returnRecord = new this.returnModel({
      customerId: processReturnDto.customerId || sale.customerId,
      saleId: sale._id.toString(),
      invoiceNumber: sale.invoiceNumber,
      returnedItems: returnedDetails,
      totalRefund,
      refundMethod,
      date: new Date(),
      processedBy: user.uid || user.id,
      shopId: user.shopId,
      isDeleted: false,
    });

    const savedReturn = await returnRecord.save();

    // শুধুমাত্র 'due_adjust' সিলেক্ট করা হলেই কাস্টমার রেজিস্টার্ড থাকলে তার ব্যালেন্স ও লেজার স্টেটমেন্ট খাতায় 'return' হিসাব যুক্ত হবে
    const customerId = processReturnDto.customerId || sale.customerId;
    if (customerId && customerId !== 'walk-in' && refundMethod === 'due_adjust') {
      const customer = await this.customerModel.findOne({ _id: customerId, shopId: user.shopId, isDeleted: { $ne: true } });
      if (customer) {
        const prevBalance = customer.closingBalance;
        const newBalance = prevBalance + totalRefund;

        customer.closingBalance = newBalance;
        await customer.save();

        const ledger = new this.ledgerModel({
          customerId: customer._id.toString(),
          type: 'return',
          referenceId: savedReturn._id.toString(),
          date: new Date(),
          description: `Returned items from invoice #${sale.invoiceNumber} (Due Adjusted)`,
          amount: totalRefund,
          previousBalance: prevBalance,
          newBalance: newBalance,
          shopId: user.shopId,
          isDeleted: false,
        });

        await ledger.save();
      }
    }

    return {
      id: savedReturn._id.toString(),
      customerId,
      saleId: sale._id.toString(),
      invoiceNumber: sale.invoiceNumber,
      returnedItems: returnedDetails.map(r => ({
        ...r,
        refundAmountPerUnit: r.refundAmountPerUnit.toString(),
      })),
      totalRefund: totalRefund.toString(),
      refundMethod: savedReturn.refundMethod || refundMethod,
      date: savedReturn.date,
      processedBy: savedReturn.processedBy,
    };
  }

  /**
   * 2. List All Return History Records (Paginated)
   */
  async findAllReturns(user: any, query: any = {}) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(query.limit) || 10));
    const skip = (page - 1) * limit;

    const filter: any = { shopId: user.shopId, isDeleted: { $ne: true } };
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
        { invoiceNumber: { $regex: query.search, $options: 'i' } },
        { customerId: { $regex: query.search, $options: 'i' } },
      ];
    }

    const sortField = query.sortBy || 'createdAt';
    const sortDirection = query.sortOrder === 'asc' ? 1 : -1;

    const total = await this.returnModel.countDocuments(filter);
    const returns = await this.returnModel
      .find(filter)
      .sort({ [sortField]: sortDirection })
      .skip(skip)
      .limit(limit)
      .exec();

    const totalPages = Math.ceil(total / limit) || 1;

    return {
      data: returns.map(r => ({
        id: r._id.toString(),
        customerId: r.customerId,
        saleId: r.saleId,
        invoiceNumber: r.invoiceNumber,
        returnedItems: r.returnedItems.map(item => ({
          itemId: item.itemId,
          name: item.name,
          quantity: item.quantity,
          refundAmountPerUnit: item.refundAmountPerUnit.toString(),
        })),
        totalRefund: r.totalRefund.toString(),
        refundMethod: r.refundMethod || 'cash',
        date: r.date,
        processedBy: r.processedBy,
      })),
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
}
