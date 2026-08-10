import { JwtService } from '@nestjs/jwt';
import { Model } from 'mongoose';
import { UserDocument } from './schemas/user.schema';
import { LoginDto, RegisterDto, CreateUserDto, PermissionsDto, ChangePasswordDto } from './dto/auth.dto';
export declare class AuthService {
    private userModel;
    private jwtService;
    constructor(userModel: Model<UserDocument>, jwtService: JwtService);
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
    createUser(createUserDto: CreateUserDto): Promise<{
        uid: string;
        email: string;
        name: string;
        role: string;
        permissions: import("./schemas/user.schema").ManagerPermissions;
    }>;
    getAllUsers(): Promise<{
        uid: string;
        email: string;
        name: string;
        role: string;
        permissions: import("./schemas/user.schema").ManagerPermissions;
    }[]>;
    updateUserPermissions(uid: string, permissions: PermissionsDto): Promise<{
        uid: string;
        email: string;
        name: string;
        role: string;
        permissions: import("./schemas/user.schema").ManagerPermissions;
    }>;
    changePassword(uid: string, changePasswordDto: ChangePasswordDto): Promise<{
        message: string;
    }>;
    deleteUser(uid: string): Promise<{
        message: string;
    }>;
}
