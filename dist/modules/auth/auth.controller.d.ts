import { AuthService } from './auth.service';
import { LoginDto, RegisterDto, CreateUserDto, UpdatePermissionsDto, ChangePasswordDto } from './dto/auth.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    login(loginDto: LoginDto): Promise<{
        token: string;
        user: {
            uid: string;
            email: string;
            name: string;
            role: string;
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
            permissions: import("./schemas/user.schema").ManagerPermissions;
        };
    }>;
    getProfile(user: any): any;
    getAllUsers(): Promise<{
        uid: string;
        email: string;
        name: string;
        role: string;
        permissions: import("./schemas/user.schema").ManagerPermissions;
    }[]>;
    createUser(createUserDto: CreateUserDto): Promise<{
        uid: string;
        email: string;
        name: string;
        role: string;
        permissions: import("./schemas/user.schema").ManagerPermissions;
    }>;
    updateUserPermissions(id: string, updatePermissionsDto: UpdatePermissionsDto): Promise<{
        uid: string;
        email: string;
        name: string;
        role: string;
        permissions: import("./schemas/user.schema").ManagerPermissions;
    }>;
    changePassword(uid: string, changePasswordDto: ChangePasswordDto): Promise<{
        message: string;
    }>;
    deleteUser(id: string): Promise<{
        message: string;
    }>;
}
