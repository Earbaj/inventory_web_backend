import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Sale, SaleDocument } from './schemas/sale.schema';
import { Item, ItemDocument } from '../inventory/schemas/item.schema';
import { Customer, CustomerDocument } from '../customers/schemas/customer.schema';
import { Ledger, LedgerDocument } from '../customers/schemas/ledger.schema';
import { CreateSaleDto } from './dto/sales.dto';

/**
 * POS Checkout & Sales Billing Service
 * ইনভয়েস বিলিং, স্টক কমানো, অটোমেটিক মেমো জেনারেট এবং কাস্টমার খাতা/লেজার আপডেট করার সার্ভিস।
 */
@Injectable()
export class SalesService {
  constructor(
    @InjectModel(Sale.name) private saleModel: Model<SaleDocument>,
    @InjectModel(Item.name) private itemModel: Model<ItemDocument>,
    @InjectModel(Customer.name) private customerModel: Model<CustomerDocument>,
    @InjectModel(Ledger.name) private ledgerModel: Model<LedgerDocument>,
  ) {}

  /**
   * 1. Process POS Checkout Sale Transaction
   * বিলিং প্রসেস করা:
   * - ইনভেন্টরি থেকে স্টক সংখ্যা যাচাই করা ও স্টক কমানো।
   * - প্রতিটি পণ্যের ইউনিট প্রাইজ ও ছাড়ের সাবটোটাল হিসাব করা।
   * - ইউনিক ইনভয়েস নম্বর জেনারেট করা (যেমন: INV-20260817-0001)।
   * - রেজিস্টার্ড কাস্টমার হলে তার ব্যালেন্স ও লেজার স্টেটমেন্ট খাতায় 'sale' হিসাব এন্ট্রি দেওয়া।
   * - ফ্রি টিয়ার এনফোর্সমেন্ট: ফ্রি প্যাকেজে সর্বোচ্চ ৫টি পর্যন্ত সেলস করা সম্ভব।
   */
  async createSale(createSaleDto: CreateSaleDto, user: any) {
    if (!createSaleDto.items || createSaleDto.items.length === 0) {
      throw new BadRequestException('Sale must contain at least one item');
    }

    // ফ্রি টিয়ার সেলস ট্রানজেকশন লিমিট চেক (সর্বোচ্চ ৫টি বিক্রি)
    if (user.subscriptionTier === 'free') {
      const saleCount = await this.saleModel.countDocuments({
        shopId: user.shopId,
        isDeleted: { $ne: true },
      });
      if (saleCount >= 5) {
        throw new BadRequestException(
          'Free tier is limited to 5 sales transactions only. Please upgrade to premium.'
        );
      }
    }

    let subtotal = 0;
    const saleItems = [];

    // প্রতিটি পণ্য যাচাই ও স্টক কমানো
    for (const reqItem of createSaleDto.items) {
      const item = await this.itemModel.findOne({
        _id: reqItem.itemId,
        shopId: user.shopId,
        isDeleted: { $ne: true },
      });
      if (!item) {
        throw new NotFoundException(`Item with ID '${reqItem.itemId}' not found in your inventory`);
      }

      // পণ্যের স্টক আছে কিনা পরীক্ষা
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

      // ইনভেন্টরি থেকে পণ্যের স্টক সংখ্যা কমিয়ে দেওয়া
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

    // ইউনিক শপ-ভিত্তিক ইনভয়েস সিরিয়াল নম্বর জেনারেট করা
    const count = await this.saleModel.countDocuments({ shopId: user.shopId });
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const invoiceNumber = `INV-${dateStr}-${(count + 1).toString().padStart(4, '0')}`;

    const customerId = createSaleDto.customerId || 'walk-in';
    let customerName = createSaleDto.customerName || 'Walk-in Customer';
    let customerPhone = createSaleDto.customerPhone || '';

    let customer: CustomerDocument | null = null;
    if (customerId !== 'walk-in') {
      customer = await this.customerModel.findOne({
        _id: customerId,
        shopId: user.shopId,
        isDeleted: { $ne: true },
      });
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
      shopId: user.shopId,
      isDeleted: false,
    });

    const savedSale = await sale.save();

    // কাস্টমার রেজিস্টার্ড হলে লেজার খাতা ও ক্লোজিং ব্যালেন্স ডেবিট/ক্যালকুলেট করা
    if (customer && customerId !== 'walk-in') {
      const prevBalance = customer.closingBalance;
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
        shopId: user.shopId,
        isDeleted: false,
      });

