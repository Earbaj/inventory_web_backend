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

    // 1. Seed SuperAdmin User
    const superAdminEmail = 'superadmin@keeper.com';
    const existingSuperAdmin = await this.userModel.findOne({ email: superAdminEmail });
    if (!existingSuperAdmin) {
      const passwordHash = await bcrypt.hash('superadmin123', 10);
      await this.userModel.create({
        name: 'Platform Super Admin',
        email: superAdminEmail,
        passwordHash,
        role: 'superadmin',
        subscriptionTier: 'premium',
        shopId: null,
        permissions: {
          canProcessReturn: true,
          canExportExcel: true,
          canEditCustomers: true,
          canViewBuyPrice: true,
        },
      });
      this.logger.log(`Created default SuperAdmin: ${superAdminEmail} / superadmin123`);
    }

    // 2. Seed Admin (Shop Owner)
    const adminEmail = 'admin@shop.com';
    let adminUser = await this.userModel.findOne({ email: adminEmail });
    if (!adminUser) {
      const passwordHash = await bcrypt.hash('admin123', 10);
      const createdAdmin = new this.userModel({
        name: 'Shop Owner (Admin)',
        email: adminEmail,
        passwordHash,
        role: 'admin',
        subscriptionTier: 'free',
        shopId: null,
        permissions: {
          canProcessReturn: true,
          canExportExcel: true,
          canEditCustomers: true,
          canViewBuyPrice: true,
        },
      });
      adminUser = await createdAdmin.save();
      adminUser.shopId = adminUser._id.toString();
      await adminUser.save();
      this.logger.log(`Created default Admin (Shop Owner): ${adminEmail} / admin123 (Shop ID: ${adminUser.shopId})`);
    }

    const shopId = adminUser.shopId || adminUser._id.toString();

    // 3. Seed Manager User
    const managerEmail = 'manager@shop.com';
    const existingManager = await this.userModel.findOne({ email: managerEmail });
    if (!existingManager) {
      const passwordHash = await bcrypt.hash('admin123', 10);
      await this.userModel.create({
        name: 'John Manager',
        email: managerEmail,
        passwordHash,
        role: 'manager',
        subscriptionTier: 'free',
        shopId,
        permissions: {
          canProcessReturn: false,
          canExportExcel: true,
          canEditCustomers: false,
          canViewBuyPrice: false,
        },
      });
      this.logger.log(`Created default Manager: ${managerEmail} / admin123 (Linked to Shop ID: ${shopId})`);
    }

    // 4. Seed Categories
    const categoriesCount = await this.categoryModel.countDocuments({ shopId });
    if (categoriesCount === 0) {
      await this.categoryModel.insertMany([
        { name: 'Electronics', description: 'Computer accessories and gadgets', shopId, isDeleted: false },
        { name: 'Stationery', description: 'Office supplies, paper, pens', shopId, isDeleted: false },
        { name: 'Groceries', description: 'Daily essential consumer goods', shopId, isDeleted: false },
      ]);
      this.logger.log('Seeded initial Categories');
    }

    // 5. Seed Items
    const itemsCount = await this.itemModel.countDocuments({ shopId });
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
          shopId,
          isDeleted: false,
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
          shopId,
          isDeleted: false,
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
          shopId,
          isDeleted: false,
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
          shopId,
          isDeleted: false,
        },
      ]);
      this.logger.log('Seeded initial Product Catalog items');
    }

    // 6. Seed Customers
    const customerCount = await this.customerModel.countDocuments({ shopId });
    if (customerCount === 0) {
      const cust = await this.customerModel.create({
        name: 'Rahim Traders',
        phone: '01711000000',
        address: 'Motijheel, Dhaka',
        openingBalance: 0,
        closingBalance: 0,
        shopId,
        isDeleted: false,
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
        shopId,
        isDeleted: false,
      });
      this.logger.log('Seeded initial Customer record');
    }

    this.logger.log('Database Seeding Completed Successfully!');
  }
}
