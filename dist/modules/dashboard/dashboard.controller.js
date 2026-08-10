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
exports.DashboardController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const dashboard_service_1 = require("./dashboard.service");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const get_user_decorator_1 = require("../../common/decorators/get-user.decorator");
let DashboardController = class DashboardController {
    constructor(dashboardService) {
        this.dashboardService = dashboardService;
    }
    getDashboardStats(user) {
        return this.dashboardService.getDashboardStats(user);
    }
    getSalesReport(startDate, endDate, cashierId) {
        return this.dashboardService.getSalesReport(startDate, endDate, cashierId);
    }
};
exports.DashboardController = DashboardController;
__decorate([
    (0, common_1.Get)('dashboard/stats'),
    (0, swagger_1.ApiOperation)({ summary: 'Get overall KPIs (Total Sales, Net Profit, Low Stock count, Outstanding Due, etc.)' }),
    __param(0, (0, get_user_decorator_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], DashboardController.prototype, "getDashboardStats", null);
__decorate([
    (0, common_1.Get)('reports/sales'),
    (0, swagger_1.ApiOperation)({ summary: 'Get aggregated sales report filtered by date range and cashier' }),
    (0, swagger_1.ApiQuery)({ name: 'startDate', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'endDate', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'cashierId', required: false }),
    __param(0, (0, common_1.Query)('startDate')),
    __param(1, (0, common_1.Query)('endDate')),
    __param(2, (0, common_1.Query)('cashierId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], DashboardController.prototype, "getSalesReport", null);
exports.DashboardController = DashboardController = __decorate([
    (0, swagger_1.ApiTags)('Dashboard & Reports'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('api'),
    __metadata("design:paramtypes", [dashboard_service_1.DashboardService])
], DashboardController);
//# sourceMappingURL=dashboard.controller.js.map