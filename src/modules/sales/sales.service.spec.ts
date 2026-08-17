import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { SalesService } from './sales.service';
import { Sale } from './schemas/sale.schema';
import { Item } from '../inventory/schemas/item.schema';
import { Customer } from '../customers/schemas/customer.schema';
import { Ledger } from '../customers/schemas/ledger.schema';

describe('SalesService Unit Tests', () => {
  let service: SalesService;
  let mockSaleModel: any;
  let mockItemModel: any;
  let mockCustomerModel: any;
  let mockLedgerModel: any;

  beforeEach(async () => {
    mockSaleModel = jest.fn();
    mockSaleModel.countDocuments = jest.fn();
    mockSaleModel.find = jest.fn();
    mockSaleModel.findOne = jest.fn();

    mockItemModel = jest.fn();
    mockItemModel.findOne = jest.fn();

    mockCustomerModel = jest.fn();
    mockCustomerModel.findOne = jest.fn();

    mockLedgerModel = jest.fn();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SalesService,
        {
          provide: getModelToken(Sale.name),
          useValue: mockSaleModel,
        },
        {
          provide: getModelToken(Item.name),
          useValue: mockItemModel,
        },
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

    service = module.get<SalesService>(SalesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createSale Free Tier Limitation', () => {
    it('should throw BadRequestException if Free Tier shop tries to create 6th sale', async () => {
      mockSaleModel.countDocuments.mockResolvedValue(5); // 5 sales already!

      const freeUser = { shopId: 'shop_1', subscriptionTier: 'free' };

      await expect(
        service.createSale(
          {
            items: [{ itemId: 'item_1', quantity: 1, unitPrice: 100 }],
            paidAmount: 100,
          },
          freeUser,
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should deduct item stock quantity upon successful checkout', async () => {
      mockSaleModel.countDocuments.mockResolvedValue(0);

      const mockItem = {
        _id: 'item_1',
        name: 'Mouse',
        stockQuantity: 10,
        save: jest.fn().mockResolvedValue(undefined),
      };

      mockItemModel.findOne.mockResolvedValue(mockItem);

      const mockSavedSale = {
        _id: 'sale_1',
        invoiceNumber: 'INV-20260817-0001',
        customerId: 'walk-in',
        customerName: 'Walk-in Customer',
        customerPhone: '',
        items: [
          {
            itemId: 'item_1',
            name: 'Mouse',
            quantity: 2,
            unitPrice: 450,
            discount: 0,
            discountType: 'amount',
            totalPrice: 900,
          },
        ],
        subtotal: 900,
        discount: 0,
        grandTotal: 900,
        paidAmount: 900,
        dueAmount: 0,
        paymentStatus: 'paid',
        date: new Date(),
        createdBy: 'user_1',
        createdByName: 'Cashier',
        isReturned: 'none',
      };

      mockSaleModel.mockImplementation(() => ({
        save: jest.fn().mockResolvedValue(mockSavedSale),
      }));

      const user = { shopId: 'shop_1', subscriptionTier: 'premium', uid: 'user_1', name: 'Cashier' };

      const result = await service.createSale(
        {
          items: [{ itemId: 'item_1', quantity: 2, unitPrice: 450 }],
          paidAmount: 900,
        },
        user,
      );

      expect(mockItem.stockQuantity).toEqual(8); // 10 - 2 = 8!
      expect(mockItem.save).toHaveBeenCalled();
      expect(result.invoiceNumber).toEqual('INV-20260817-0001');
    });
  });
});
