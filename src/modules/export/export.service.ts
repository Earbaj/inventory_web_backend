import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Item, ItemDocument } from '../inventory/schemas/item.schema';
import { Customer, CustomerDocument } from '../customers/schemas/customer.schema';
import { Ledger, LedgerDocument } from '../customers/schemas/ledger.schema';
import { Sale, SaleDocument } from '../sales/schemas/sale.schema';

/**
 * Bulk CSV Export Service
 * ইনভেন্টরি, কাস্টমার ব্যালেন্স, বিক্রি ইনভয়েস এবং কাস্টমার লেজার সিএসভি ফাইল হিসেবে এক্সপোর্ট করার সার্ভিস।
 */
@Injectable()
export class ExportService {
  constructor(
    @InjectModel(Item.name) private itemModel: Model<ItemDocument>,
    @InjectModel(Customer.name) private customerModel: Model<CustomerDocument>,
    @InjectModel(Ledger.name) private ledgerModel: Model<LedgerDocument>,
    @InjectModel(Sale.name) private saleModel: Model<SaleDocument>,
  ) {}

  /**
   * Helper: Escape CSV cell strings
   */
  private escapeCsv(val: any): string {
    if (val === null || val === undefined) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  }

  /**
   * 1. Export Inventory Products to CSV
   */
  async exportInventoryCsv(user: any): Promise<string> {
    const items = await this.itemModel.find({ shopId: user.shopId, isDeleted: { $ne: true } }).sort({ name: 1 });

    const canViewBuy = user.role === 'admin' || user.permissions?.canViewBuyPrice;

    const headers = canViewBuy
      ? ['ID', 'Item Name', 'SKU', 'Category', 'Sell Price (BDT)', 'Buy Price (BDT)', 'Stock Qty', 'Unit', 'Low Stock Threshold', 'Status']
      : ['ID', 'Item Name', 'SKU', 'Category', 'Sell Price (BDT)', 'Stock Qty', 'Unit', 'Low Stock Threshold', 'Status'];

    const rows = items.map(i => {
      const isLow = i.stockQuantity <= i.lowStockThreshold;
      const status = i.stockQuantity <= 0 ? 'Out of Stock' : (isLow ? 'Low Stock' : 'In Stock');

      if (canViewBuy) {
        return [
          this.escapeCsv(i._id.toString()),
          this.escapeCsv(i.name),
          this.escapeCsv(i.sku),
          this.escapeCsv(i.category),
          this.escapeCsv(i.sellPrice),
          this.escapeCsv(i.buyPrice),
          this.escapeCsv(i.stockQuantity),
          this.escapeCsv(i.unit),
          this.escapeCsv(i.lowStockThreshold),
          this.escapeCsv(status),
        ].join(',');
      } else {
        return [
          this.escapeCsv(i._id.toString()),
          this.escapeCsv(i.name),
          this.escapeCsv(i.sku),
          this.escapeCsv(i.category),
          this.escapeCsv(i.sellPrice),
          this.escapeCsv(i.stockQuantity),
          this.escapeCsv(i.unit),
          this.escapeCsv(i.lowStockThreshold),
          this.escapeCsv(status),
        ].join(',');
      }
    });

    return [headers.join(','), ...rows].join('\n');
  }

  /**
   * 2. Export Customers & Dues Balances to CSV
   */
  async exportCustomersCsv(user: any): Promise<string> {
    const customers = await this.customerModel.find({ shopId: user.shopId, isDeleted: { $ne: true } }).sort({ name: 1 });

    const headers = ['Customer ID', 'Customer Name', 'Phone', 'Address', 'Opening Balance (BDT)', 'Closing Balance (BDT)', 'Status'];

    const rows = customers.map(c => {
      const status = c.closingBalance < 0 ? 'Due/Baki' : (c.closingBalance > 0 ? 'Advance Credit' : 'Clear');
      return [
        this.escapeCsv(c._id.toString()),
        this.escapeCsv(c.name),
        this.escapeCsv(c.phone),
        this.escapeCsv(c.address),
        this.escapeCsv(c.openingBalance),
        this.escapeCsv(c.closingBalance),
        this.escapeCsv(status),
      ].join(',');
    });

    return [headers.join(','), ...rows].join('\n');
  }

  /**
   * 3. Export Sales Invoices to CSV
   */
  async exportSalesCsv(user: any): Promise<string> {
    const sales = await this.saleModel.find({ shopId: user.shopId, isDeleted: { $ne: true } }).sort({ date: -1 });

    const headers = ['Invoice Number', 'Date', 'Customer Name', 'Customer Phone', 'Subtotal (BDT)', 'Discount (BDT)', 'Grand Total (BDT)', 'Paid Amount (BDT)', 'Due Amount (BDT)', 'Payment Status', 'Created By'];

    const rows = sales.map(s => [
      this.escapeCsv(s.invoiceNumber),
      this.escapeCsv(new Date(s.date).toISOString().split('T')[0]),
      this.escapeCsv(s.customerName || 'Walk-in Customer'),
      this.escapeCsv(s.customerPhone || 'N/A'),
      this.escapeCsv(s.subtotal),
      this.escapeCsv(s.discount),
      this.escapeCsv(s.grandTotal),
      this.escapeCsv(s.paidAmount),
      this.escapeCsv(s.dueAmount),
      this.escapeCsv(s.paymentStatus.toUpperCase()),
      this.escapeCsv(s.createdByName || 'N/A'),
    ].join(','));

    return [headers.join(','), ...rows].join('\n');
  }

  /**
   * 4. Export Single Customer Ledger Statement to CSV
   */
  async exportCustomerLedgerCsv(customerId: string, user: any): Promise<string> {
    const customer = await this.customerModel.findOne({ _id: customerId, shopId: user.shopId, isDeleted: { $ne: true } });
    if (!customer) throw new NotFoundException('Customer record not found');

    const ledger = await this.ledgerModel.find({ customerId, shopId: user.shopId, isDeleted: { $ne: true } }).sort({ date: 1 });

    const headers = ['Transaction Date', 'Type', 'Description', 'Amount (BDT)', 'Previous Balance (BDT)', 'New Balance (BDT)'];

    const rows = ledger.map(l => [
      this.escapeCsv(new Date(l.date).toISOString().split('T')[0]),
      this.escapeCsv(l.type.toUpperCase()),
      this.escapeCsv(l.description),
      this.escapeCsv(l.amount),
      this.escapeCsv(l.previousBalance),
      this.escapeCsv(l.newBalance),
    ].join(','));

    return [
      `"Customer: ${customer.name} (${customer.phone || 'N/A'})"`,
      `"Current Balance: ${customer.closingBalance} BDT"`,
      '',
      headers.join(','),
      ...rows,
    ].join('\n');
  }
}
