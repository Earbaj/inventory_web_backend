import { Model } from 'mongoose';
import { CustomerDocument } from './schemas/customer.schema';
import { LedgerDocument } from './schemas/ledger.schema';
import { CreateCustomerDto, UpdateCustomerDto } from './dto/customer.dto';
export declare class CustomersService {
    private customerModel;
    private ledgerModel;
    constructor(customerModel: Model<CustomerDocument>, ledgerModel: Model<LedgerDocument>);
    create(createCustomerDto: CreateCustomerDto): Promise<{
        id: string;
        name: string;
        phone: string;
        address: string;
        openingBalance: string;
        closingBalance: string;
    }>;
    findAll(): Promise<{
        id: string;
        name: string;
        phone: string;
        address: string;
        openingBalance: string;
        closingBalance: string;
    }[]>;
    findOne(id: string): Promise<{
        id: string;
        name: string;
        phone: string;
        address: string;
        openingBalance: string;
        closingBalance: string;
    }>;
    update(id: string, updateCustomerDto: UpdateCustomerDto): Promise<{
        id: string;
        name: string;
        phone: string;
        address: string;
        openingBalance: string;
        closingBalance: string;
    }>;
    remove(id: string): Promise<{
        message: string;
    }>;
    getLedger(customerId: string): Promise<{
        id: string;
        type: string;
        referenceId: string;
        date: Date;
        description: string;
        amount: string;
        previousBalance: string;
        newBalance: string;
    }[]>;
    private formatCustomer;
}
