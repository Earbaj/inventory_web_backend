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
exports.InventoryService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const item_schema_1 = require("./schemas/item.schema");
const category_schema_1 = require("./schemas/category.schema");
let InventoryService = class InventoryService {
    constructor(itemModel, categoryModel) {
        this.itemModel = itemModel;
        this.categoryModel = categoryModel;
    }
    async createItem(createItemDto, user) {
        if (user.subscriptionTier === 'free') {
            const itemCount = await this.itemModel.countDocuments({
                shopId: user.shopId,
                isDeleted: { $ne: true },
            });
            if (itemCount >= 5) {
                throw new common_1.BadRequestException('Free tier is limited to 5 inventory items only. Please upgrade to premium.');
            }
        }
        const item = new this.itemModel({
            name: createItemDto.name,
            sku: createItemDto.sku || '',
            category: createItemDto.category || 'General',
            sellPrice: createItemDto.sellPrice,
            buyPrice: createItemDto.buyPrice,
            stockQuantity: createItemDto.stockQuantity,
            unit: createItemDto.unit || 'pcs',
            lowStockThreshold: createItemDto.lowStockThreshold ?? 5,
            shopId: user.shopId,
            isDeleted: false,
        });
        const saved = await item.save();
        return this.formatItem(saved, user);
    }
    async findAllItems(user, query = {}) {
        const page = Math.max(1, Number(query.page) || 1);
        const limit = Math.max(1, Math.min(100, Number(query.limit) || 10));
        const skip = (page - 1) * limit;
        const filter = { shopId: user.shopId, isDeleted: { $ne: true } };
        if (query.category)
            filter.category = query.category;
        if (query.search) {
            filter.$or = [
                { name: { $regex: query.search, $options: 'i' } },
                { sku: { $regex: query.search, $options: 'i' } },
            ];
        }
        const sortField = query.sortBy || 'createdAt';
        const sortDirection = query.sortOrder === 'asc' ? 1 : -1;
        const total = await this.itemModel.countDocuments(filter);
        const items = await this.itemModel
            .find(filter)
            .sort({ [sortField]: sortDirection })
            .skip(skip)
            .limit(limit)
            .exec();
        const totalPages = Math.ceil(total / limit) || 1;
        return {
            data: items.map(item => this.formatItem(item, user)),
            meta: {
                total,
                page,
                limit,
                totalPages,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1,
            },
        };
    }
    async findLowStockItems(user, query = {}) {
        const page = Math.max(1, Number(query.page) || 1);
        const limit = Math.max(1, Math.min(100, Number(query.limit) || 10));
        const skip = (page - 1) * limit;
        const filter = {
            shopId: user.shopId,
            isDeleted: { $ne: true },
            $expr: { $lte: ['$stockQuantity', '$lowStockThreshold'] },
        };
        if (query.search) {
            filter.$or = [
                { name: { $regex: query.search, $options: 'i' } },
                { sku: { $regex: query.search, $options: 'i' } },
            ];
        }
        const sortField = query.sortBy || 'stockQuantity';
        const sortDirection = query.sortOrder === 'desc' ? -1 : 1;
        const total = await this.itemModel.countDocuments(filter);
        const items = await this.itemModel
            .find(filter)
            .sort({ [sortField]: sortDirection })
            .skip(skip)
            .limit(limit)
            .exec();
        const totalPages = Math.ceil(total / limit) || 1;
        return {
            data: items.map(item => this.formatItem(item, user)),
            meta: {
                total,
                page,
                limit,
                totalPages,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1,
            },
        };
    }
    async findOneItem(id, user) {
        const item = await this.itemModel.findOne({ _id: id, shopId: user.shopId, isDeleted: { $ne: true } });
        if (!item)
            throw new common_1.NotFoundException('Item not found');
        return this.formatItem(item, user);
    }
    async updateItem(id, updateItemDto, user) {
        const item = await this.itemModel.findOne({ _id: id, shopId: user.shopId, isDeleted: { $ne: true } });
        if (!item)
            throw new common_1.NotFoundException('Item not found');
        if (updateItemDto.name !== undefined)
            item.name = updateItemDto.name;
        if (updateItemDto.sku !== undefined)
            item.sku = updateItemDto.sku;
        if (updateItemDto.category !== undefined)
            item.category = updateItemDto.category;
        if (updateItemDto.sellPrice !== undefined)
            item.sellPrice = updateItemDto.sellPrice;
        if (updateItemDto.buyPrice !== undefined && (user.role === 'admin' || user.permissions?.canViewBuyPrice)) {
            item.buyPrice = updateItemDto.buyPrice;
        }
        if (updateItemDto.stockQuantity !== undefined)
            item.stockQuantity = updateItemDto.stockQuantity;
        if (updateItemDto.unit !== undefined)
            item.unit = updateItemDto.unit;
        if (updateItemDto.lowStockThreshold !== undefined)
            item.lowStockThreshold = updateItemDto.lowStockThreshold;
        await item.save();
        return this.formatItem(item, user);
    }
    async updateStock(id, updateStockDto, user) {
        const item = await this.itemModel.findOne({ _id: id, shopId: user.shopId, isDeleted: { $ne: true } });
        if (!item)
            throw new common_1.NotFoundException('Item not found');
        item.stockQuantity = Math.max(0, item.stockQuantity + updateStockDto.adjustment);
        await item.save();
        return this.formatItem(item, user);
    }
    async removeItem(id, user) {
        const item = await this.itemModel.findOne({ _id: id, shopId: user.shopId, isDeleted: { $ne: true } });
        if (!item)
            throw new common_1.NotFoundException('Item not found');
        item.isDeleted = true;
        item.deletedAt = new Date();
        item.deletedBy = user.uid || user.id;
        await item.save();
        return { message: 'Item moved to trash (Soft deleted). Can be restored from Recycle Bin.' };
    }
    async createCategory(createCategoryDto, user) {
        const existing = await this.categoryModel.findOne({
            shopId: user.shopId,
            name: createCategoryDto.name.trim(),
            isDeleted: { $ne: true },
        });
        if (existing)
            throw new common_1.ConflictException('Category already exists in your shop');
        const cat = new this.categoryModel({
            name: createCategoryDto.name.trim(),
            description: createCategoryDto.description || '',
            shopId: user.shopId,
            isDeleted: false,
        });
        const saved = await cat.save();
        return {
            id: saved._id.toString(),
            name: saved.name,
            description: saved.description,
        };
    }
    async findAllCategories(user, query = {}) {
        const page = Math.max(1, Number(query.page) || 1);
        const limit = Math.max(1, Math.min(100, Number(query.limit) || 10));
        const skip = (page - 1) * limit;
        const filter = { shopId: user.shopId, isDeleted: { $ne: true } };
        if (query.search) {
            filter.$or = [
                { name: { $regex: query.search, $options: 'i' } },
                { description: { $regex: query.search, $options: 'i' } },
            ];
        }
        const sortField = query.sortBy || 'name';
        const sortDirection = query.sortOrder === 'desc' ? -1 : 1;
        const total = await this.categoryModel.countDocuments(filter);
        const categories = await this.categoryModel
            .find(filter)
            .sort({ [sortField]: sortDirection })
            .skip(skip)
            .limit(limit)
            .exec();
        const totalPages = Math.ceil(total / limit) || 1;
        return {
            data: categories.map(c => ({
                id: c._id.toString(),
                name: c.name,
                description: c.description,
            })),
            meta: {
                total,
                page,
                limit,
                totalPages,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1,
            },
        };
    }
    formatItem(item, user) {
        const canViewBuy = user.role === 'admin' || user.permissions?.canViewBuyPrice;
        return {
            id: item._id.toString(),
            name: item.name,
            sku: item.sku,
            code: item.sku,
            category: item.category,
            sellPrice: item.sellPrice.toString(),
            buyPrice: canViewBuy ? item.buyPrice.toString() : '0.00',
            stockQuantity: item.stockQuantity,
            unit: item.unit,
            lowStockThreshold: item.lowStockThreshold,
            reorderLevel: item.lowStockThreshold,
            isLowStock: item.stockQuantity <= item.lowStockThreshold,
        };
    }
};
exports.InventoryService = InventoryService;
exports.InventoryService = InventoryService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(item_schema_1.Item.name)),
    __param(1, (0, mongoose_1.InjectModel)(category_schema_1.Category.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model])
], InventoryService);
//# sourceMappingURL=inventory.service.js.map