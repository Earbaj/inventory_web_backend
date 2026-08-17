import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Item, ItemDocument } from './schemas/item.schema';
import { Category, CategoryDocument } from './schemas/category.schema';
import { CreateItemDto, UpdateItemDto, UpdateStockDto, CreateCategoryDto } from './dto/inventory.dto';

/**
 * Inventory & Product Catalog Management Service
 * ইনভেন্টরিতে পণ্য যোগ, তালিকা দেখা, স্টক অ্যাডজাস্টমেন্ট, সফট-ডিলিট এবং ক্যাটাগরি ম্যানেজমেন্ট সার্ভিস।
 */
@Injectable()
export class InventoryService {
  constructor(
    @InjectModel(Item.name) private itemModel: Model<ItemDocument>,
    @InjectModel(Category.name) private categoryModel: Model<CategoryDocument>,
  ) {}

  /**
   * 1. Create Product Item
   * ইনভেন্টরিতে নতুন পণ্য যোগ করা।
   * ফ্রি টিয়ার এনফোর্সমেন্ট: ফ্রি প্যাকেজে সর্বোচ্চ ৫টি পর্যন্ত পণ্য যোগ করার সীমাবদ্ধতা রয়েছে।
   */
  async createItem(createItemDto: CreateItemDto, user: any) {
    // ফ্রি টিয়ার ইনভেন্টরি আইটেম লিমিট চেক (সর্বোচ্চ ৫টি পণ্য)
    if (user.subscriptionTier === 'free') {
      const itemCount = await this.itemModel.countDocuments({
        shopId: user.shopId,
        isDeleted: { $ne: true },
      });
      if (itemCount >= 5) {
        throw new BadRequestException(
          'Free tier is limited to 5 inventory items only. Please upgrade to premium.'
        );
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

  /**
   * 2. List All Active Inventory Items (Optionally filtered by Category)
   */
  async findAllItems(user: any, category?: string) {
    const query: any = { shopId: user.shopId, isDeleted: { $ne: true } };
    if (category) query.category = category;
    const items = await this.itemModel.find(query).exec();
    return items.map(item => this.formatItem(item, user));
  }

  /**
   * 3. Get Low Stock Warning Items
   * যেসব পণ্যের মজুদ নির্দিষ্ট থ্রেশহোল্ডের নিচে নেমে গেছে তাদের তালিকা।
   */
  async findLowStockItems(user: any) {
    const items = await this.itemModel.find({ shopId: user.shopId, isDeleted: { $ne: true } }).exec();
    const lowStock = items.filter(i => i.stockQuantity <= i.lowStockThreshold);
    return lowStock.map(item => this.formatItem(item, user));
  }

  /**
   * 4. Find Single Item Details By ID
   */
  async findOneItem(id: string, user: any) {
    const item = await this.itemModel.findOne({ _id: id, shopId: user.shopId, isDeleted: { $ne: true } });
    if (!item) throw new NotFoundException('Item not found');
    return this.formatItem(item, user);
  }

  /**
   * 5. Update Product Details
   * পণ্যের তথ্য আপডেট করা (কেনা দাম বা Buy Price শুধুমাত্র অ্যাডমিন বা অনুমতিপ্রাপ্ত ইউজার এডিট করতে পারবেন)।
   */
  async updateItem(id: string, updateItemDto: UpdateItemDto, user: any) {
    const item = await this.itemModel.findOne({ _id: id, shopId: user.shopId, isDeleted: { $ne: true } });
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

  /**
   * 6. Adjust Stock Quantity (+/- N)
   * পণ্যের মজুদ সমন্বয় করার মেথড।
   */
  async updateStock(id: string, updateStockDto: UpdateStockDto, user: any) {
    const item = await this.itemModel.findOne({ _id: id, shopId: user.shopId, isDeleted: { $ne: true } });
    if (!item) throw new NotFoundException('Item not found');

    item.stockQuantity = Math.max(0, item.stockQuantity + updateStockDto.adjustment);
    await item.save();
    return this.formatItem(item, user);
  }

  /**
   * 7. Soft-Delete Item (Move to Recycle Bin)
   * পণ্যের ডাটা সরাসরি না মুছে রিসাইকেল বিনে স্থানান্তর করা।
   */
  async removeItem(id: string, user: any) {
    const item = await this.itemModel.findOne({ _id: id, shopId: user.shopId, isDeleted: { $ne: true } });
    if (!item) throw new NotFoundException('Item not found');

    // সফট ডিলিট ফ্লাগ সেট করা
    item.isDeleted = true;
    item.deletedAt = new Date();
    item.deletedBy = user.uid || user.id;
    await item.save();

    return { message: 'Item moved to trash (Soft deleted). Can be restored from Recycle Bin.' };
  }

  /**
   * 8. Create Product Category
   */
  async createCategory(createCategoryDto: CreateCategoryDto, user: any) {
    const existing = await this.categoryModel.findOne({
      shopId: user.shopId,
      name: createCategoryDto.name.trim(),
      isDeleted: { $ne: true },
    });
    if (existing) throw new ConflictException('Category already exists in your shop');

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

  /**
   * 9. List All Product Categories
   */
  async findAllCategories(user: any) {
    const categories = await this.categoryModel.find({ shopId: user.shopId, isDeleted: { $ne: true } }).exec();
    return categories.map(c => ({
      id: c._id.toString(),
      name: c.name,
      description: c.description,
    }));
  }

  /**
   * Response Formatter Helper (Protects buyPrice if user lacks permissions)
   */
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
