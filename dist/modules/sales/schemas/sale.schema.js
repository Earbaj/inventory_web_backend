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
Object.defineProperty(exports, "__esModule", { value: true });
exports.SaleSchema = exports.Sale = exports.SaleItemEmbeddedSchema = exports.SaleItemEmbedded = void 0;
const mongoose_1 = require("@nestjs/mongoose");
let SaleItemEmbedded = class SaleItemEmbedded {
};
exports.SaleItemEmbedded = SaleItemEmbedded;
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], SaleItemEmbedded.prototype, "itemId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], SaleItemEmbedded.prototype, "name", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, default: 1 }),
    __metadata("design:type", Number)
], SaleItemEmbedded.prototype, "quantity", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, default: 0 }),
    __metadata("design:type", Number)
], SaleItemEmbedded.prototype, "unitPrice", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], SaleItemEmbedded.prototype, "discount", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 'amount', enum: ['amount', 'percent'] }),
    __metadata("design:type", String)
], SaleItemEmbedded.prototype, "discountType", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, default: 0 }),
    __metadata("design:type", Number)
], SaleItemEmbedded.prototype, "totalPrice", void 0);
exports.SaleItemEmbedded = SaleItemEmbedded = __decorate([
    (0, mongoose_1.Schema)({ _id: false })
], SaleItemEmbedded);
exports.SaleItemEmbeddedSchema = mongoose_1.SchemaFactory.createForClass(SaleItemEmbedded);
let Sale = class Sale {
};
exports.Sale = Sale;
__decorate([
    (0, mongoose_1.Prop)({ required: true, index: true }),
    __metadata("design:type", String)
], Sale.prototype, "invoiceNumber", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, default: 'walk-in' }),
    __metadata("design:type", String)
], Sale.prototype, "customerId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, default: 'Walk-in Customer' }),
    __metadata("design:type", String)
], Sale.prototype, "customerName", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: '' }),
    __metadata("design:type", String)
], Sale.prototype, "customerPhone", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [exports.SaleItemEmbeddedSchema], default: [] }),
    __metadata("design:type", Array)
], Sale.prototype, "items", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, default: 0 }),
    __metadata("design:type", Number)
], Sale.prototype, "subtotal", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], Sale.prototype, "discount", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, default: 0 }),
    __metadata("design:type", Number)
], Sale.prototype, "grandTotal", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, default: 0 }),
    __metadata("design:type", Number)
], Sale.prototype, "paidAmount", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, default: 0 }),
    __metadata("design:type", Number)
], Sale.prototype, "dueAmount", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, enum: ['paid', 'partial', 'due'], default: 'due' }),
    __metadata("design:type", String)
], Sale.prototype, "paymentStatus", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, default: Date.now }),
    __metadata("design:type", Date)
], Sale.prototype, "date", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Sale.prototype, "createdBy", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: '' }),
    __metadata("design:type", String)
], Sale.prototype, "createdByName", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, enum: ['none', 'partially_returned', 'fully_returned'], default: 'none' }),
    __metadata("design:type", String)
], Sale.prototype, "isReturned", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, type: String, index: true }),
    __metadata("design:type", String)
], Sale.prototype, "shopId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, type: Boolean, default: false, index: true }),
    __metadata("design:type", Boolean)
], Sale.prototype, "isDeleted", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date, default: null }),
    __metadata("design:type", Date)
], Sale.prototype, "deletedAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, default: null }),
    __metadata("design:type", String)
], Sale.prototype, "deletedBy", void 0);
exports.Sale = Sale = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } })
], Sale);
exports.SaleSchema = mongoose_1.SchemaFactory.createForClass(Sale);
exports.SaleSchema.virtual('id').get(function () {
    return this._id.toHexString();
});
//# sourceMappingURL=sale.schema.js.map