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
exports.ProcessReturnDto = exports.ReturnItemInputDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
class ReturnItemInputDto {
}
exports.ReturnItemInputDto = ReturnItemInputDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: '65c1a2b3c4d5e6f7a8b9c0d1', description: 'ফেরত দেওয়া পণ্যের আইডি' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], ReturnItemInputDto.prototype, "itemId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 1, description: 'ফেরত দেওয়া পিসের সংখ্যা' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], ReturnItemInputDto.prototype, "quantity", void 0);
class ProcessReturnDto {
}
exports.ProcessReturnDto = ProcessReturnDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'walk-in', description: 'কাস্টমার আইডি (ডিফল্ট: walk-in)' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], ProcessReturnDto.prototype, "customerId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '65c1a2b3c4d5e6f7a8b9c0d2', description: 'মূল সেলস ট্রানজেকশনের আইডি' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], ProcessReturnDto.prototype, "saleId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: [ReturnItemInputDto], description: 'ফেরত প্রদানকৃত পণ্যসমূহের তালিকা' }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => ReturnItemInputDto),
    __metadata("design:type", Array)
], ProcessReturnDto.prototype, "returnedItems", void 0);
//# sourceMappingURL=return.dto.js.map