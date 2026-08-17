import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { TrashService } from './trash.service';
import { Item } from '../inventory/schemas/item.schema';
import { Customer } from '../customers/schemas/customer.schema';
import { Sale } from '../sales/schemas/sale.schema';
import { Return } from '../returns/schemas/return.schema';
import { Ledger } from '../customers/schemas/ledger.schema';

describe('TrashService Unit Tests', () => {
  let service: TrashService;
  let mockItemModel: any;
  let mockCustomerModel: any;
  let mockSaleModel: any;
  let mockReturnModel: any;
  let mockLedgerModel: any;

  beforeEach(async () => {
    mockItemModel = jest.fn();
    mockItemModel.find = jest.fn();
    mockItemModel.findOne = jest.fn();
    mockItemModel.findOneAndDelete = jest.fn();

    mockCustomerModel = jest.fn();
    mockCustomerModel.find = jest.fn();
    mockCustomerModel.findOne = jest.fn();
    mockCustomerModel.findOneAndDelete = jest.fn();

    mockSaleModel = jest.fn();
    mockSaleModel.find = jest.fn();
    mockSaleModel.findOne = jest.fn();
    mockSaleModel.findOneAndDelete = jest.fn();

    mockReturnModel = jest.fn();
    mockReturnModel.find = jest.fn();
    mockReturnModel.findOne = jest.fn();
    mockReturnModel.findOneAndDelete = jest.fn();

    mockLedgerModel = jest.fn();
    mockLedgerModel.updateMany = jest.fn();
    mockLedgerModel.deleteMany = jest.fn();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TrashService,
        { provide: getModelToken(Item.name), useValue: mockItemModel },
        { provide: getModelToken(Customer.name), useValue: mockCustomerModel },
        { provide: getModelToken(Sale.name), useValue: mockSaleModel },
        { provide: getModelToken(Return.name), useValue: mockReturnModel },
        { provide: getModelToken(Ledger.name), useValue: mockLedgerModel },
      ],
    }).compile();

    service = module.get<TrashService>(TrashService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('restoreItem', () => {
    it('should restore soft-deleted item back to active inventory table (isDeleted: false)', async () => {
      const mockDeletedItem = {
        _id: 'item_1',
        name: 'Wireless Mouse',
        isDeleted: true,
        deletedAt: new Date(),
        save: jest.fn().mockResolvedValue(undefined),
      };

      mockItemModel.findOne.mockResolvedValue(mockDeletedItem);

      const user = { shopId: 'shop_1' };
      const result = await service.restoreItem('item', 'item_1', user);

      expect(mockDeletedItem.isDeleted).toBe(false);
      expect(mockDeletedItem.deletedAt).toBeNull();
      expect(mockDeletedItem.save).toHaveBeenCalled();
      expect(result.message).toContain('successfully restored');
    });
  });

  describe('permanentDelete Hard Delete', () => {
    it('should permanently purge soft-deleted item from database', async () => {
      mockItemModel.findOneAndDelete.mockResolvedValue({ _id: 'item_1', name: 'Wireless Mouse' });

      const adminUser = { role: 'admin', shopId: 'shop_1' };
      const result = await service.permanentDelete('item', 'item_1', adminUser);

      expect(mockItemModel.findOneAndDelete).toHaveBeenCalledWith({ _id: 'item_1', shopId: 'shop_1', isDeleted: true });
      expect(result.message).toContain('permanently purged');
    });

    it('should throw ForbiddenException if Manager attempts hard delete', async () => {
      const managerUser = { role: 'manager', shopId: 'shop_1' };
      await expect(
        service.permanentDelete('item', 'item_1', managerUser),
      ).rejects.toThrow(ForbiddenException);
    });
  });
});
