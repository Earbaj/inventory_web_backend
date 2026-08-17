import { Injectable, NotFoundException, BadRequestException, ForbiddenException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Item, ItemDocument } from '../inventory/schemas/item.schema';
import { Customer, CustomerDocument } from '../customers/schemas/customer.schema';
import { Sale, SaleDocument } from '../sales/schemas/sale.schema';
import { Return, ReturnDocument } from '../returns/schemas/return.schema';
import { Ledger, LedgerDocument } from '../customers/schemas/ledger.schema';

@Injectable()
export class TrashService {
  private readonly logger = new Logger(TrashService.name);

  constructor(
    @InjectModel(Item.name) private itemModel: Model<ItemDocument>,
    @InjectModel(Customer.name) private customerModel: Model<CustomerDocument>,
    @InjectModel(Sale.name) private saleModel: Model<SaleDocument>,
    @InjectModel(Return.name) private returnModel: Model<ReturnDocument>,
    @InjectModel(Ledger.name) private ledgerModel: Model<LedgerDocument>,
  ) {}

  /**
   * Get all soft-deleted records for the user's shop
   */
  async getTrashItems(user: any) {
    const shopId = user.shopId;

    const [deletedItems, deletedCustomers, deletedSales, deletedReturns] = await Promise.all([
      this.itemModel.find({ shopId, isDeleted: true }).sort({ deletedAt: -1 }).exec(),
      this.customerModel.find({ shopId, isDeleted: true }).sort({ deletedAt: -1 }).exec(),
      this.saleModel.find({ shopId, isDeleted: true }).sort({ deletedAt: -1 }).exec(),
      this.returnModel.find({ shopId, isDeleted: true }).sort({ deletedAt: -1 }).exec(),
    ]);

    return {
      items: deletedItems.map(i => ({
        id: i._id.toString(),
        entityType: 'item',
        name: i.name,
        sku: i.sku,
        sellPrice: i.sellPrice,
        stockQuantity: i.stockQuantity,
        deletedAt: i.deletedAt,
        deletedBy: i.deletedBy,
      })),
      customers: deletedCustomers.map(c => ({
        id: c._id.toString(),
        entityType: 'customer',
        name: c.name,
        phone: c.phone,
        closingBalance: c.closingBalance,
        deletedAt: c.deletedAt,
        deletedBy: c.deletedBy,
      })),
      sales: deletedSales.map(s => ({
        id: s._id.toString(),
        entityType: 'sale',
        invoiceNumber: s.invoiceNumber,
        customerName: s.customerName,
        grandTotal: s.grandTotal,
        deletedAt: s.deletedAt,
        deletedBy: s.deletedBy,
      })),
      returns: deletedReturns.map(r => ({
        id: r._id.toString(),
        entityType: 'return',
        invoiceNumber: r.invoiceNumber,
        totalRefund: r.totalRefund,
        deletedAt: r.deletedAt,
        deletedBy: r.deletedBy,
      })),
    };
  }

