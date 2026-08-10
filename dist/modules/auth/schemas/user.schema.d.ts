import { Document } from 'mongoose';
export type UserDocument = User & Document;
export declare class ManagerPermissions {
    canProcessReturn: boolean;
    canExportExcel: boolean;
    canEditCustomers: boolean;
    canViewBuyPrice: boolean;
}
export declare const ManagerPermissionsSchema: import("mongoose").Schema<ManagerPermissions, import("mongoose").Model<ManagerPermissions, any, any, any, Document<unknown, any, ManagerPermissions, any, {}> & ManagerPermissions & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, ManagerPermissions, Document<unknown, {}, import("mongoose").FlatRecord<ManagerPermissions>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<ManagerPermissions> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
export declare class User {
    email: string;
    passwordHash: string;
    name: string;
    role: string;
    permissions: ManagerPermissions;
}
export declare const UserSchema: import("mongoose").Schema<User, import("mongoose").Model<User, any, any, any, Document<unknown, any, User, any, {}> & User & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, User, Document<unknown, {}, import("mongoose").FlatRecord<User>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<User> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
