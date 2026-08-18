import { InventoryService } from './inventory.service';
import { CreateItemDto, UpdateItemDto, UpdateStockDto, CreateCategoryDto, QueryItemDto } from './dto/inventory.dto';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';
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
    findAllItems(user: any, query: QueryItemDto): Promise<{
        data: {
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
        }[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
            hasNextPage: boolean;
            hasPrevPage: boolean;
        };
    }>;
    findLowStockItems(user: any, query: PaginationQueryDto): Promise<{
        data: {
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
        }[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
            hasNextPage: boolean;
            hasPrevPage: boolean;
        };
    }>;
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
    findAllCategories(user: any, query: PaginationQueryDto): Promise<{
        data: {
            id: string;
            name: string;
            description: string;
        }[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
            hasNextPage: boolean;
            hasPrevPage: boolean;
        };
    }>;
    createCategory(createCategoryDto: CreateCategoryDto, user: any): Promise<{
        id: string;
        name: string;
        description: string;
    }>;
}
