import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Sale, SaleDocument } from './schemas/sale.schema';
import { Item, ItemDocument } from '../inventory/schemas/item.schema';
import { Customer, CustomerDocument } from '../customers/schemas/customer.schema';
import { Ledger, LedgerDocument } from '../customers/schemas/ledger.schema';
import { CreateSaleDto } from './dto/sales.dto';

@Injectable()
export class SalesService {
  constructor(
    @InjectModel(Sale.name) private saleModel: Model<SaleDocument>,
    @InjectModel(Item.name) private itemModel: Model<ItemDocument>,
    @InjectModel(Customer.name) private customerModel: Model<CustomerDocument>,
    @InjectModel(Ledger.name) private ledgerModel: Model<LedgerDocument>,
  ) {}

  async createSale(createSaleDto: CreateSaleDto, user: any) {
    if (!createSaleDto.items || createSaleDto.items.length === 0) {
      throw new BadRequestException('Sale must contain at least one item');
    }

    let subtotal = 0;
    const saleItems = [];

    // Process each item, check stock, update stock
    for (const reqItem of createSaleDto.items) {
      const item = await this.itemModel.findById(reqItem.itemId);
      if (!item) {
        throw new NotFoundException(`Item with ID '${reqItem.itemId}' not found`);
      }

      if (item.stockQuantity < reqItem.quantity) {
        throw new BadRequestException(`Insufficient stock for '${item.name}'. Available: ${item.stockQuantity}, Requested: ${reqItem.quantity}`);
      }

      const discountVal = reqItem.discount || 0;
      const discountType = reqItem.discountType || 'amount';
      const unitPrice = reqItem.unitPrice;

      let itemTotal = 0;
      if (discountType === 'percent') {
        const factor = (100 - discountVal) / 100;
        itemTotal = unitPrice * reqItem.quantity * factor;
      } else {
        itemTotal = (unitPrice * reqItem.quantity) - discountVal;
      }
      itemTotal = Math.max(0, itemTotal);

      subtotal += itemTotal;

      // Deduct stock quantity
      item.stockQuantity -= reqItem.quantity;
      await item.save();

      saleItems.push({
        itemId: item._id.toString(),
        name: item.name,
        quantity: reqItem.quantity,
        unitPrice,
        discount: discountVal,
        discountType,
        totalPrice: itemTotal,
      });
    }

    const globalDiscount = createSaleDto.discount || 0;
    const grandTotal = Math.max(0, subtotal - globalDiscount);
    const paidAmount = createSaleDto.paidAmount || 0;
    const dueAmount = Math.max(0, grandTotal - paidAmount);

    let paymentStatus = 'due';
    if (dueAmount === 0) {
      paymentStatus = 'paid';
    } else if (paidAmount > 0) {
      paymentStatus = 'partial';
    }

    // Generate Invoice Number
    const count = await this.saleModel.countDocuments();
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const invoiceNumber = `INV-${dateStr}-${(count + 1).toString().padStart(4, '0')}`;

    const customerId = createSaleDto.customerId || 'walk-in';
    let customerName = createSaleDto.customerName || 'Walk-in Customer';
    let customerPhone = createSaleDto.customerPhone || '';

    let customer: CustomerDocument | null = null;
    if (customerId !== 'walk-in') {
      customer = await this.customerModel.findById(customerId);
      if (customer) {
        customerName = customer.name;
        customerPhone = customer.phone;
      }
    }

    const sale = new this.saleModel({
      invoiceNumber,
      customerId,
      customerName,
      customerPhone,
      items: saleItems,
      subtotal,
      discount: globalDiscount,
      grandTotal,
      paidAmount,
      dueAmount,
      paymentStatus,
      date: new Date(),
      createdBy: user.uid || user.id,
      createdByName: user.name || 'Cashier',
      isReturned: 'none',
    });

    const savedSale = await sale.save();

    // If registered customer, update closing balance and add ledger entry
    if (customer && customerId !== 'walk-in') {
      const prevBalance = customer.closingBalance;
      // Sale increases customer due (reduces balance) or uses advance balance
      // net balance change = paidAmount - grandTotal
      const balanceChange = paidAmount - grandTotal;
      const newBalance = prevBalance + balanceChange;

      customer.closingBalance = newBalance;
      await customer.save();

      const ledger = new this.ledgerModel({
        customerId: customer._id.toString(),
        type: 'sale',
        referenceId: savedSale._id.toString(),
        date: new Date(),
        description: `Invoice #${invoiceNumber} (Total: ${grandTotal}, Paid: ${paidAmount})`,
        amount: -grandTotal,
        previousBalance: prevBalance,
        newBalance: newBalance,
      });

      await ledger.save();
    }

    return this.formatSale(savedSale);
  }

  async findAllSales(cashierId?: string, paymentStatus?: string) {
    const query: any = {};
    if (cashierId) query.createdBy = cashierId;
    if (paymentStatus) query.paymentStatus = paymentStatus;

    const sales = await this.saleModel.find(query).sort({ createdAt: -1 }).exec();
    return sales.map(s => this.formatSale(s));
  }

  async findOneSale(id: string) {
    const sale = await this.saleModel.findById(id);
    if (!sale) throw new NotFoundException('Sale record not found');
    return this.formatSale(sale);
  }

  async findByInvoice(invoiceNumber: string) {
    const sale = await this.saleModel.findOne({ invoiceNumber });
    if (!sale) throw new NotFoundException('Invoice not found');
    return this.formatSale(sale);
  }

  public formatSale(sale: SaleDocument) {
    return {
      id: sale._id.toString(),
      invoiceNumber: sale.invoiceNumber,
      customerId: sale.customerId,
      customerName: sale.customerName,
      customerPhone: sale.customerPhone,
      items: sale.items.map(i => ({
        itemId: i.itemId,
        name: i.name,
        quantity: i.quantity,
        unitPrice: i.unitPrice.toString(),
        discount: i.discount.toString(),
        discountType: i.discountType,
        totalPrice: i.totalPrice.toString(),
      })),
      subtotal: sale.subtotal.toString(),
      discount: sale.discount.toString(),
      grandTotal: sale.grandTotal.toString(),
      paidAmount: sale.paidAmount.toString(),
      dueAmount: sale.dueAmount.toString(),
      paymentStatus: sale.paymentStatus,
      date: sale.date,
      createdBy: sale.createdBy,
      createdByName: sale.createdByName,
      isReturned: sale.isReturned,
    };
  }
}
