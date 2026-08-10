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
exports.ChangePasswordDto = exports.UpdatePermissionsDto = exports.CreateUserDto = exports.RegisterDto = exports.PermissionsDto = exports.LoginDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
class LoginDto {
}
exports.LoginDto = LoginDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'admin@shop.com', description: 'User login email' }),
    (0, class_validator_1.IsEmail)({}, { message: 'Invalid email address' }),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], LoginDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'admin123', description: 'User account password' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MinLength)(6, { message: 'Password must be at least 6 characters' }),
    __metadata("design:type", String)
], LoginDto.prototype, "password", void 0);
class PermissionsDto {
}
exports.PermissionsDto = PermissionsDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: false }),
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], PermissionsDto.prototype, "canProcessReturn", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: true }),
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], PermissionsDto.prototype, "canExportExcel", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: false }),
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], PermissionsDto.prototype, "canEditCustomers", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: false }),
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], PermissionsDto.prototype, "canViewBuyPrice", void 0);
class RegisterDto {
}
exports.RegisterDto = RegisterDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Shop Owner' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], RegisterDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'admin@shop.com' }),
    (0, class_validator_1.IsEmail)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], RegisterDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'admin123' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(6),
    __metadata("design:type", String)
], RegisterDto.prototype, "password", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'admin', enum: ['admin', 'manager'] }),
    (0, class_validator_1.IsEnum)(['admin', 'manager']),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], RegisterDto.prototype, "role", void 0);
class CreateUserDto {
}
exports.CreateUserDto = CreateUserDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'John Manager' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateUserDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'manager@shop.com' }),
    (0, class_validator_1.IsEmail)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateUserDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'admin123' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(6),
    __metadata("design:type", String)
], CreateUserDto.prototype, "password", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'manager', enum: ['admin', 'manager'] }),
    (0, class_validator_1.IsEnum)(['admin', 'manager']),
    __metadata("design:type", String)
], CreateUserDto.prototype, "role", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: PermissionsDto }),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => PermissionsDto),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", PermissionsDto)
], CreateUserDto.prototype, "permissions", void 0);
class UpdatePermissionsDto {
}
exports.UpdatePermissionsDto = UpdatePermissionsDto;
__decorate([
    (0, swagger_1.ApiProperty)({ type: PermissionsDto }),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => PermissionsDto),
    __metadata("design:type", PermissionsDto)
], UpdatePermissionsDto.prototype, "permissions", void 0);
class ChangePasswordDto {
}
exports.ChangePasswordDto = ChangePasswordDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'newsecret123' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(6),
    __metadata("design:type", String)
], ChangePasswordDto.prototype, "newPassword", void 0);
//# sourceMappingURL=auth.dto.js.map