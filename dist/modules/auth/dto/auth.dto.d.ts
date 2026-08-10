export declare class LoginDto {
    email: string;
    password: string;
}
export declare class PermissionsDto {
    canProcessReturn?: boolean;
    canExportExcel?: boolean;
    canEditCustomers?: boolean;
    canViewBuyPrice?: boolean;
}
export declare class RegisterDto {
    name: string;
    email: string;
    password: string;
    role?: string;
}
export declare class CreateUserDto {
    name: string;
    email: string;
    password: string;
    role: string;
    permissions?: PermissionsDto;
}
export declare class UpdatePermissionsDto {
    permissions: PermissionsDto;
}
export declare class ChangePasswordDto {
    newPassword: string;
}
