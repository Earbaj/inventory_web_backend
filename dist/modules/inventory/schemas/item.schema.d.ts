import { Document } from 'mongoose';
export type ItemDocument = Item & Document;
export declare class Item {
    name: string;
    sku: string;
    category: string;
    sellPrice: number;
    buyPrice: number;
    stockQuantity: number;
    unit: string;
    lowStockThreshold: number;
    shopId: string;
    isDeleted: boolean;
    deletedAt: Date;
    deletedBy: string;
}
export declare const ItemSchema: import("mongoose").Schema<Item, import("mongoose").Model<Item, any, any, any, Document<unknown, any, Item, any, {}> & Item & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Item, Document<unknown, {}, import("mongoose").FlatRecord<Item>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<Item> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
