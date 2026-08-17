import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { ForbiddenException, BadRequestException } from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { SubscriptionPayment } from './schemas/subscription-payment.schema';
import { User } from '../auth/schemas/user.schema';

describe('SubscriptionsService Unit Tests', () => {
  let service: SubscriptionsService;
  let mockPaymentModel: any;
  let mockUserModel: any;

  beforeEach(async () => {
    mockPaymentModel = jest.fn();
    mockPaymentModel.find = jest.fn();
    mockPaymentModel.findById = jest.fn();

    mockUserModel = jest.fn();
    mockUserModel.findById = jest.fn();
    mockUserModel.updateMany = jest.fn();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SubscriptionsService,
        {
          provide: getModelToken(SubscriptionPayment.name),
          useValue: mockPaymentModel,
        },
        {
          provide: getModelToken(User.name),
          useValue: mockUserModel,
        },
      ],
    }).compile();

    service = module.get<SubscriptionsService>(SubscriptionsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getPackages', () => {
    it('should return available package catalog', () => {
      const packages = service.getPackages();
      expect(packages.length).toBeGreaterThanOrEqual(3);
      expect(packages[0].id).toEqual('free');
      expect(packages[1].id).toEqual('premium_monthly');
    });
  });

  describe('approvePayment', () => {
    it('should calculate expiry extension and upgrade tier to premium', async () => {
      const mockPayment = {
        _id: 'payment_123',
        userId: 'user_123',
        packageId: 'premium_monthly',
        status: 'pending',
        save: jest.fn().mockResolvedValue(undefined),
      };

      const mockShopOwner = {
        _id: 'user_123',
        shopId: 'user_123',
        subscriptionTier: 'free',
        subscriptionExpiresAt: null,
        save: jest.fn().mockResolvedValue(undefined),
      };

      mockPaymentModel.findById.mockResolvedValue(mockPayment);
      mockUserModel.findById.mockResolvedValue(mockShopOwner);
      mockUserModel.updateMany.mockResolvedValue({ modifiedCount: 1 });

      const superAdminUser = { role: 'superadmin', uid: 'admin_super_1' };

      const result = await service.approvePayment('payment_123', superAdminUser);

      expect(result.message).toEqual('Subscription payment approved successfully');
      expect(result.subscriptionTier).toEqual('premium');
      expect(mockShopOwner.subscriptionTier).toEqual('premium');
      expect(mockPayment.status).toEqual('approved');
      expect(mockUserModel.updateMany).toHaveBeenCalled();
    });

    it('should throw ForbiddenException if caller is not SuperAdmin', async () => {
      await expect(
        service.approvePayment('payment_123', { role: 'admin' }),
      ).rejects.toThrow(ForbiddenException);
    });
  });
});
