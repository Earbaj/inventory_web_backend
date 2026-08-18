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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomersService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const customer_schema_1 = require("./schemas/customer.schema");
const ledger_schema_1 = require("./schemas/ledger.schema");
let CustomersService = class CustomersService {
    constructor(customerModel, ledgerModel) {
        this.customerModel = customerModel;
        this.ledgerModel = ledgerModel;
    }
    async create(createCustomerDto, user) {
        if (user.subscriptionTier === 'free') {
            const activeCustomerCount = await this.customerModel.countDocuments({
                shopId: user.shopId,
                isDeleted: { $ne: true },
            });
            if (activeCustomerCount >= 1) {
                throw new common_1.BadRequestException('Free tier is limited to 1 customer only. Please upgrade to premium.');
            }
        }
        const openingBalance = createCustomerDto.openingBalance || 0;
        const customer = new this.customerModel({
            name: createCustomerDto.name,
            phone: createCustomerDto.phone || '',
            address: createCustomerDto.address || '',
            openingBalance,
            closingBalance: openingBalance,
            shopId: user.shopId,
            isDeleted: false,
        });
        const saved = await customer.save();
        const ledger = new this.ledgerModel({
            customerId: saved._id,
            type: 'opening',
            referenceId: saved._id.toString(),
            date: new Date(),
            description: 'Opening Balance',
            amount: openingBalance,
            previousBalance: 0,
            newBalance: openingBalance,
            shopId: user.shopId,
            isDeleted: false,
        });
        await ledger.save();
        return this.formatCustomer(saved);
    }
    async findAll(user, query = {}) {
        const page = Math.max(1, Number(query.page) || 1);
        const limit = Math.max(1, Math.min(100, Number(query.limit) || 10));
        const skip = (page - 1) * limit;
        const filter = { shopId: user.shopId, isDeleted: { $ne: true } };
        if (query.search) {
            filter.$or = [
                { name: { $regex: query.search, $options: 'i' } },
                { phone: { $regex: query.search, $options: 'i' } },
                { address: { $regex: query.search, $options: 'i' } },
            ];
        }
        const sortField = query.sortBy || 'createdAt';
        const sortDirection = query.sortOrder === 'asc' ? 1 : -1;
        const total = await this.customerModel.countDocuments(filter);
        const customers = await this.customerModel
            .find(filter)
            .sort({ [sortField]: sortDirection })
            .skip(skip)
            .limit(limit)
            .exec();
        const totalPages = Math.ceil(total / limit) || 1;
        return {
            data: customers.map(c => this.formatCustomer(c)),
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
    async findOne(id, user) {
        const customer = await this.customerModel.findOne({
            _id: id,
            shopId: user.shopId,
            isDeleted: { $ne: true },
        });
        if (!customer)
            throw new common_1.NotFoundException('Customer not found');
        return this.formatCustomer(customer);
    }
    async update(id, updateCustomerDto, user) {
        const customer = await this.customerModel.findOne({
            _id: id,
            shopId: user.shopId,
            isDeleted: { $ne: true },
        });
        if (!customer)
            throw new common_1.NotFoundException('Customer not found');
        if (updateCustomerDto.name !== undefined)
            customer.name = updateCustomerDto.name;
        if (updateCustomerDto.phone !== undefined)
            customer.phone = updateCustomerDto.phone;
        if (updateCustomerDto.address !== undefined)
            customer.address = updateCustomerDto.address;
        await customer.save();
        return this.formatCustomer(customer);
    }
    async remove(id, user) {
        const customer = await this.customerModel.findOne({
            _id: id,
            shopId: user.shopId,
            isDeleted: { $ne: true },
        });
        if (!customer)
            throw new common_1.NotFoundException('Customer not found');
        customer.isDeleted = true;
        customer.deletedAt = new Date();
        customer.deletedBy = user.uid || user.id;
        await customer.save();
        await this.ledgerModel.updateMany({ customerId: id, shopId: user.shopId }, { isDeleted: true, deletedAt: new Date(), deletedBy: user.uid || user.id });
        return { message: 'Customer moved to trash (Soft deleted). Can be restored from Recycle Bin.' };
    }
    async getLedger(customerId, user, query = {}) {
        const customer = await this.customerModel.findOne({
            _id: customerId,
            shopId: user.shopId,
            isDeleted: { $ne: true },
        });
        if (!customer)
            throw new common_1.NotFoundException('Customer not found');
        const page = Math.max(1, Number(query.page) || 1);
        const limit = Math.max(1, Math.min(100, Number(query.limit) || 10));
        const skip = (page - 1) * limit;
        const filter = { customerId, shopId: user.shopId, isDeleted: { $ne: true } };
        const sortField = query.sortBy || 'date';
        const sortDirection = query.sortOrder === 'desc' ? -1 : 1;
        const total = await this.ledgerModel.countDocuments(filter);
        const records = await this.ledgerModel
            .find(filter)
            .sort({ [sortField]: sortDirection })
            .skip(skip)
            .limit(limit)
            .exec();
        const totalPages = Math.ceil(total / limit) || 1;
        return {
            data: records.map(r => ({
                id: r._id.toString(),
                type: r.type,
                referenceId: r.referenceId,
                date: r.date,
                description: r.description,
                amount: r.amount.toString(),
                previousBalance: r.previousBalance.toString(),
                newBalance: r.newBalance.toString(),
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
    formatCustomer(customer) {
        return {
            id: customer._id.toString(),
            name: customer.name,
            phone: customer.phone,
            address: customer.address,
            openingBalance: customer.openingBalance.toString(),
            closingBalance: customer.closingBalance.toString(),
        };
    }
};
exports.CustomersService = CustomersService;
exports.CustomersService = CustomersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(customer_schema_1.Customer.name)),
    __param(1, (0, mongoose_1.InjectModel)(ledger_schema_1.Ledger.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model])
], CustomersService);
//# sourceMappingURL=customers.service.js.map