import { Model } from 'mongoose';
import { UserDocument } from '../auth/schemas/user.schema';
import { CategoryDocument } from '../inventory/schemas/category.schema';
import { ItemDocument } from '../inventory/schemas/item.schema';
import { CustomerDocument } from '../customers/schemas/customer.schema';
import { LedgerDocument } from '../customers/schemas/ledger.schema';
export declare class SeedService {
    private userModel;
    private categoryModel;
    private itemModel;
    private customerModel;
    private ledgerModel;
    private readonly logger;
    constructor(userModel: Model<UserDocument>, categoryModel: Model<CategoryDocument>, itemModel: Model<ItemDocument>, customerModel: Model<CustomerDocument>, ledgerModel: Model<LedgerDocument>);
    seed(): Promise<void>;
}
