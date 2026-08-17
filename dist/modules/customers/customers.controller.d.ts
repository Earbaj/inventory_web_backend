import { CustomersService } from './customers.service';
import { CreateCustomerDto, UpdateCustomerDto } from './dto/customer.dto';
export declare class CustomersController {
    private readonly customersService;
    constructor(customersService: CustomersService);
    create(createCustomerDto: CreateCustomerDto, user: any): Promise<{
        id: string;
        name: string;
        phone: string;
        address: string;
        openingBalance: string;
        closingBalance: string;
    }>;
    findAll(user: any): Promise<{
        id: string;
        name: string;
        phone: string;
        address: string;
        openingBalance: string;
        closingBalance: string;
    }[]>;
    findOne(id: string, user: any): Promise<{
        id: string;
        name: string;
        phone: string;
        address: string;
        openingBalance: string;
        closingBalance: string;
    }>;
    update(id: string, updateCustomerDto: UpdateCustomerDto, user: any): Promise<{
        id: string;
        name: string;
        phone: string;
        address: string;
        openingBalance: string;
        closingBalance: string;
    }>;
    remove(id: string, user: any): Promise<{
        message: string;
    }>;
    getLedger(id: string, user: any): Promise<{
        id: string;
        type: string;
        referenceId: string;
        date: Date;
        description: string;
        amount: string;
        previousBalance: string;
        newBalance: string;
    }[]>;
}
