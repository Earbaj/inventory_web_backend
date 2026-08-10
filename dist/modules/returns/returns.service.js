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
exports.ReturnsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const return_schema_1 = require("./schemas/return.schema");
const sale_schema_1 = require("../sales/schemas/sale.schema");
const item_schema_1 = require("../inventory/schemas/item.schema");
const customer_schema_1 = require("../customers/schemas/customer.schema");
const ledger_schema_1 = require("../customers/schemas/ledger.schema");
let ReturnsService = class ReturnsService {
    constructor(returnModel, saleModel, itemModel, customerModel, ledgerModel) {
        this.returnModel = returnModel;
        this.saleModel = saleModel;
        this.itemModel = itemModel;
        this.customerModel = customerModel;
        this.ledgerModel = ledgerModel;
    }
    async processReturn(processReturnDto, user) {
        const sale = await this.saleModel.findById(processReturnDto.saleId);
        if (!sale) {
            throw new common_1.NotFoundException('Original sale invoice record not found');
        }
        let totalRefund = 0;
        const returnedDetails = [];
        const updatedSaleItems = [];
        for (const saleItem of sale.items) {
            const returnInfo = processReturnDto.returnedItems.find(r => r.itemId === saleItem.itemId);
            if (returnInfo) {
                if (returnInfo.quantity > saleItem.quantity) {
                    throw new common_1.BadRequestException(`Cannot return more than purchased quantity (${saleItem.quantity}) for '${saleItem.name}'`);
                }
                let finalUnitPrice = saleItem.unitPrice;
                if (saleItem.discountType === 'percent') {
                    const factor = (100 - saleItem.discount) / 100;
                    finalUnitPrice = saleItem.unitPrice * factor;
                }
                else {
                    const discountPerUnit = saleItem.discount / saleItem.quantity;
                    finalUnitPrice = saleItem.unitPrice - discountPerUnit;
                }
                const itemRefund = finalUnitPrice * returnInfo.quantity;
                totalRefund += itemRefund;
                const item = await this.itemModel.findById(saleItem.itemId);
                if (item) {
                    item.stockQuantity += returnInfo.quantity;
                    await item.save();
                }
                returnedDetails.push({
                    itemId: saleItem.itemId,
                    name: saleItem.name,
                    quantity: returnInfo.quantity,
                    refundAmountPerUnit: finalUnitPrice,
                });
                const newQty = saleItem.quantity - returnInfo.quantity;
                if (newQty > 0) {
                    const newTotal = saleItem.totalPrice - itemRefund;
                    updatedSaleItems.push({
                        itemId: saleItem.itemId,
                        name: saleItem.name,
                        quantity: newQty,
                        unitPrice: saleItem.unitPrice,
                        discount: saleItem.discount,
                        discountType: saleItem.discountType,
                        totalPrice: Math.max(0, newTotal),
                    });
                }
            }
            else {
                updatedSaleItems.push(saleItem);
            }
        }
        let newSubtotal = 0;
        for (const item of updatedSaleItems) {
            newSubtotal += item.totalPrice;
        }
        const newGrandTotal = Math.max(0, newSubtotal - sale.discount);
        const newDue = Math.max(0, newGrandTotal - sale.paidAmount);
        const paymentStatus = newDue === 0 ? 'paid' : (sale.paidAmount > 0 ? 'partial' : 'due');
        const isReturnedStatus = updatedSaleItems.length === 0 ? 'fully_returned' : 'partially_returned';
        sale.items = updatedSaleItems;
        sale.subtotal = newSubtotal;
        sale.grandTotal = newGrandTotal;
        sale.dueAmount = newDue;
        sale.paymentStatus = paymentStatus;
        sale.isReturned = isReturnedStatus;
        await sale.save();
        const returnRecord = new this.returnModel({
            customerId: processReturnDto.customerId || sale.customerId,
            saleId: sale._id.toString(),
            invoiceNumber: sale.invoiceNumber,
            returnedItems: returnedDetails,
            totalRefund,
            date: new Date(),
            processedBy: user.uid || user.id,
        });
        const savedReturn = await returnRecord.save();
        const customerId = processReturnDto.customerId || sale.customerId;
        if (customerId && customerId !== 'walk-in') {
            const customer = await this.customerModel.findById(customerId);
            if (customer) {
                const prevBalance = customer.closingBalance;
                const newBalance = prevBalance + totalRefund;
                customer.closingBalance = newBalance;
                await customer.save();
                const ledger = new this.ledgerModel({
                    customerId: customer._id.toString(),
                    type: 'return',
                    referenceId: savedReturn._id.toString(),
                    date: new Date(),
                    description: `Returned items from invoice #${sale.invoiceNumber}`,
                    amount: totalRefund,
                    previousBalance: prevBalance,
                    newBalance: newBalance,
                });
                await ledger.save();
            }
        }
        return {
            id: savedReturn._id.toString(),
            customerId,
            saleId: sale._id.toString(),
            invoiceNumber: sale.invoiceNumber,
            returnedItems: returnedDetails.map(r => ({
                ...r,
                refundAmountPerUnit: r.refundAmountPerUnit.toString(),
            })),
            totalRefund: totalRefund.toString(),
            date: savedReturn.date,
            processedBy: savedReturn.processedBy,
        };
    }
    async findAllReturns() {
        const returns = await this.returnModel.find().sort({ createdAt: -1 }).exec();
        return returns.map(r => ({
            id: r._id.toString(),
            customerId: r.customerId,
            saleId: r.saleId,
            invoiceNumber: r.invoiceNumber,
            returnedItems: r.returnedItems.map(item => ({
                itemId: item.itemId,
                name: item.name,
                quantity: item.quantity,
                refundAmountPerUnit: item.refundAmountPerUnit.toString(),
            })),
            totalRefund: r.totalRefund.toString(),
            date: r.date,
            processedBy: r.processedBy,
        }));
    }
};
exports.ReturnsService = ReturnsService;
exports.ReturnsService = ReturnsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(return_schema_1.Return.name)),
    __param(1, (0, mongoose_1.InjectModel)(sale_schema_1.Sale.name)),
    __param(2, (0, mongoose_1.InjectModel)(item_schema_1.Item.name)),
    __param(3, (0, mongoose_1.InjectModel)(customer_schema_1.Customer.name)),
    __param(4, (0, mongoose_1.InjectModel)(ledger_schema_1.Ledger.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model])
], ReturnsService);
//# sourceMappingURL=returns.service.js.map