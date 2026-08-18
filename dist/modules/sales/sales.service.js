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
exports.SalesService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const sale_schema_1 = require("./schemas/sale.schema");
const item_schema_1 = require("../inventory/schemas/item.schema");
const customer_schema_1 = require("../customers/schemas/customer.schema");
const ledger_schema_1 = require("../customers/schemas/ledger.schema");
let SalesService = class SalesService {
    constructor(saleModel, itemModel, customerModel, ledgerModel) {
        this.saleModel = saleModel;
        this.itemModel = itemModel;
        this.customerModel = customerModel;
        this.ledgerModel = ledgerModel;
    }
    async createSale(createSaleDto, user) {
        if (!createSaleDto.items || createSaleDto.items.length === 0) {
            throw new common_1.BadRequestException('Sale must contain at least one item');
        }
        if (user.subscriptionTier === 'free') {
            const saleCount = await this.saleModel.countDocuments({
                shopId: user.shopId,
                isDeleted: { $ne: true },
            });
            if (saleCount >= 5) {
                throw new common_1.BadRequestException('Free tier is limited to 5 sales transactions only. Please upgrade to premium.');
            }
        }
        let subtotal = 0;
        const saleItems = [];
        for (const reqItem of createSaleDto.items) {
            const item = await this.itemModel.findOne({
                _id: reqItem.itemId,
                shopId: user.shopId,
                isDeleted: { $ne: true },
            });
            if (!item) {
                throw new common_1.NotFoundException(`Item with ID '${reqItem.itemId}' not found in your inventory`);
            }
            if (item.stockQuantity < reqItem.quantity) {
                throw new common_1.BadRequestException(`Insufficient stock for '${item.name}'. Available: ${item.stockQuantity}, Requested: ${reqItem.quantity}`);
            }
            const discountVal = reqItem.discount || 0;
            const discountType = reqItem.discountType || 'amount';
            const unitPrice = reqItem.unitPrice;
            let itemTotal = 0;
            if (discountType === 'percent') {
                const factor = (100 - discountVal) / 100;
                itemTotal = unitPrice * reqItem.quantity * factor;
            }
            else {
                itemTotal = (unitPrice * reqItem.quantity) - discountVal;
            }
            itemTotal = Math.max(0, itemTotal);
            subtotal += itemTotal;
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
        }
        else if (paidAmount > 0) {
            paymentStatus = 'partial';
        }
        const count = await this.saleModel.countDocuments({ shopId: user.shopId });
        const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        const invoiceNumber = `INV-${dateStr}-${(count + 1).toString().padStart(4, '0')}`;
        const customerId = createSaleDto.customerId || 'walk-in';
        let customerName = createSaleDto.customerName || 'Walk-in Customer';
        let customerPhone = createSaleDto.customerPhone || '';
        let customer = null;
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
    async findAllSales(user, query = {}) {
        const page = Math.max(1, Number(query.page) || 1);
        const limit = Math.max(1, Math.min(100, Number(query.limit) || 10));
        const skip = (page - 1) * limit;
        const filter = { shopId: user.shopId, isDeleted: { $ne: true } };
        if (query.cashierId)
            filter.createdBy = query.cashierId;
        if (query.paymentStatus)
            filter.paymentStatus = query.paymentStatus;
        if (query.startDate || query.endDate) {
            filter.date = {};
            if (query.startDate)
                filter.date.$gte = new Date(query.startDate);
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
    async findOneSale(id, user) {
        const sale = await this.saleModel.findOne({ _id: id, shopId: user.shopId, isDeleted: { $ne: true } });
        if (!sale)
            throw new common_1.NotFoundException('Sale record not found');
        return this.formatSale(sale);
    }
    async findByInvoice(invoiceNumber, user) {
        const sale = await this.saleModel.findOne({ invoiceNumber, shopId: user.shopId, isDeleted: { $ne: true } });
        if (!sale)
            throw new common_1.NotFoundException('Invoice not found');
        return this.formatSale(sale);
    }
    formatSale(sale) {
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
};
exports.SalesService = SalesService;
exports.SalesService = SalesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(sale_schema_1.Sale.name)),
    __param(1, (0, mongoose_1.InjectModel)(item_schema_1.Item.name)),
    __param(2, (0, mongoose_1.InjectModel)(customer_schema_1.Customer.name)),
    __param(3, (0, mongoose_1.InjectModel)(ledger_schema_1.Ledger.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model])
], SalesService);
//# sourceMappingURL=sales.service.js.map