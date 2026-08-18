import { PaginationQueryDto } from '../../../common/dto/pagination.dto';
export declare class CreateItemDto {
    name: string;
    sku?: string;
    category?: string;
    sellPrice: number;
    buyPrice: number;
    stockQuantity: number;
    unit?: string;
    lowStockThreshold?: number;
}
export declare class UpdateItemDto {
    name?: string;
    sku?: string;
    category?: string;
    sellPrice?: number;
    buyPrice?: number;
    stockQuantity?: number;
    unit?: string;
    lowStockThreshold?: number;
}
export declare class UpdateStockDto {
    adjustment: number;
}
export declare class CreateCategoryDto {
    name: string;
    description?: string;
}
export declare class QueryItemDto extends PaginationQueryDto {
    category?: string;
}
