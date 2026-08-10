"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReturnsModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const returns_service_1 = require("./returns.service");
const returns_controller_1 = require("./returns.controller");
const return_schema_1 = require("./schemas/return.schema");
const sale_schema_1 = require("../sales/schemas/sale.schema");
const item_schema_1 = require("../inventory/schemas/item.schema");
const customer_schema_1 = require("../customers/schemas/customer.schema");
const ledger_schema_1 = require("../customers/schemas/ledger.schema");
let ReturnsModule = class ReturnsModule {
};
exports.ReturnsModule = ReturnsModule;
exports.ReturnsModule = ReturnsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: return_schema_1.Return.name, schema: return_schema_1.ReturnSchema },
                { name: sale_schema_1.Sale.name, schema: sale_schema_1.SaleSchema },
                { name: item_schema_1.Item.name, schema: item_schema_1.ItemSchema },
                { name: customer_schema_1.Customer.name, schema: customer_schema_1.CustomerSchema },
                { name: ledger_schema_1.Ledger.name, schema: ledger_schema_1.LedgerSchema },
            ]),
        ],
        controllers: [returns_controller_1.ReturnsController],
        providers: [returns_service_1.ReturnsService],
        exports: [returns_service_1.ReturnsService, mongoose_1.MongooseModule],
    })
], ReturnsModule);
//# sourceMappingURL=returns.module.js.map