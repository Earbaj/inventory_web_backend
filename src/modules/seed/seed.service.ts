import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from '../auth/schemas/user.schema';
import { Category, CategoryDocument } from '../inventory/schemas/category.schema';
import { Item, ItemDocument } from '../inventory/schemas/item.schema';
import { Customer, CustomerDocument } from '../customers/schemas/customer.schema';
import { Ledger, LedgerDocument } from '../customers/schemas/ledger.schema';

@Injectable()
export class SeedService {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Category.name) private categoryModel: Model<CategoryDocument>,
    @InjectModel(Item.name) private itemModel: Model<ItemDocument>,
    @InjectModel(Customer.name) private customerModel: Model<CustomerDocument>,
    @InjectModel(Ledger.name) private ledgerModel: Model<LedgerDocument>,
  ) {}

  async seed() {
    this.logger.log('Starting MongoDB Database Seeding...');

    // 1. Seed Users
    const adminEmail = 'admin@shop.com';
    const existingAdmin = await this.userModel.findOne({ email: adminEmail });
    if (!existingAdmin) {
      const passwordHash = await bcrypt.hash('admin123', 10);
      await this.userModel.create({
        name: 'Shop Owner (Admin)',
        email: adminEmail,
        passwordHash,
        role: 'admin',
        permissions: {
          canProcessReturn: true,
          canExportExcel: true,
          canEditCustomers: true,
          canViewBuyPrice: true,
        },
      });
      this.logger.log(`Created default Admin: ${adminEmail} / admin123`);
    }

    const managerEmail = 'manager@shop.com';
    const existingManager = await this.userModel.findOne({ email: managerEmail });
    if (!existingManager) {
      const passwordHash = await bcrypt.hash('admin123', 10);
      await this.userModel.create({
        name: 'John Manager',
        email: managerEmail,
        passwordHash,
        role: 'manager',
        permissions: {
          canProcessReturn: false,
          canExportExcel: true,
          canEditCustomers: false,
          canViewBuyPrice: false,
        },
      });
      this.logger.log(`Created default Manager: ${managerEmail} / admin123`);
    }

    // 2. Seed Categories
    const categoriesCount = await this.categoryModel.countDocuments();
    if (categoriesCount === 0) {
      await this.categoryModel.insertMany([
        { name: 'Electronics', description: 'Computer accessories and gadgets' },
        { name: 'Stationery', description: 'Office supplies, paper, pens' },
        { name: 'Groceries', description: 'Daily essential consumer goods' },
      ]);
      this.logger.log('Seeded initial Categories');
    }

    // 3. Seed Items
    const itemsCount = await this.itemModel.countDocuments();
    if (itemsCount === 0) {
      await this.itemModel.insertMany([
        {
          name: 'Wireless Optical Mouse',
          sku: 'SKU-1001',
          category: 'Electronics',
          sellPrice: 450,
          buyPrice: 320,
          stockQuantity: 45,
          unit: 'pcs',
          lowStockThreshold: 5,
        },
        {
          name: 'Mechanical Keyboard RGB',
          sku: 'SKU-1002',
          category: 'Electronics',
          sellPrice: 2500,
          buyPrice: 1800,
          stockQuantity: 15,
          unit: 'pcs',
          lowStockThreshold: 3,
        },
        {
          name: 'A4 Paper 80GSM Rim',
          sku: 'SKU-2001',
          category: 'Stationery',
          sellPrice: 380,
          buyPrice: 310,
          stockQuantity: 3, // Low stock!
          unit: 'rim',
          lowStockThreshold: 10,
        },
        {
          name: 'Gel Pen Blue 0.5mm',
          sku: 'SKU-2002',
          category: 'Stationery',
          sellPrice: 15,
          buyPrice: 10,
          stockQuantity: 200,
          unit: 'pcs',
          lowStockThreshold: 20,
        },
      ]);
      this.logger.log('Seeded initial Product Catalog items');
    }

    // 4. Seed Customers
    const customerCount = await this.customerModel.countDocuments();
    if (customerCount === 0) {
      const cust = await this.customerModel.create({
        name: 'Rahim Traders',
        phone: '01711000000',
        address: 'Motijheel, Dhaka',
        openingBalance: 0,
        closingBalance: 0,
      });

      await this.ledgerModel.create({
        customerId: cust._id.toString(),
        type: 'opening',
        referenceId: cust._id.toString(),
        date: new Date(),
        description: 'Opening Balance',
        amount: 0,
        previousBalance: 0,
        newBalance: 0,
      });
      this.logger.log('Seeded initial Customer record');
    }

    this.logger.log('Database Seeding Completed Successfully!');
  }
}
