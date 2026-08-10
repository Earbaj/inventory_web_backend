"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SeedModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const seed_service_1 = require("./seed.service");
const user_schema_1 = require("../auth/schemas/user.schema");
const category_schema_1 = require("../inventory/schemas/category.schema");
const item_schema_1 = require("../inventory/schemas/item.schema");
const customer_schema_1 = require("../customers/schemas/customer.schema");
const ledger_schema_1 = require("../customers/schemas/ledger.schema");
let SeedModule = class SeedModule {
};
exports.SeedModule = SeedModule;
exports.SeedModule = SeedModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: user_schema_1.User.name, schema: user_schema_1.UserSchema },
                { name: category_schema_1.Category.name, schema: category_schema_1.CategorySchema },
                { name: item_schema_1.Item.name, schema: item_schema_1.ItemSchema },
                { name: customer_schema_1.Customer.name, schema: customer_schema_1.CustomerSchema },
                { name: ledger_schema_1.Ledger.name, schema: ledger_schema_1.LedgerSchema },
            ]),
        ],
        providers: [seed_service_1.SeedService],
        exports: [seed_service_1.SeedService],
    })
], SeedModule);
//# sourceMappingURL=seed.module.js.map