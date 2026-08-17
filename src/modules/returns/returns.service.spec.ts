import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ReturnsService } from './returns.service';
import { Return } from './schemas/return.schema';
import { Sale } from '../sales/schemas/sale.schema';
import { Item } from '../inventory/schemas/item.schema';
import { Customer } from '../customers/schemas/customer.schema';
import { Ledger } from '../customers/schemas/ledger.schema';

describe('ReturnsService Unit Tests', () => {
  let service: ReturnsService;
  let mockReturnModel: any;
  let mockSaleModel: any;
  let mockItemModel: any;
  let mockCustomerModel: any;
  let mockLedgerModel: any;

  beforeEach(async () => {
    mockReturnModel = jest.fn();
    mockReturnModel.find = jest.fn();

    mockSaleModel = jest.fn();
    mockSaleModel.findOne = jest.fn();

    mockItemModel = jest.fn();
    mockItemModel.findOne = jest.fn();

    mockCustomerModel = jest.fn();
    mockCustomerModel.findOne = jest.fn();

    mockLedgerModel = jest.fn();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReturnsService,
        {
          provide: getModelToken(Return.name),
          useValue: mockReturnModel,
        },
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

    service = module.get<ReturnsService>(ReturnsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('processReturn Restocking', () => {
    it('should restock item stock quantity upon product return', async () => {
      const mockSale = {
        _id: 'sale_1',
        invoiceNumber: 'INV-20260817-0001',
        customerId: 'walk-in',
        items: [
          {
            itemId: 'item_1',
            name: 'Keyboard',
            quantity: 2,
            unitPrice: 500,
            discount: 0,
            discountType: 'amount',
            totalPrice: 1000,
          },
        ],
        subtotal: 1000,
        discount: 0,
        grandTotal: 1000,
        paidAmount: 1000,
        dueAmount: 0,
        paymentStatus: 'paid',
        isReturned: 'none',
        save: jest.fn().mockResolvedValue(undefined),
      };

      const mockItem = {
        _id: 'item_1',
        name: 'Keyboard',
        stockQuantity: 5,
        save: jest.fn().mockResolvedValue(undefined),
      };

      mockSaleModel.findOne.mockResolvedValue(mockSale);
      mockItemModel.findOne.mockResolvedValue(mockItem);

      const mockSavedReturn = {
        _id: 'return_1',
        date: new Date(),
        processedBy: 'user_1',
        save: jest.fn().mockResolvedValue({ _id: 'return_1', date: new Date(), processedBy: 'user_1' }),
      };

      mockReturnModel.mockImplementation(() => mockSavedReturn);

      const user = { shopId: 'shop_1', uid: 'user_1' };

      const result = await service.processReturn(
        {
          saleId: 'sale_1',
          returnedItems: [{ itemId: 'item_1', quantity: 1 }],
        },
        user,
      );

      expect(mockItem.stockQuantity).toEqual(6); // 5 + 1 = 6 restocked!
      expect(mockItem.save).toHaveBeenCalled();
      expect(result.totalRefund).toEqual('500');
    });
  });
});
