import { Document, Schema as MongooseSchema } from 'mongoose';
export type ReturnDocument = Return & Document;
export declare class ReturnedItemDetail {
    itemId: string;
    name: string;
    quantity: number;
    refundAmountPerUnit: number;
}
export declare const ReturnedItemDetailSchema: MongooseSchema<ReturnedItemDetail, import("mongoose").Model<ReturnedItemDetail, any, any, any, Document<unknown, any, ReturnedItemDetail, any, {}> & ReturnedItemDetail & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, ReturnedItemDetail, Document<unknown, {}, import("mongoose").FlatRecord<ReturnedItemDetail>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<ReturnedItemDetail> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
export declare class Return {
    customerId: string;
    saleId: string;
    invoiceNumber: string;
    returnedItems: ReturnedItemDetail[];
    totalRefund: number;
    date: Date;
    processedBy: string;
}
export declare const ReturnSchema: MongooseSchema<Return, import("mongoose").Model<Return, any, any, any, Document<unknown, any, Return, any, {}> & Return & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Return, Document<unknown, {}, import("mongoose").FlatRecord<Return>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<Return> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
