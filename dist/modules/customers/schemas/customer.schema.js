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
exports.CustomerSchema = exports.Customer = void 0;
const mongoose_1 = require("@nestjs/mongoose");
let Customer = class Customer {
};
exports.Customer = Customer;
__decorate([
    (0, mongoose_1.Prop)({ required: true, trim: true }),
    __metadata("design:type", String)
], Customer.prototype, "name", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: '', trim: true }),
    __metadata("design:type", String)
], Customer.prototype, "phone", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: '', trim: true }),
    __metadata("design:type", String)
], Customer.prototype, "address", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, default: 0 }),
    __metadata("design:type", Number)
], Customer.prototype, "openingBalance", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, default: 0 }),
    __metadata("design:type", Number)
], Customer.prototype, "closingBalance", void 0);
exports.Customer = Customer = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } })
], Customer);
exports.CustomerSchema = mongoose_1.SchemaFactory.createForClass(Customer);
exports.CustomerSchema.virtual('id').get(function () {
    return this._id.toHexString();
});
//# sourceMappingURL=customer.schema.js.map