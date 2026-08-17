import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { Item } from './schemas/item.schema';
import { Category } from './schemas/category.schema';

describe('InventoryService Unit Tests', () => {
  let service: InventoryService;
  let mockItemModel: any;
  let mockCategoryModel: any;

  beforeEach(async () => {
    mockItemModel = jest.fn();
    mockItemModel.countDocuments = jest.fn();
    mockItemModel.find = jest.fn();
    mockItemModel.findOne = jest.fn();

    mockCategoryModel = jest.fn();
    mockCategoryModel.find = jest.fn();
    mockCategoryModel.findOne = jest.fn();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InventoryService,
        {
          provide: getModelToken(Item.name),
          useValue: mockItemModel,
        },
        {
          provide: getModelToken(Category.name),
          useValue: mockCategoryModel,
        },
      ],
    }).compile();

    service = module.get<InventoryService>(InventoryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createItem Free Tier Limitation', () => {
    it('should throw BadRequestException when Free Tier shop tries to create 6th item', async () => {
      mockItemModel.countDocuments.mockResolvedValue(5); // Already 5 items!

      const freeUser = { shopId: 'shop_1', subscriptionTier: 'free' };

      await expect(
        service.createItem(
          {
            name: 'Item 6',
            sellPrice: 100,
            buyPrice: 80,
            stockQuantity: 10,
          },
          freeUser,
        ),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('updateStock Adjustment', () => {
    it('should adjust item stock quantity correctly', async () => {
      const mockItem = {
        _id: 'item_123',
        name: 'Mouse',
        sellPrice: 450,
        buyPrice: 320,
        stockQuantity: 10,
        lowStockThreshold: 5,
        save: jest.fn().mockResolvedValue(undefined),
      };

      mockItemModel.findOne.mockResolvedValue(mockItem);

      const user = { shopId: 'shop_1', role: 'admin' };
      const result = await service.updateStock('item_123', { adjustment: 5 }, user);

      expect(mockItem.stockQuantity).toEqual(15);
      expect(mockItem.save).toHaveBeenCalled();
    });
  });
});