  /**
   * Restore a soft-deleted item back to active database list
   */
  async restoreItem(entityType: string, id: string, user: any) {
    const shopId = user.shopId;
    const type = entityType.toLowerCase();

    if (type === 'item' || type === 'items' || type === 'inventory') {
      const item = await this.itemModel.findOne({ _id: id, shopId, isDeleted: true });
      if (!item) throw new NotFoundException('Deleted inventory item not found in trash');
      item.isDeleted = false;
      item.deletedAt = null;
      item.deletedBy = null;
      await item.save();
      this.logger.log(`Restored item ${id} for shop ${shopId}`);
      return { message: `Inventory item '${item.name}' successfully restored back to active inventory table.`, item };
    }

    if (type === 'customer' || type === 'customers') {
      const customer = await this.customerModel.findOne({ _id: id, shopId, isDeleted: true });
      if (!customer) throw new NotFoundException('Deleted customer not found in trash');
      customer.isDeleted = false;
      customer.deletedAt = null;
      customer.deletedBy = null;
      await customer.save();

      // Restore associated ledgers
      await this.ledgerModel.updateMany({ customerId: id, shopId }, { isDeleted: false, deletedAt: null, deletedBy: null });
      this.logger.log(`Restored customer ${id} for shop ${shopId}`);
      return { message: `Customer '${customer.name}' successfully restored back to active customers table.`, customer };
    }

    if (type === 'sale' || type === 'sales') {
      const sale = await this.saleModel.findOne({ _id: id, shopId, isDeleted: true });
      if (!sale) throw new NotFoundException('Deleted sale invoice not found in trash');
      sale.isDeleted = false;
      sale.deletedAt = null;
      sale.deletedBy = null;
      await sale.save();
      this.logger.log(`Restored sale invoice ${sale.invoiceNumber} for shop ${shopId}`);
      return { message: `Sale Invoice #${sale.invoiceNumber} successfully restored back to active sales table.`, sale };
    }

    if (type === 'return' || type === 'returns') {
      const ret = await this.returnModel.findOne({ _id: id, shopId, isDeleted: true });
      if (!ret) throw new NotFoundException('Deleted return record not found in trash');
      ret.isDeleted = false;
      ret.deletedAt = null;
      ret.deletedBy = null;
      await ret.save();
      this.logger.log(`Restored return record ${id} for shop ${shopId}`);
      return { message: `Return record for invoice #${ret.invoiceNumber} successfully restored back to active returns table.`, returnRecord: ret };
    }

    throw new BadRequestException("Invalid entityType. Supported entityTypes: 'item', 'customer', 'sale', 'return'");
  }

  /**
   * Permanently delete (Hard Delete) a record from MongoDB database storage
   */
  async permanentDelete(entityType: string, id: string, user: any) {
    if (user.role !== 'admin' && user.role !== 'superadmin') {
      throw new ForbiddenException('Only Shop Admins can permanently hard-delete records from database');
    }

    const shopId = user.shopId;
    const type = entityType.toLowerCase();

    if (type === 'item' || type === 'items' || type === 'inventory') {
      const res = await this.itemModel.findOneAndDelete({ _id: id, shopId, isDeleted: true });
      if (!res) throw new NotFoundException('Deleted inventory item not found in trash');
      this.logger.log(`PERMANENTLY DELETED item ${id} for shop ${shopId}`);
      return { message: `Inventory item '${res.name}' has been permanently purged from MongoDB storage.` };
    }

    if (type === 'customer' || type === 'customers') {
      const res = await this.customerModel.findOneAndDelete({ _id: id, shopId, isDeleted: true });
      if (!res) throw new NotFoundException('Deleted customer not found in trash');
      await this.ledgerModel.deleteMany({ customerId: id, shopId });
      this.logger.log(`PERMANENTLY DELETED customer ${id} for shop ${shopId}`);
      return { message: `Customer '${res.name}' and associated ledgers have been permanently purged from MongoDB storage.` };
    }

    if (type === 'sale' || type === 'sales') {
      const res = await this.saleModel.findOneAndDelete({ _id: id, shopId, isDeleted: true });
      if (!res) throw new NotFoundException('Deleted sale invoice not found in trash');
      this.logger.log(`PERMANENTLY DELETED sale invoice ${res.invoiceNumber} for shop ${shopId}`);
      return { message: `Sale Invoice #${res.invoiceNumber} has been permanently purged from MongoDB storage.` };
    }

    if (type === 'return' || type === 'returns') {
      const res = await this.returnModel.findOneAndDelete({ _id: id, shopId, isDeleted: true });
      if (!res) throw new NotFoundException('Deleted return record not found in trash');
      this.logger.log(`PERMANENTLY DELETED return record ${id} for shop ${shopId}`);
      return { message: `Return record for invoice #${res.invoiceNumber} has been permanently purged from MongoDB storage.` };
    }

    throw new BadRequestException("Invalid entityType. Supported entityTypes: 'item', 'customer', 'sale', 'return'");
  }
}
