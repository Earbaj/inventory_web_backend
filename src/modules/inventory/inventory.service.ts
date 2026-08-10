import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Item, ItemDocument } from './schemas/item.schema';
import { Category, CategoryDocument } from './schemas/category.schema';
import { CreateItemDto, UpdateItemDto, UpdateStockDto, CreateCategoryDto } from './dto/inventory.dto';

@Injectable()
export class InventoryService {
  constructor(
    @InjectModel(Item.name) private itemModel: Model<ItemDocument>,
    @InjectModel(Category.name) private categoryModel: Model<CategoryDocument>,
  ) {}

  async createItem(createItemDto: CreateItemDto, user: any) {
    const item = new this.itemModel({
      name: createItemDto.name,
      sku: createItemDto.sku || '',
      category: createItemDto.category || 'General',
      sellPrice: createItemDto.sellPrice,
      buyPrice: createItemDto.buyPrice,
      stockQuantity: createItemDto.stockQuantity,
      unit: createItemDto.unit || 'pcs',
      lowStockThreshold: createItemDto.lowStockThreshold ?? 5,
    });

    const saved = await item.save();
    return this.formatItem(saved, user);
  }

  async findAllItems(user: any, category?: string) {
    const query: any = {};
    if (category) query.category = category;
    const items = await this.itemModel.find(query).exec();
    return items.map(item => this.formatItem(item, user));
  }

  async findLowStockItems(user: any) {
    const items = await this.itemModel.find().exec();
    const lowStock = items.filter(i => i.stockQuantity <= i.lowStockThreshold);
    return lowStock.map(item => this.formatItem(item, user));
  }

  async findOneItem(id: string, user: any) {
    const item = await this.itemModel.findById(id);
    if (!item) throw new NotFoundException('Item not found');
    return this.formatItem(item, user);
  }

  async updateItem(id: string, updateItemDto: UpdateItemDto, user: any) {
    const item = await this.itemModel.findById(id);
    if (!item) throw new NotFoundException('Item not found');

    if (updateItemDto.name !== undefined) item.name = updateItemDto.name;
    if (updateItemDto.sku !== undefined) item.sku = updateItemDto.sku;
    if (updateItemDto.category !== undefined) item.category = updateItemDto.category;
    if (updateItemDto.sellPrice !== undefined) item.sellPrice = updateItemDto.sellPrice;
    if (updateItemDto.buyPrice !== undefined && (user.role === 'admin' || user.permissions?.canViewBuyPrice)) {
      item.buyPrice = updateItemDto.buyPrice;
    }
    if (updateItemDto.stockQuantity !== undefined) item.stockQuantity = updateItemDto.stockQuantity;
    if (updateItemDto.unit !== undefined) item.unit = updateItemDto.unit;
    if (updateItemDto.lowStockThreshold !== undefined) item.lowStockThreshold = updateItemDto.lowStockThreshold;

    await item.save();
    return this.formatItem(item, user);
  }

  async updateStock(id: string, updateStockDto: UpdateStockDto, user: any) {
    const item = await this.itemModel.findById(id);
    if (!item) throw new NotFoundException('Item not found');

    item.stockQuantity = Math.max(0, item.stockQuantity + updateStockDto.adjustment);
    await item.save();
    return this.formatItem(item, user);
  }

  async removeItem(id: string) {
    const item = await this.itemModel.findByIdAndDelete(id);
    if (!item) throw new NotFoundException('Item not found');
    return { message: 'Item deleted successfully' };
  }

  // Categories
  async createCategory(createCategoryDto: CreateCategoryDto) {
    const existing = await this.categoryModel.findOne({ name: createCategoryDto.name.trim() });
    if (existing) throw new ConflictException('Category already exists');

    const cat = new this.categoryModel({
      name: createCategoryDto.name.trim(),
      description: createCategoryDto.description || '',
    });
    const saved = await cat.save();
    return {
      id: saved._id.toString(),
      name: saved.name,
      description: saved.description,
    };
  }

  async findAllCategories() {
    const categories = await this.categoryModel.find().exec();
    return categories.map(c => ({
      id: c._id.toString(),
      name: c.name,
      description: c.description,
    }));
  }

  private formatItem(item: ItemDocument, user: any) {
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
}
