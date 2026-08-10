"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const mongoose_1 = require("@nestjs/mongoose");
const serve_static_1 = require("@nestjs/serve-static");
const path_1 = require("path");
const auth_module_1 = require("./modules/auth/auth.module");
const customers_module_1 = require("./modules/customers/customers.module");
const inventory_module_1 = require("./modules/inventory/inventory.module");
const sales_module_1 = require("./modules/sales/sales.module");
const payments_module_1 = require("./modules/payments/payments.module");
const returns_module_1 = require("./modules/returns/returns.module");
const dashboard_module_1 = require("./modules/dashboard/dashboard.module");
const seed_module_1 = require("./modules/seed/seed.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                envFilePath: ['.env', '.env.example'],
            }),
            mongoose_1.MongooseModule.forRootAsync({
                useFactory: () => ({
                    uri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/keeper_pos',
                }),
            }),
            serve_static_1.ServeStaticModule.forRoot({
                rootPath: (0, path_1.join)(__dirname, 'public'),
                exclude: ['/api/(.*)'],
            }),
            auth_module_1.AuthModule,
            customers_module_1.CustomersModule,
            inventory_module_1.InventoryModule,
            sales_module_1.SalesModule,
            payments_module_1.PaymentsModule,
            returns_module_1.ReturnsModule,
            dashboard_module_1.DashboardModule,
            seed_module_1.SeedModule,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map