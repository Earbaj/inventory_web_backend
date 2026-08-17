import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Return, ReturnDocument } from './schemas/return.schema';
import { Sale, SaleDocument } from '../sales/schemas/sale.schema';
import { Item, ItemDocument } from '../inventory/schemas/item.schema';
import { Customer, CustomerDocument } from '../customers/schemas/customer.schema';
import { Ledger, LedgerDocument } from '../customers/schemas/ledger.schema';
import { ProcessReturnDto } from './dto/return.dto';

@Injectable()
export class ReturnsService {
  constructor(
    @InjectModel(Return.name) private returnModel: Model<ReturnDocument>,
    @InjectModel(Sale.name) private saleModel: Model<SaleDocument>,
    @InjectModel(Item.name) private itemModel: Model<ItemDocument>,
    @InjectModel(Customer.name) private customerModel: Model<CustomerDocument>,
    @InjectModel(Ledger.name) private ledgerModel: Model<LedgerDocument>,
  ) {}

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

        // Calculate unit refund price considering item discount
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

        // Restock inventory item
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

    // Update sale record
    sale.items = updatedSaleItems as any;
    sale.subtotal = newSubtotal;
    sale.grandTotal = newGrandTotal;
    sale.dueAmount = newDue;
    sale.paymentStatus = paymentStatus;
    sale.isReturned = isReturnedStatus;
    await sale.save();

    // Create Return Record
    const returnRecord = new this.returnModel({
      customerId: processReturnDto.customerId || sale.customerId,
      saleId: sale._id.toString(),
      invoiceNumber: sale.invoiceNumber,
      returnedItems: returnedDetails,
      totalRefund,
      date: new Date(),
      processedBy: user.uid || user.id,
      shopId: user.shopId,
      isDeleted: false,
    });

    const savedReturn = await returnRecord.save();

    // If registered customer, credit customer closing balance and write ledger
    const customerId = processReturnDto.customerId || sale.customerId;
    if (customerId && customerId !== 'walk-in') {
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
          description: `Returned items from invoice #${sale.invoiceNumber}`,
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
      date: savedReturn.date,
      processedBy: savedReturn.processedBy,
    };
  }

  async findAllReturns(user: any) {
    const returns = await this.returnModel.find({ shopId: user.shopId, isDeleted: { $ne: true } }).sort({ createdAt: -1 }).exec();
    return returns.map(r => ({
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
      date: r.date,
      processedBy: r.processedBy,
    }));
  }
}
