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
exports.LedgerSchema = exports.Ledger = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
let Ledger = class Ledger {
};
exports.Ledger = Ledger;
__decorate([
    (0, mongoose_1.Prop)({ required: true, type: mongoose_2.Schema.Types.ObjectId, ref: 'Customer' }),
    __metadata("design:type", String)
], Ledger.prototype, "customerId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, enum: ['sale', 'payment', 'return', 'opening'] }),
    __metadata("design:type", String)
], Ledger.prototype, "type", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Ledger.prototype, "referenceId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, default: Date.now }),
    __metadata("design:type", Date)
], Ledger.prototype, "date", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Ledger.prototype, "description", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], Ledger.prototype, "amount", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], Ledger.prototype, "previousBalance", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], Ledger.prototype, "newBalance", void 0);
exports.Ledger = Ledger = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } })
], Ledger);
exports.LedgerSchema = mongoose_1.SchemaFactory.createForClass(Ledger);
exports.LedgerSchema.virtual('id').get(function () {
    return this._id.toHexString();
});
//# sourceMappingURL=ledger.schema.js.map