import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CustomersService } from './customers.service';
import { Customer } from './schemas/customer.schema';
import { Ledger } from './schemas/ledger.schema';

describe('CustomersService Unit Tests', () => {
  let service: CustomersService;
  let mockCustomerModel: any;
  let mockLedgerModel: any;

  beforeEach(async () => {
    mockCustomerModel = jest.fn();
    mockCustomerModel.countDocuments = jest.fn();
    mockCustomerModel.find = jest.fn();
    mockCustomerModel.findOne = jest.fn();

    mockLedgerModel = jest.fn();
    mockLedgerModel.find = jest.fn();
    mockLedgerModel.updateMany = jest.fn();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CustomersService,
        {
          provide: getModelToken(Customer.name),
          useValue: mockCustomerModel,
        },
        {
          provide: getModelToken(Ledger.name),
          useValue: mockLedgerModel,
        },
      ],
    }).compile();

    service = module.get<CustomersService>(CustomersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should throw BadRequestException if Free Tier shop tries to create 2nd customer', async () => {
      mockCustomerModel.countDocuments.mockResolvedValue(1); // 1 customer already exists

      const freeUser = { shopId: 'shop_1', subscriptionTier: 'free' };

      await expect(
        service.create({ name: 'Second Customer' }, freeUser),
      ).rejects.toThrow(BadRequestException);
    });

    it('should create customer and initial opening ledger for Premium shop', async () => {
      mockCustomerModel.countDocuments.mockResolvedValue(0);

      const mockSavedCustomer = {
        _id: 'cust_123',
        name: 'Rahim Traders',
        phone: '01711000000',
        address: 'Dhaka',
        openingBalance: 100,
        closingBalance: 100,
      };

      mockCustomerModel.mockImplementation(() => ({
        save: jest.fn().mockResolvedValue(mockSavedCustomer),
      }));

      mockLedgerModel.mockImplementation(() => ({
        save: jest.fn().mockResolvedValue({}),
      }));

      const premiumUser = { shopId: 'shop_1', subscriptionTier: 'premium' };

      const result = await service.create(
        { name: 'Rahim Traders', openingBalance: 100 },
        premiumUser,
      );

      expect(result.id).toEqual('cust_123');
      expect(result.name).toEqual('Rahim Traders');
    });
  });

  describe('remove (Soft Delete)', () => {
    it('should mark customer and associated ledgers as soft deleted (isDeleted: true)', async () => {
      const mockCustomer = {
        _id: 'cust_123',
        name: 'Rahim Traders',
        isDeleted: false,
        deletedAt: null,
        deletedBy: null,
        save: jest.fn().mockResolvedValue(undefined),
      };

      mockCustomerModel.findOne.mockResolvedValue(mockCustomer);
      mockLedgerModel.updateMany.mockResolvedValue({ modifiedCount: 1 });

      const user = { shopId: 'shop_1', uid: 'user_1' };
      const result = await service.remove('cust_123', user);

      expect(mockCustomer.isDeleted).toBe(true);
      expect(mockCustomer.save).toHaveBeenCalled();
      expect(mockLedgerModel.updateMany).toHaveBeenCalled();
      expect(result.message).toContain('Soft deleted');
    });
  });
});
