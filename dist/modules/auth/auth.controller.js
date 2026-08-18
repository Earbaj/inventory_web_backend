"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const auth_service_1 = require("./auth.service");
const auth_dto_1 = require("./dto/auth.dto");
const pagination_dto_1 = require("../../common/dto/pagination.dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const get_user_decorator_1 = require("../../common/decorators/get-user.decorator");
let AuthController = class AuthController {
    constructor(authService) {
        this.authService = authService;
    }
    setupSuperAdmin(setupDto) {
        return this.authService.setupSuperAdmin(setupDto);
    }
    forgotPassword(forgotDto) {
        return this.authService.forgotPassword(forgotDto);
    }
    resetPassword(resetDto) {
        return this.authService.resetPassword(resetDto);
    }
    login(loginDto) {
        return this.authService.login(loginDto);
    }
    register(registerDto) {
        return this.authService.register(registerDto);
    }
    getProfile(user) {
        return user;
    }
    getAllUsers(user, query) {
        return this.authService.getAllUsers(user, query);
    }
    getStaffMembers(user, query) {
        return this.authService.getAllUsers(user, query);
    }
    getStaffById(id, user) {
        return this.authService.getUserById(id, user);
    }
    createUser(createUserDto, user) {
        return this.authService.createUser(createUserDto, user);
    }
    createStaff(createUserDto, user) {
        return this.authService.createUser(createUserDto, user);
    }
    updateUserPermissions(id, updatePermissionsDto, user) {
        return this.authService.updateUserPermissions(id, updatePermissionsDto.permissions, user);
    }
    updateStaffPermissions(id, updatePermissionsDto, user) {
        return this.authService.updateUserPermissions(id, updatePermissionsDto.permissions, user);
    }
    changePassword(uid, changePasswordDto) {
        return this.authService.changePassword(uid, changePasswordDto);
    }
    deleteUser(id, user) {
        return this.authService.deleteUser(id, user);
    }
    deleteStaff(id, user) {
        return this.authService.deleteUser(id, user);
    }
    getShopsList(user, query) {
        return this.authService.getShopsList(user, query);
    }
    getShopById(id, user) {
        return this.authService.getShopById(id, user);
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, common_1.Post)('auth/setup-superadmin'),
    (0, swagger_1.ApiOperation)({ summary: 'One-time initial SuperAdmin creation (Allowed only if 0 SuperAdmins exist)' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'SuperAdmin created successfully' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'SuperAdmin already exists' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_dto_1.SetupSuperAdminDto]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "setupSuperAdmin", null);
__decorate([
    (0, common_1.Post)('auth/forgot-password'),
    (0, swagger_1.ApiOperation)({ summary: 'Request password recovery OTP code sent to user email' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_dto_1.ForgotPasswordDto]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "forgotPassword", null);
__decorate([
    (0, common_1.Post)('auth/reset-password'),
    (0, swagger_1.ApiOperation)({ summary: 'Reset password using OTP reset code' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_dto_1.ResetPasswordDto]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "resetPassword", null);
__decorate([
    (0, common_1.Post)('auth/login'),
    (0, swagger_1.ApiOperation)({ summary: 'Login user and get JWT token' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'User authenticated successfully' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_dto_1.LoginDto]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "login", null);
__decorate([
    (0, common_1.Post)('auth/register'),
    (0, swagger_1.ApiOperation)({ summary: 'Register a new Shop Owner (Admin) account' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_dto_1.RegisterDto]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "register", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Get)('auth/me'),
    (0, swagger_1.ApiOperation)({ summary: 'Get profile of current logged in user' }),
    __param(0, (0, get_user_decorator_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "getProfile", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Get)('users'),
    (0, swagger_1.ApiOperation)({ summary: 'List all shop users (Paginated)' }),
    __param(0, (0, get_user_decorator_1.GetUser)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, pagination_dto_1.PaginationQueryDto]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "getAllUsers", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Get)('staff'),
    (0, swagger_1.ApiOperation)({ summary: 'List all staff members for current shop (Paginated)' }),
    __param(0, (0, get_user_decorator_1.GetUser)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, pagination_dto_1.PaginationQueryDto]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "getStaffMembers", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Get)('staff/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get staff member details by ID' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, get_user_decorator_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "getStaffById", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin', 'superadmin'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Post)('users'),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new manager account (Shop Admin only - Max 1 for Free Tier)' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, get_user_decorator_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_dto_1.CreateUserDto, Object]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "createUser", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin', 'superadmin'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Post)('staff'),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new staff member account (Alias for POST /api/users)' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, get_user_decorator_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_dto_1.CreateUserDto, Object]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "createStaff", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin', 'superadmin'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Patch)('users/:id/permissions'),
    (0, swagger_1.ApiOperation)({ summary: 'Update manager permissions (Admin only)' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, get_user_decorator_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, auth_dto_1.UpdatePermissionsDto, Object]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "updateUserPermissions", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin', 'superadmin'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Patch)('staff/:id/permissions'),
    (0, swagger_1.ApiOperation)({ summary: 'Update staff permissions (Alias for PATCH /api/users/:id/permissions)' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, get_user_decorator_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, auth_dto_1.UpdatePermissionsDto, Object]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "updateStaffPermissions", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Post)('users/change-password'),
    (0, swagger_1.ApiOperation)({ summary: 'Change current logged in user password' }),
    __param(0, (0, get_user_decorator_1.GetUser)('uid')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, auth_dto_1.ChangePasswordDto]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "changePassword", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin', 'superadmin'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Delete)('users/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete user account (Admin only)' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, get_user_decorator_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "deleteUser", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin', 'superadmin'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Delete)('staff/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete staff account (Alias for DELETE /api/users/:id)' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, get_user_decorator_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "deleteStaff", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('superadmin'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Get)('admin/shops'),
    (0, swagger_1.ApiOperation)({ summary: 'List all registered shop accounts (SuperAdmin only) (Paginated)' }),
    __param(0, (0, get_user_decorator_1.GetUser)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, pagination_dto_1.PaginationQueryDto]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "getShopsList", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('superadmin'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Get)('admin/shops/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get shop details by ID (SuperAdmin only)' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, get_user_decorator_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "getShopById", null);
exports.AuthController = AuthController = __decorate([
    (0, swagger_1.ApiTags)('Authentication & Users'),
    (0, common_1.Controller)('api'),
    __metadata("design:paramtypes", [auth_service_1.AuthService])
], AuthController);
//# sourceMappingURL=auth.controller.js.map