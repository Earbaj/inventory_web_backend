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
exports.InventoryController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const inventory_service_1 = require("./inventory.service");
const inventory_dto_1 = require("./dto/inventory.dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const get_user_decorator_1 = require("../../common/decorators/get-user.decorator");
let InventoryController = class InventoryController {
    constructor(inventoryService) {
        this.inventoryService = inventoryService;
    }
    createItem(createItemDto, user) {
        return this.inventoryService.createItem(createItemDto, user);
    }
    findAllItems(user, category) {
        return this.inventoryService.findAllItems(user, category);
    }
    findLowStockItems(user) {
        return this.inventoryService.findLowStockItems(user);
    }
    findOneItem(id, user) {
        return this.inventoryService.findOneItem(id, user);
    }
    updateItem(id, updateItemDto, user) {
        return this.inventoryService.updateItem(id, updateItemDto, user);
    }
    updateStock(id, updateStockDto, user) {
        return this.inventoryService.updateStock(id, updateStockDto, user);
    }
    removeItem(id) {
        return this.inventoryService.removeItem(id);
    }
    findAllCategories() {
        return this.inventoryService.findAllCategories();
    }
    createCategory(createCategoryDto) {
        return this.inventoryService.createCategory(createCategoryDto);
    }
};
exports.InventoryController = InventoryController;
__decorate([
    (0, common_1.Post)('items'),
    (0, swagger_1.ApiOperation)({ summary: 'Create new product item' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, get_user_decorator_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [inventory_dto_1.CreateItemDto, Object]),
    __metadata("design:returntype", void 0)
], InventoryController.prototype, "createItem", null);
__decorate([
    (0, common_1.Get)('items'),
    (0, swagger_1.ApiOperation)({ summary: 'List all inventory product items' }),
    (0, swagger_1.ApiQuery)({ name: 'category', required: false }),
    __param(0, (0, get_user_decorator_1.GetUser)()),
    __param(1, (0, common_1.Query)('category')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], InventoryController.prototype, "findAllItems", null);
__decorate([
    (0, common_1.Get)('items/low-stock'),
    (0, swagger_1.ApiOperation)({ summary: 'Get items with low stock warning (stockQuantity <= lowStockThreshold)' }),
    __param(0, (0, get_user_decorator_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], InventoryController.prototype, "findLowStockItems", null);
__decorate([
    (0, common_1.Get)('items/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get product item by ID' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, get_user_decorator_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], InventoryController.prototype, "findOneItem", null);
__decorate([
    (0, common_1.Put)('items/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update item details' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, get_user_decorator_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, inventory_dto_1.UpdateItemDto, Object]),
    __metadata("design:returntype", void 0)
], InventoryController.prototype, "updateItem", null);
__decorate([
    (0, common_1.Patch)('items/:id/stock'),
    (0, swagger_1.ApiOperation)({ summary: 'Adjust item stock quantity (+/-)' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, get_user_decorator_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, inventory_dto_1.UpdateStockDto, Object]),
    __metadata("design:returntype", void 0)
], InventoryController.prototype, "updateStock", null);
__decorate([
    (0, common_1.Delete)('items/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete product item' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], InventoryController.prototype, "removeItem", null);
__decorate([
    (0, common_1.Get)('categories'),
    (0, swagger_1.ApiOperation)({ summary: 'List all product categories' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], InventoryController.prototype, "findAllCategories", null);
__decorate([
    (0, common_1.Post)('categories'),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new category' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [inventory_dto_1.CreateCategoryDto]),
    __metadata("design:returntype", void 0)
], InventoryController.prototype, "createCategory", null);
exports.InventoryController = InventoryController = __decorate([
    (0, swagger_1.ApiTags)('Inventory & Products'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('api'),
    __metadata("design:paramtypes", [inventory_service_1.InventoryService])
], InventoryController);
//# sourceMappingURL=inventory.controller.js.map