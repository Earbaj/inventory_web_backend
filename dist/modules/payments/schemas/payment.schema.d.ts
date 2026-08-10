import { Document, Schema as MongooseSchema } from 'mongoose';
export type PaymentDocument = Payment & Document;
export declare class Payment {
    customerId: string;
    amount: number;
    paymentMethod: string;
    date: Date;
    receivedBy: string;
}
export declare const PaymentSchema: MongooseSchema<Payment, import("mongoose").Model<Payment, any, any, any, Document<unknown, any, Payment, any, {}> & Payment & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Payment, Document<unknown, {}, import("mongoose").FlatRecord<Payment>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<Payment> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
