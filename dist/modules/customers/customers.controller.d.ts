import { CustomersService } from './customers.service';
import { CreateCustomerDto, UpdateCustomerDto } from './dto/customer.dto';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';
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
    findAll(user: any, query: PaginationQueryDto): Promise<{
        data: {
            id: string;
            name: string;
            phone: string;
            address: string;
            openingBalance: string;
            closingBalance: string;
        }[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
            hasNextPage: boolean;
            hasPrevPage: boolean;
        };
    }>;
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
    getLedger(id: string, user: any, query: PaginationQueryDto): Promise<{
        data: {
            id: string;
            type: string;
            referenceId: string;
            date: Date;
            description: string;
            amount: string;
            previousBalance: string;
            newBalance: string;
        }[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
            hasNextPage: boolean;
            hasPrevPage: boolean;
        };
    }>;
}
