import { JwtService } from '@nestjs/jwt';
import { Model } from 'mongoose';
import { UserDocument } from './schemas/user.schema';
import { LoginDto, RegisterDto, CreateUserDto, PermissionsDto, ChangePasswordDto, SetupSuperAdminDto, ForgotPasswordDto, ResetPasswordDto } from './dto/auth.dto';
export declare class AuthService {
    private userModel;
    private jwtService;
    private readonly logger;
    constructor(userModel: Model<UserDocument>, jwtService: JwtService);
    setupSuperAdmin(dto: SetupSuperAdminDto): Promise<{
        message: string;
        token: string;
        user: {
            uid: string;
            email: string;
            name: string;
            role: string;
            subscriptionTier: string;
        };
    }>;
    forgotPassword(dto: ForgotPasswordDto): Promise<{
        message: string;
        email: string;
        devNoticeCode: string;
    }>;
    resetPassword(dto: ResetPasswordDto): Promise<{
        message: string;
    }>;
    login(loginDto: LoginDto): Promise<{
        token: string;
        user: {
            uid: string;
            email: string;
            name: string;
            role: string;
            shopId: string;
            subscriptionTier: string;
            subscriptionExpiresAt: Date;
            permissions: import("./schemas/user.schema").ManagerPermissions;
        };
    }>;
    register(registerDto: RegisterDto): Promise<{
        token: string;
        user: {
            uid: string;
            email: string;
            name: string;
            role: string;
            shopId: string;
            subscriptionTier: string;
            subscriptionExpiresAt: Date;
            permissions: import("./schemas/user.schema").ManagerPermissions;
        };
    }>;
    createUser(createUserDto: CreateUserDto, loggedInUser: any): Promise<{
        uid: string;
        email: string;
        name: string;
        role: string;
        shopId: string;
        permissions: import("./schemas/user.schema").ManagerPermissions;
    }>;
    getAllUsers(loggedInUser: any): Promise<{
        uid: string;
        email: string;
        name: string;
        role: string;
        shopId: string;
        subscriptionTier: string;
        subscriptionExpiresAt: Date;
        permissions: import("./schemas/user.schema").ManagerPermissions;
    }[]>;
    updateUserPermissions(uid: string, permissions: PermissionsDto, loggedInUser: any): Promise<{
        uid: string;
        email: string;
        name: string;
        role: string;
        permissions: import("./schemas/user.schema").ManagerPermissions;
    }>;
    changePassword(uid: string, changePasswordDto: ChangePasswordDto): Promise<{
        message: string;
    }>;
    deleteUser(uid: string, loggedInUser: any): Promise<{
        message: string;
    }>;
}
