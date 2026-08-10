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
exports.PaymentsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const payment_schema_1 = require("./schemas/payment.schema");
const customer_schema_1 = require("../customers/schemas/customer.schema");
const ledger_schema_1 = require("../customers/schemas/ledger.schema");
let PaymentsService = class PaymentsService {
    constructor(paymentModel, customerModel, ledgerModel) {
        this.paymentModel = paymentModel;
        this.customerModel = customerModel;
        this.ledgerModel = ledgerModel;
    }
    async processPayment(processPaymentDto, user) {
        const customer = await this.customerModel.findById(processPaymentDto.customerId);
        if (!customer) {
            throw new common_1.NotFoundException('Customer not found');
        }
        const amount = processPaymentDto.amount;
        const previousBalance = customer.closingBalance;
        const newBalance = previousBalance + amount;
        customer.closingBalance = newBalance;
        await customer.save();
        const payment = new this.paymentModel({
            customerId: customer._id.toString(),
            amount,
            paymentMethod: processPaymentDto.paymentMethod.toLowerCase(),
            date: new Date(),
            receivedBy: user.uid || user.id,
        });
        const savedPayment = await payment.save();
        const ledgerRecord = new this.ledgerModel({
            customerId: customer._id.toString(),
            type: 'payment',
            referenceId: savedPayment._id.toString(),
            date: new Date(),
            description: `Payment received via ${processPaymentDto.paymentMethod.toUpperCase()}`,
            amount,
            previousBalance,
            newBalance,
        });
        await ledgerRecord.save();
        return {
            id: savedPayment._id.toString(),
            customerId: customer._id.toString(),
            customerName: customer.name,
            amount: amount.toString(),
            paymentMethod: processPaymentDto.paymentMethod,
            date: savedPayment.date,
            receivedBy: savedPayment.receivedBy,
            previousBalance: previousBalance.toString(),
            newBalance: newBalance.toString(),
        };
    }
};
exports.PaymentsService = PaymentsService;
exports.PaymentsService = PaymentsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(payment_schema_1.Payment.name)),
    __param(1, (0, mongoose_1.InjectModel)(customer_schema_1.Customer.name)),
    __param(2, (0, mongoose_1.InjectModel)(ledger_schema_1.Ledger.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model])
], PaymentsService);
//# sourceMappingURL=payments.service.js.map