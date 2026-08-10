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
    async create(createCustomerDto) {
        const openingBalance = createCustomerDto.openingBalance || 0;
        const customer = new this.customerModel({
            name: createCustomerDto.name,
            phone: createCustomerDto.phone || '',
            address: createCustomerDto.address || '',
            openingBalance,
            closingBalance: openingBalance,
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
        });
        await ledger.save();
        return this.formatCustomer(saved);
    }
    async findAll() {
        const customers = await this.customerModel.find().exec();
        return customers.map(c => this.formatCustomer(c));
    }
    async findOne(id) {
        const customer = await this.customerModel.findById(id);
        if (!customer)
            throw new common_1.NotFoundException('Customer not found');
        return this.formatCustomer(customer);
    }
    async update(id, updateCustomerDto) {
        const customer = await this.customerModel.findById(id);
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
    async remove(id) {
        const customer = await this.customerModel.findByIdAndDelete(id);
        if (!customer)
            throw new common_1.NotFoundException('Customer not found');
        await this.ledgerModel.deleteMany({ customerId: id });
        return { message: 'Customer and ledger records deleted successfully' };
    }
    async getLedger(customerId) {
        const customer = await this.customerModel.findById(customerId);
        if (!customer)
            throw new common_1.NotFoundException('Customer not found');
        const records = await this.ledgerModel.find({ customerId }).sort({ date: 1 }).exec();
        return records.map(r => ({
            id: r._id.toString(),
            type: r.type,
            referenceId: r.referenceId,
            date: r.date,
            description: r.description,
            amount: r.amount.toString(),
            previousBalance: r.previousBalance.toString(),
            newBalance: r.newBalance.toString(),
        }));
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