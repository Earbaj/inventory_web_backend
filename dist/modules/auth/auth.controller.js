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
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const get_user_decorator_1 = require("../../common/decorators/get-user.decorator");
let AuthController = class AuthController {
    constructor(authService) {
        this.authService = authService;
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
    getAllUsers() {
        return this.authService.getAllUsers();
    }
    createUser(createUserDto) {
        return this.authService.createUser(createUserDto);
    }
    updateUserPermissions(id, updatePermissionsDto) {
        return this.authService.updateUserPermissions(id, updatePermissionsDto.permissions);
    }
    changePassword(uid, changePasswordDto) {
        return this.authService.changePassword(uid, changePasswordDto);
    }
    deleteUser(id) {
        return this.authService.deleteUser(id);
    }
};
exports.AuthController = AuthController;
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
    (0, swagger_1.ApiOperation)({ summary: 'Register a new user account' }),
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
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Get)('users'),
    (0, swagger_1.ApiOperation)({ summary: 'List all system users (Admin only)' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "getAllUsers", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Post)('users'),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new manager or admin user (Admin only)' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_dto_1.CreateUserDto]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "createUser", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Patch)('users/:id/permissions'),
    (0, swagger_1.ApiOperation)({ summary: 'Update manager permissions (Admin only)' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, auth_dto_1.UpdatePermissionsDto]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "updateUserPermissions", null);
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
    (0, roles_decorator_1.Roles)('admin'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Delete)('users/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete user account (Admin only)' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "deleteUser", null);
exports.AuthController = AuthController = __decorate([
    (0, swagger_1.ApiTags)('Authentication & Users'),
    (0, common_1.Controller)('api'),
    __metadata("design:paramtypes", [auth_service_1.AuthService])
], AuthController);
//# sourceMappingURL=auth.controller.js.map