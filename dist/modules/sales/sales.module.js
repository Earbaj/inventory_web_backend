"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SalesModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const sales_service_1 = require("./sales.service");
const sales_controller_1 = require("./sales.controller");
const sale_schema_1 = require("./schemas/sale.schema");
const item_schema_1 = require("../inventory/schemas/item.schema");
const customer_schema_1 = require("../customers/schemas/customer.schema");
const ledger_schema_1 = require("../customers/schemas/ledger.schema");
let SalesModule = class SalesModule {
};
exports.SalesModule = SalesModule;
exports.SalesModule = SalesModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: sale_schema_1.Sale.name, schema: sale_schema_1.SaleSchema },
                { name: item_schema_1.Item.name, schema: item_schema_1.ItemSchema },
                { name: customer_schema_1.Customer.name, schema: customer_schema_1.CustomerSchema },
                { name: ledger_schema_1.Ledger.name, schema: ledger_schema_1.LedgerSchema },
            ]),
        ],
        controllers: [sales_controller_1.SalesController],
        providers: [sales_service_1.SalesService],
        exports: [sales_service_1.SalesService, mongoose_1.MongooseModule],
    })
], SalesModule);
//# sourceMappingURL=sales.module.js.map