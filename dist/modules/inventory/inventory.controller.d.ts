import { InventoryService } from './inventory.service';
import { CreateItemDto, UpdateItemDto, UpdateStockDto, CreateCategoryDto } from './dto/inventory.dto';
export declare class InventoryController {
    private readonly inventoryService;
    constructor(inventoryService: InventoryService);
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
    removeItem(id: string): Promise<{
        message: string;
    }>;
    findAllCategories(): Promise<{
        id: string;
        name: string;
        description: string;
    }[]>;
    createCategory(createCategoryDto: CreateCategoryDto): Promise<{
        id: string;
        name: string;
        description: string;
    }>;
}
