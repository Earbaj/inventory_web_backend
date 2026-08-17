"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var SeedService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SeedService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const bcrypt = require("bcrypt");
const user_schema_1 = require("../auth/schemas/user.schema");
const category_schema_1 = require("../inventory/schemas/category.schema");
const item_schema_1 = require("../inventory/schemas/item.schema");
const customer_schema_1 = require("../customers/schemas/customer.schema");
const ledger_schema_1 = require("../customers/schemas/ledger.schema");
let SeedService = SeedService_1 = class SeedService {
    constructor(userModel, categoryModel, itemModel, customerModel, ledgerModel) {
        this.userModel = userModel;
        this.categoryModel = categoryModel;
        this.itemModel = itemModel;
        this.customerModel = customerModel;
        this.ledgerModel = ledgerModel;
        this.logger = new common_1.Logger(SeedService_1.name);
    }
    async seed() {
        this.logger.log('Starting MongoDB Database Seeding...');
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
        const categoriesCount = await this.categoryModel.countDocuments({ shopId });
        if (categoriesCount === 0) {
            await this.categoryModel.insertMany([
                { name: 'Electronics', description: 'Computer accessories and gadgets', shopId, isDeleted: false },
                { name: 'Stationery', description: 'Office supplies, paper, pens', shopId, isDeleted: false },
                { name: 'Groceries', description: 'Daily essential consumer goods', shopId, isDeleted: false },
            ]);
            this.logger.log('Seeded initial Categories');
        }
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
                    stockQuantity: 3,
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
};
exports.SeedService = SeedService;
exports.SeedService = SeedService = SeedService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(user_schema_1.User.name)),
    __param(1, (0, mongoose_1.InjectModel)(category_schema_1.Category.name)),
    __param(2, (0, mongoose_1.InjectModel)(item_schema_1.Item.name)),
    __param(3, (0, mongoose_1.InjectModel)(customer_schema_1.Customer.name)),
    __param(4, (0, mongoose_1.InjectModel)(ledger_schema_1.Ledger.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model])
], SeedService);
//# sourceMappingURL=seed.service.js.map