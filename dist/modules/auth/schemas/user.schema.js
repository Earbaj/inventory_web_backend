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
exports.UserSchema = exports.User = exports.ManagerPermissionsSchema = exports.ManagerPermissions = void 0;
const mongoose_1 = require("@nestjs/mongoose");
let ManagerPermissions = class ManagerPermissions {
};
exports.ManagerPermissions = ManagerPermissions;
__decorate([
    (0, mongoose_1.Prop)({ default: false }),
    __metadata("design:type", Boolean)
], ManagerPermissions.prototype, "canProcessReturn", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: false }),
    __metadata("design:type", Boolean)
], ManagerPermissions.prototype, "canExportExcel", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: false }),
    __metadata("design:type", Boolean)
], ManagerPermissions.prototype, "canEditCustomers", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: false }),
    __metadata("design:type", Boolean)
], ManagerPermissions.prototype, "canViewBuyPrice", void 0);
exports.ManagerPermissions = ManagerPermissions = __decorate([
    (0, mongoose_1.Schema)({ _id: false })
], ManagerPermissions);
exports.ManagerPermissionsSchema = mongoose_1.SchemaFactory.createForClass(ManagerPermissions);
let User = class User {
};
exports.User = User;
__decorate([
    (0, mongoose_1.Prop)({ required: true, unique: true, lowercase: true, trim: true }),
    __metadata("design:type", String)
], User.prototype, "email", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], User.prototype, "passwordHash", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, trim: true }),
    __metadata("design:type", String)
], User.prototype, "name", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, enum: ['admin', 'manager'], default: 'manager' }),
    __metadata("design:type", String)
], User.prototype, "role", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: exports.ManagerPermissionsSchema, default: () => ({}) }),
    __metadata("design:type", ManagerPermissions)
], User.prototype, "permissions", void 0);
exports.User = User = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } })
], User);
exports.UserSchema = mongoose_1.SchemaFactory.createForClass(User);
exports.UserSchema.virtual('uid').get(function () {
    return this._id.toHexString();
});
//# sourceMappingURL=user.schema.js.map