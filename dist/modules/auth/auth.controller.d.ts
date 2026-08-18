import { AuthService } from './auth.service';
import { LoginDto, RegisterDto, CreateUserDto, UpdatePermissionsDto, ChangePasswordDto, SetupSuperAdminDto, ForgotPasswordDto, ResetPasswordDto } from './dto/auth.dto';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    setupSuperAdmin(setupDto: SetupSuperAdminDto): Promise<{
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
    forgotPassword(forgotDto: ForgotPasswordDto): Promise<{
        message: string;
        email: string;
        devNoticeCode: string;
    }>;
    resetPassword(resetDto: ResetPasswordDto): Promise<{
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
    getProfile(user: any): any;
    getAllUsers(user: any, query: PaginationQueryDto): Promise<{
        data: {
            id: string;
            uid: string;
            email: string;
            name: string;
            role: string;
            shopId: string;
            subscriptionTier: string;
            subscriptionExpiresAt: Date;
            permissions: import("./schemas/user.schema").ManagerPermissions;
        }[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
            hasNextPage: boolean;
            hasPrevPage: boolean;
        };
    }>;
    getStaffMembers(user: any, query: PaginationQueryDto): Promise<{
        data: {
            id: string;
            uid: string;
            email: string;
            name: string;
            role: string;
            shopId: string;
            subscriptionTier: string;
            subscriptionExpiresAt: Date;
            permissions: import("./schemas/user.schema").ManagerPermissions;
        }[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
            hasNextPage: boolean;
            hasPrevPage: boolean;
        };
    }>;
    getStaffById(id: string, user: any): Promise<{
        id: string;
        uid: string;
        email: string;
        name: string;
        role: string;
        shopId: string;
        subscriptionTier: string;
        subscriptionExpiresAt: Date;
        permissions: import("./schemas/user.schema").ManagerPermissions;
    }>;
    createUser(createUserDto: CreateUserDto, user: any): Promise<{
        uid: string;
        email: string;
        name: string;
        role: string;
        shopId: string;
        permissions: import("./schemas/user.schema").ManagerPermissions;
    }>;
    createStaff(createUserDto: CreateUserDto, user: any): Promise<{
        uid: string;
        email: string;
        name: string;
        role: string;
        shopId: string;
        permissions: import("./schemas/user.schema").ManagerPermissions;
    }>;
    updateUserPermissions(id: string, updatePermissionsDto: UpdatePermissionsDto, user: any): Promise<{
        uid: string;
        email: string;
        name: string;
        role: string;
        permissions: import("./schemas/user.schema").ManagerPermissions;
    }>;
    updateStaffPermissions(id: string, updatePermissionsDto: UpdatePermissionsDto, user: any): Promise<{
        uid: string;
        email: string;
        name: string;
        role: string;
        permissions: import("./schemas/user.schema").ManagerPermissions;
    }>;
    changePassword(uid: string, changePasswordDto: ChangePasswordDto): Promise<{
        message: string;
    }>;
    deleteUser(id: string, user: any): Promise<{
        message: string;
    }>;
    deleteStaff(id: string, user: any): Promise<{
        message: string;
    }>;
    getShopsList(user: any, query: PaginationQueryDto): Promise<{
        data: {
            id: string;
            shopId: string;
            name: string;
            email: string;
            role: string;
            subscriptionTier: string;
            subscriptionExpiresAt: Date;
            managerCount: number;
            createdAt: any;
        }[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
            hasNextPage: boolean;
            hasPrevPage: boolean;
        };
    }>;
    getShopById(id: string, user: any): Promise<{
        id: string;
        shopId: string;
        name: string;
        email: string;
        role: string;
        subscriptionTier: string;
        subscriptionExpiresAt: Date;
        managers: {
            uid: string;
            name: string;
            email: string;
            permissions: import("./schemas/user.schema").ManagerPermissions;
        }[];
        createdAt: any;
    }>;
}
