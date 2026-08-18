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
exports.QuerySalesDto = exports.CreateSaleDto = exports.SaleItemDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const pagination_dto_1 = require("../../../common/dto/pagination.dto");
class SaleItemDto {
}
exports.SaleItemDto = SaleItemDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: '65c1a2b3c4d5e6f7a8b9c0d1', description: 'পণ্যের ইউনিক আইডি' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], SaleItemDto.prototype, "itemId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 2, description: 'ক্রয়কৃত পণ্যের পিস/সংখ্যা' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], SaleItemDto.prototype, "quantity", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 450.00, description: 'প্রতি পিসের একক বিক্রয় মূল্য' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], SaleItemDto.prototype, "unitPrice", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 0, description: 'পণ্যের কাস্টম ডিসকাউন্ট' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], SaleItemDto.prototype, "discount", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'amount', enum: ['amount', 'percent'], description: 'ডিসকাউন্টের ধরণ (টাকা নাকি শতাংশ)' }),
    (0, class_validator_1.IsEnum)(['amount', 'percent']),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], SaleItemDto.prototype, "discountType", void 0);
class CreateSaleDto {
}
exports.CreateSaleDto = CreateSaleDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'walk-in', description: 'কাস্টমার আইডি (সাধারণ ক্রেতার জন্য walk-in)' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateSaleDto.prototype, "customerId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Walk-in Customer', description: 'কাস্টমারের নাম' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateSaleDto.prototype, "customerName", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '', description: 'কাস্টমারের ফোন নম্বর' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateSaleDto.prototype, "customerPhone", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: [SaleItemDto], description: 'বিক্রয়কৃত পণ্যসমূহের তালিকা' }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => SaleItemDto),
    __metadata("design:type", Array)
], CreateSaleDto.prototype, "items", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 0, description: 'ইনভয়েসের উপর সামগ্রিক ডিসকাউন্ট' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateSaleDto.prototype, "discount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 900.00, description: 'কাস্টমার কর্তৃক নগদ জমা টাকার পরিমাণ' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateSaleDto.prototype, "paidAmount", void 0);
class QuerySalesDto extends pagination_dto_1.PaginationQueryDto {
}
exports.QuerySalesDto = QuerySalesDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '65c1a2b3c4d5e6f7a8b9c0d1', description: 'ক্যাশিয়ার ইউজারের আইডি ফিল্টার' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], QuerySalesDto.prototype, "cashierId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'paid', enum: ['paid', 'due', 'partial'], description: 'পেমেন্ট স্ট্যাটাস ফিল্টার' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], QuerySalesDto.prototype, "paymentStatus", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '2026-01-01', description: 'শুরুর তারিখ (YYYY-MM-DD)' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], QuerySalesDto.prototype, "startDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '2026-12-31', description: 'শেষের তারিখ (YYYY-MM-DD)' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], QuerySalesDto.prototype, "endDate", void 0);
//# sourceMappingURL=sales.dto.js.map