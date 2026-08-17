import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { ForbiddenException } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { Sale } from '../sales/schemas/sale.schema';
import { Item } from '../inventory/schemas/item.schema';
import { Customer } from '../customers/schemas/customer.schema';
import { User } from '../auth/schemas/user.schema';
import { SubscriptionPayment } from '../subscriptions/schemas/subscription-payment.schema';

describe('DashboardService Unit Tests', () => {
  let service: DashboardService;
  let mockSaleModel: any;
  let mockItemModel: any;
  let mockCustomerModel: any;
  let mockUserModel: any;
  let mockPaymentModel: any;

  beforeEach(async () => {
    mockSaleModel = jest.fn();
    mockSaleModel.find = jest.fn();
    mockSaleModel.countDocuments = jest.fn();

    mockItemModel = jest.fn();
    mockItemModel.find = jest.fn();
    mockItemModel.countDocuments = jest.fn();

    mockCustomerModel = jest.fn();
    mockCustomerModel.find = jest.fn();

    mockUserModel = jest.fn();
    mockUserModel.countDocuments = jest.fn();

    mockPaymentModel = jest.fn();
    mockPaymentModel.countDocuments = jest.fn();
    mockPaymentModel.find = jest.fn();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DashboardService,
        { provide: getModelToken(Sale.name), useValue: mockSaleModel },
        { provide: getModelToken(Item.name), useValue: mockItemModel },
        { provide: getModelToken(Customer.name), useValue: mockCustomerModel },
        { provide: getModelToken(User.name), useValue: mockUserModel },
        { provide: getModelToken(SubscriptionPayment.name), useValue: mockPaymentModel },
      ],
    }).compile();

    service = module.get<DashboardService>(DashboardService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getDashboardStats', () => {
    it('should compute correct sales revenue, paid amount, and net profit', async () => {
      const mockSales = [
        {
          grandTotal: 1000,
          paidAmount: 800,
          dueAmount: 200,
          items: [{ itemId: 'item_1', quantity: 2, totalPrice: 1000 }],
        },
      ];
      const mockItems = [
        {
          _id: 'item_1',
          buyPrice: 300,
          stockQuantity: 2,
          lowStockThreshold: 5, // Low stock!
        },
      ];
      const mockCustomers = [
        { closingBalance: -200 }, // Customer due 200
      ];

      mockSaleModel.find.mockReturnValue({ exec: jest.fn().mockResolvedValue(mockSales) });
      mockItemModel.find.mockReturnValue({ exec: jest.fn().mockResolvedValue(mockItems) });
      mockCustomerModel.find.mockReturnValue({ exec: jest.fn().mockResolvedValue(mockCustomers) });

      const adminUser = { role: 'admin', shopId: 'shop_1' };
      const stats = await service.getDashboardStats(adminUser);

      expect(stats.totalSalesRevenue).toEqual('1000');
      expect(stats.totalPaidCollected).toEqual('800');
      expect(stats.totalDueAmount).toEqual('200');
      // Net Profit = totalPrice (1000) - cost (300 * 2 = 600) = 400!
      expect(stats.netProfit).toEqual('400');
      expect(stats.lowStockCount).toEqual(1);
      expect(stats.totalCustomerDue).toEqual('200');
    });
  });

  describe('getSuperAdminDashboard', () => {
    it('should return platform overview metrics for SuperAdmin', async () => {
      mockUserModel.countDocuments
        .mockResolvedValueOnce(10) // totalShops
        .mockResolvedValueOnce(15) // totalManagers
        .mockResolvedValueOnce(6)  // freeShops
        .mockResolvedValueOnce(4); // premiumShops

      mockPaymentModel.countDocuments.mockResolvedValue(2); // pendingPayments
      mockPaymentModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue([{ amount: 1000 }, { amount: 10000 }]), // approved payments
      });

      mockItemModel.countDocuments.mockResolvedValue(50);
      mockSaleModel.countDocuments.mockResolvedValue(120);

      const superAdminUser = { role: 'superadmin' };
      const res = await service.getSuperAdminDashboard(superAdminUser);

      expect(res.totalRegisteredShops).toEqual(10);
      expect(res.totalManagersCount).toEqual(15);
      expect(res.totalSubscriptionRevenue).toEqual('11000');
    });

    it('should throw ForbiddenException if user is not SuperAdmin', async () => {
      const adminUser = { role: 'admin' };
      await expect(service.getSuperAdminDashboard(adminUser)).rejects.toThrow(ForbiddenException);
    });
  });
});
