import { Document } from 'mongoose';
export type CustomerDocument = Customer & Document;
export declare class Customer {
    name: string;
    phone: string;
    address: string;
    openingBalance: number;
    closingBalance: number;
    shopId: string;
    isDeleted: boolean;
    deletedAt: Date;
    deletedBy: string;
}
export declare const CustomerSchema: import("mongoose").Schema<Customer, import("mongoose").Model<Customer, any, any, any, Document<unknown, any, Customer, any, {}> & Customer & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Customer, Document<unknown, {}, import("mongoose").FlatRecord<Customer>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<Customer> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
