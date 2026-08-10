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
exports.CreateCategoryDto = exports.UpdateStockDto = exports.UpdateItemDto = exports.CreateItemDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class CreateItemDto {
}
exports.CreateItemDto = CreateItemDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Wireless Mouse' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateItemDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'SKU-1001' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateItemDto.prototype, "sku", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Electronics' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateItemDto.prototype, "category", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 450.00 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateItemDto.prototype, "sellPrice", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 320.00 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateItemDto.prototype, "buyPrice", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 50 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateItemDto.prototype, "stockQuantity", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'pcs' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateItemDto.prototype, "unit", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 5 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateItemDto.prototype, "lowStockThreshold", void 0);
class UpdateItemDto {
}
exports.UpdateItemDto = UpdateItemDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Wireless Mouse Ergonomic' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateItemDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'SKU-1001' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateItemDto.prototype, "sku", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Electronics' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateItemDto.prototype, "category", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 480.00 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], UpdateItemDto.prototype, "sellPrice", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 340.00 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], UpdateItemDto.prototype, "buyPrice", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 60 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], UpdateItemDto.prototype, "stockQuantity", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'pcs' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateItemDto.prototype, "unit", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 5 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], UpdateItemDto.prototype, "lowStockThreshold", void 0);
class UpdateStockDto {
}
exports.UpdateStockDto = UpdateStockDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 10, description: 'Quantity to add (positive) or deduct (negative)' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdateStockDto.prototype, "adjustment", void 0);
class CreateCategoryDto {
}
exports.CreateCategoryDto = CreateCategoryDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Electronics' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateCategoryDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Computer peripherals and gadgets' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateCategoryDto.prototype, "description", void 0);
//# sourceMappingURL=inventory.dto.js.map