      await ledger.save();
    }

    return this.formatSale(savedSale);
  }

  /**
   * 2. List All Active Sales Invoices (Paginated)
   */
  async findAllSales(user: any, query: any = {}) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(query.limit) || 10));
    const skip = (page - 1) * limit;

    const filter: any = { shopId: user.shopId, isDeleted: { $ne: true } };
    if (query.cashierId) filter.createdBy = query.cashierId;
    if (query.paymentStatus) filter.paymentStatus = query.paymentStatus;
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
        { customerName: { $regex: query.search, $options: 'i' } },
        { customerPhone: { $regex: query.search, $options: 'i' } },
      ];
    }

    const sortField = query.sortBy || 'date';
    const sortDirection = query.sortOrder === 'asc' ? 1 : -1;

    const total = await this.saleModel.countDocuments(filter);
    const sales = await this.saleModel
      .find(filter)
      .sort({ [sortField]: sortDirection })
      .skip(skip)
      .limit(limit)
      .exec();

    const totalPages = Math.ceil(total / limit) || 1;

    return {
      data: sales.map(s => this.formatSale(s)),
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
   * 3. Get Sale Details By ID
   */
  async findOneSale(id: string, user: any) {
    const sale = await this.saleModel.findOne({ _id: id, shopId: user.shopId, isDeleted: { $ne: true } });
    if (!sale) throw new NotFoundException('Sale record not found');
    return this.formatSale(sale);
  }

  /**
   * 4. Get Invoice Details By Invoice Number (e.g. INV-20260817-0001)
   */
  async findByInvoice(invoiceNumber: string, user: any) {
    const sale = await this.saleModel.findOne({ invoiceNumber, shopId: user.shopId, isDeleted: { $ne: true } });
    if (!sale) throw new NotFoundException('Invoice not found');
    return this.formatSale(sale);
  }

  /**
   * 5. Generate Direct WhatsApp Invoice Link
   */
  async generateWhatsAppLink(id: string, user: any) {
    const sale = await this.saleModel.findOne({ _id: id, shopId: user.shopId, isDeleted: { $ne: true } });
    if (!sale) throw new NotFoundException('Sale invoice record not found');

    let cleanPhone = (sale.customerPhone || '').replace(/[^0-9]/g, '');
    if (cleanPhone.startsWith('01')) {
      cleanPhone = '88' + cleanPhone;
    }

    const itemsText = sale.items
      .map(i => `- ${i.name} (x${i.quantity}) = ${i.totalPrice} BDT`)
      .join('\n');

    const message = `🧾 *Keeper POS Invoice Receipt*\n` +
      `Invoice #: ${sale.invoiceNumber}\n` +
      `Customer: ${sale.customerName || 'Valued Customer'}\n` +
      `Date: ${new Date(sale.date).toLocaleDateString('en-GB')}\n` +
      `-------------------------\n` +
      `Items:\n${itemsText}\n` +
      `-------------------------\n` +
      `Subtotal: ${sale.subtotal} BDT\n` +
      `Discount: ${sale.discount} BDT\n` +
      `Grand Total: ${sale.grandTotal} BDT\n` +
      `Paid: ${sale.paidAmount} BDT\n` +
      `Due: ${sale.dueAmount} BDT (${sale.paymentStatus.toUpperCase()})\n\n` +
      `Thank you for your business!`;

    const encodedText = encodeURIComponent(message);
    const whatsappUrl = cleanPhone
      ? `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodedText}`
      : `https://api.whatsapp.com/send?text=${encodedText}`;

    return {
      invoiceNumber: sale.invoiceNumber,
      customerPhone: sale.customerPhone,
      cleanPhone,
      message,
      whatsappUrl,
    };
  }

  /**
   * 6. Generate POS Thermal Printer Printable HTML Helper (80mm/58mm format)
   */
  async generateThermalPrintHtml(invoiceNumber: string, user: any): Promise<string> {
    const sale = await this.saleModel.findOne({ invoiceNumber, shopId: user.shopId, isDeleted: { $ne: true } });
    if (!sale) throw new NotFoundException('Invoice not found');

    const formattedDate = new Date(sale.date).toLocaleString('en-GB');

    const itemRows = sale.items
      .map(
        i => `
      <tr>
        <td style="padding: 4px 0;">${i.name}<br/><small style="color: #666;">${i.quantity} x ৳${i.unitPrice}</small></td>
        <td style="text-align: right; vertical-align: top; padding: 4px 0;">৳${i.totalPrice}</td>
      </tr>`,
      )
      .join('');

    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <title>Receipt ${sale.invoiceNumber}</title>
  <style>
    @page { size: 80mm auto; margin: 0; }
    body {
      font-family: 'Courier New', Courier, monospace;
      width: 78mm;
      margin: 0 auto;
      padding: 10px 5px;
      color: #000;
      background: #fff;
      font-size: 12px;
      line-height: 1.3;
    }
    .text-center { text-align: center; }
    .text-right { text-align: right; }
    .bold { font-weight: bold; }
    .divider { border-top: 1px dashed #000; margin: 8px 0; }
    table { width: 100%; border-collapse: collapse; }
    .total-table td { padding: 2px 0; }
  </style>
</head>
<body onload="window.print()">
  <div class="text-center bold" style="font-size: 16px;">KEEPER POS STORE</div>
  <div class="text-center">Invoice #${sale.invoiceNumber}</div>
  <div class="text-center" style="font-size: 10px;">Date: ${formattedDate}</div>
  <div class="divider"></div>
  <div><strong>Customer:</strong> ${sale.customerName || 'Walk-in Customer'}</div>
  <div><strong>Phone:</strong> ${sale.customerPhone || 'N/A'}</div>
  <div><strong>Served By:</strong> ${sale.createdByName || 'Cashier'}</div>
  <div class="divider"></div>
  <table>
    <thead>
      <tr style="border-bottom: 1px solid #000;">
        <th style="text-align: left;">Item</th>
        <th style="text-align: right;">Total</th>
      </tr>
    </thead>
    <tbody>
      ${itemRows}
    </tbody>
  </table>
  <div class="divider"></div>
  <table class="total-table">
    <tr>
      <td>Subtotal:</td>
      <td class="text-right">৳${sale.subtotal}</td>
    </tr>
    <tr>
      <td>Discount:</td>
      <td class="text-right">৳${sale.discount}</td>
    </tr>
    <tr class="bold" style="font-size: 14px;">
      <td>Grand Total:</td>
      <td class="text-right">৳${sale.grandTotal}</td>
    </tr>
    <tr>
      <td>Paid Amount:</td>
      <td class="text-right">৳${sale.paidAmount}</td>
    </tr>
    <tr class="bold">
      <td>Due Amount:</td>
      <td class="text-right">৳${sale.dueAmount}</td>
    </tr>
    <tr>
      <td>Payment Status:</td>
      <td class="text-right bold" style="text-transform: uppercase;">${sale.paymentStatus}</td>
    </tr>
  </table>
  <div class="divider"></div>
  <div class="text-center bold">THANK YOU FOR YOUR BUSINESS!</div>
  <div class="text-center" style="font-size: 10px; margin-top: 4px;">Powered by Keeper POS SaaS</div>
</body>
</html>`;
  }

  /**
   * Response Formatter Helper
   */
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
