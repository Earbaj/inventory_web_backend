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
exports.ReturnSchema = exports.Return = exports.ReturnedItemDetailSchema = exports.ReturnedItemDetail = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
let ReturnedItemDetail = class ReturnedItemDetail {
};
exports.ReturnedItemDetail = ReturnedItemDetail;
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], ReturnedItemDetail.prototype, "itemId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], ReturnedItemDetail.prototype, "name", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, default: 1 }),
    __metadata("design:type", Number)
], ReturnedItemDetail.prototype, "quantity", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, default: 0 }),
    __metadata("design:type", Number)
], ReturnedItemDetail.prototype, "refundAmountPerUnit", void 0);
exports.ReturnedItemDetail = ReturnedItemDetail = __decorate([
    (0, mongoose_1.Schema)({ _id: false })
], ReturnedItemDetail);
exports.ReturnedItemDetailSchema = mongoose_1.SchemaFactory.createForClass(ReturnedItemDetail);
let Return = class Return {
};
exports.Return = Return;
__decorate([
    (0, mongoose_1.Prop)({ required: true, default: 'walk-in' }),
    __metadata("design:type", String)
], Return.prototype, "customerId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, type: mongoose_2.Schema.Types.ObjectId, ref: 'Sale' }),
    __metadata("design:type", String)
], Return.prototype, "saleId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Return.prototype, "invoiceNumber", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [exports.ReturnedItemDetailSchema], default: [] }),
    __metadata("design:type", Array)
], Return.prototype, "returnedItems", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, default: 0 }),
    __metadata("design:type", Number)
], Return.prototype, "totalRefund", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, default: Date.now }),
    __metadata("design:type", Date)
], Return.prototype, "date", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Return.prototype, "processedBy", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, type: String, index: true }),
    __metadata("design:type", String)
], Return.prototype, "shopId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, type: Boolean, default: false, index: true }),
    __metadata("design:type", Boolean)
], Return.prototype, "isDeleted", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date, default: null }),
    __metadata("design:type", Date)
], Return.prototype, "deletedAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, default: null }),
    __metadata("design:type", String)
], Return.prototype, "deletedBy", void 0);
exports.Return = Return = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } })
], Return);
exports.ReturnSchema = mongoose_1.SchemaFactory.createForClass(Return);
exports.ReturnSchema.virtual('id').get(function () {
    return this._id.toHexString();
});
//# sourceMappingURL=return.schema.js.map