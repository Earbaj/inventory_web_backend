import { Document, Schema as MongooseSchema } from 'mongoose';
export type SaleDocument = Sale & Document;
export declare class SaleItemEmbedded {
    itemId: string;
    name: string;
    quantity: number;
    unitPrice: number;
    discount: number;
    discountType: string;
    totalPrice: number;
}
export declare const SaleItemEmbeddedSchema: MongooseSchema<SaleItemEmbedded, import("mongoose").Model<SaleItemEmbedded, any, any, any, Document<unknown, any, SaleItemEmbedded, any, {}> & SaleItemEmbedded & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, SaleItemEmbedded, Document<unknown, {}, import("mongoose").FlatRecord<SaleItemEmbedded>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<SaleItemEmbedded> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
export declare class Sale {
    invoiceNumber: string;
    customerId: string;
    customerName: string;
    customerPhone: string;
    items: SaleItemEmbedded[];
    subtotal: number;
    discount: number;
    grandTotal: number;
    paidAmount: number;
    dueAmount: number;
    paymentStatus: string;
    date: Date;
    createdBy: string;
    createdByName: string;
    isReturned: string;
}
export declare const SaleSchema: MongooseSchema<Sale, import("mongoose").Model<Sale, any, any, any, Document<unknown, any, Sale, any, {}> & Sale & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Sale, Document<unknown, {}, import("mongoose").FlatRecord<Sale>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<Sale> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
