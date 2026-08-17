import { Strategy } from 'passport-jwt';
import { Model } from 'mongoose';
import { UserDocument } from './schemas/user.schema';
declare const JwtStrategy_base: new (...args: any[]) => Strategy;
export declare class JwtStrategy extends JwtStrategy_base {
    private userModel;
    constructor(userModel: Model<UserDocument>);
    validate(payload: {
        sub: string;
        email: string;
    }): Promise<{
        uid: string;
        id: string;
        email: string;
        name: string;
        role: string;
        permissions: import("./schemas/user.schema").ManagerPermissions;
        shopId: string;
        subscriptionTier: string;
        subscriptionExpiresAt: Date;
    }>;
}
export {};
