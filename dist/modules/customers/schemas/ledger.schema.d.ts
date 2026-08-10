import { Document, Schema as MongooseSchema } from 'mongoose';
export type LedgerDocument = Ledger & Document;
export declare class Ledger {
    customerId: string;
    type: string;
    referenceId: string;
    date: Date;
    description: string;
    amount: number;
    previousBalance: number;
    newBalance: number;
}
export declare const LedgerSchema: MongooseSchema<Ledger, import("mongoose").Model<Ledger, any, any, any, Document<unknown, any, Ledger, any, {}> & Ledger & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Ledger, Document<unknown, {}, import("mongoose").FlatRecord<Ledger>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<Ledger> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
