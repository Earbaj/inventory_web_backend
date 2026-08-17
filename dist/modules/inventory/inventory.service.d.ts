import { Model } from 'mongoose';
import { ItemDocument } from './schemas/item.schema';
import { CategoryDocument } from './schemas/category.schema';
import { CreateItemDto, UpdateItemDto, UpdateStockDto, CreateCategoryDto } from './dto/inventory.dto';
export declare class InventoryService {
    private itemModel;
    private categoryModel;
    constructor(itemModel: Model<ItemDocument>, categoryModel: Model<CategoryDocument>);
    createItem(createItemDto: CreateItemDto, user: any): Promise<{
        id: string;
        name: string;
        sku: string;
        code: string;
        category: string;
        sellPrice: string;
        buyPrice: string;
        stockQuantity: number;
        unit: string;
        lowStockThreshold: number;
        reorderLevel: number;
        isLowStock: boolean;
    }>;
    findAllItems(user: any, category?: string): Promise<{
        id: string;
        name: string;
        sku: string;
        code: string;
        category: string;
        sellPrice: string;
        buyPrice: string;
        stockQuantity: number;
        unit: string;
        lowStockThreshold: number;
        reorderLevel: number;
        isLowStock: boolean;
    }[]>;
    findLowStockItems(user: any): Promise<{
        id: string;
        name: string;
        sku: string;
        code: string;
        category: string;
        sellPrice: string;
        buyPrice: string;
        stockQuantity: number;
        unit: string;
        lowStockThreshold: number;
        reorderLevel: number;
        isLowStock: boolean;
    }[]>;
    findOneItem(id: string, user: any): Promise<{
        id: string;
        name: string;
        sku: string;
        code: string;
        category: string;
        sellPrice: string;
        buyPrice: string;
        stockQuantity: number;
        unit: string;
        lowStockThreshold: number;
        reorderLevel: number;
        isLowStock: boolean;
    }>;
    updateItem(id: string, updateItemDto: UpdateItemDto, user: any): Promise<{
        id: string;
        name: string;
        sku: string;
        code: string;
        category: string;
        sellPrice: string;
        buyPrice: string;
        stockQuantity: number;
        unit: string;
        lowStockThreshold: number;
        reorderLevel: number;
        isLowStock: boolean;
    }>;
    updateStock(id: string, updateStockDto: UpdateStockDto, user: any): Promise<{
        id: string;
        name: string;
        sku: string;
        code: string;
        category: string;
        sellPrice: string;
        buyPrice: string;
        stockQuantity: number;
        unit: string;
        lowStockThreshold: number;
        reorderLevel: number;
        isLowStock: boolean;
    }>;
    removeItem(id: string, user: any): Promise<{
        message: string;
    }>;
    createCategory(createCategoryDto: CreateCategoryDto, user: any): Promise<{
        id: string;
        name: string;
        description: string;
    }>;
    findAllCategories(user: any): Promise<{
        id: string;
        name: string;
        description: string;
    }[]>;
    private formatItem;
}
