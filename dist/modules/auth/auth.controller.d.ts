import { AuthService } from './auth.service';
import { LoginDto, RegisterDto, CreateUserDto, UpdatePermissionsDto, ChangePasswordDto, SetupSuperAdminDto, ForgotPasswordDto, ResetPasswordDto } from './dto/auth.dto';
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
    getAllUsers(user: any): Promise<{
        uid: string;
        email: string;
        name: string;
        role: string;
        shopId: string;
        subscriptionTier: string;
        subscriptionExpiresAt: Date;
        permissions: import("./schemas/user.schema").ManagerPermissions;
    }[]>;
    createUser(createUserDto: CreateUserDto, user: any): Promise<{
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
    changePassword(uid: string, changePasswordDto: ChangePasswordDto): Promise<{
        message: string;
    }>;
    deleteUser(id: string, user: any): Promise<{
        message: string;
    }>;
}
