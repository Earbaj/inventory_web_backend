import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { NotFoundException } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { Payment } from './schemas/payment.schema';
import { Customer } from '../customers/schemas/customer.schema';
import { Ledger } from '../customers/schemas/ledger.schema';

describe('PaymentsService Unit Tests', () => {
  let service: PaymentsService;
  let mockPaymentModel: any;
  let mockCustomerModel: any;
  let mockLedgerModel: any;

  beforeEach(async () => {
    mockPaymentModel = jest.fn();

    mockCustomerModel = jest.fn();
    mockCustomerModel.findOne = jest.fn();

    mockLedgerModel = jest.fn();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentsService,
        {
          provide: getModelToken(Payment.name),
          useValue: mockPaymentModel,
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

    service = module.get<PaymentsService>(PaymentsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('processPayment', () => {
    it('should update customer closing balance and save payment & ledger records', async () => {
      const mockCustomer = {
        _id: 'cust_1',
        name: 'Rahim Traders',
        closingBalance: -500, // Due 500 BDT
        save: jest.fn().mockResolvedValue(undefined),
      };

      mockCustomerModel.findOne.mockResolvedValue(mockCustomer);

      const mockSavedPayment = {
        _id: 'pay_1',
        date: new Date(),
        receivedBy: 'user_1',
      };

      mockPaymentModel.mockImplementation(() => ({
        save: jest.fn().mockResolvedValue(mockSavedPayment),
      }));

      mockLedgerModel.mockImplementation(() => ({
        save: jest.fn().mockResolvedValue({}),
      }));

      const user = { shopId: 'shop_1', uid: 'user_1' };

      const result = await service.processPayment(
        {
          customerId: 'cust_1',
          amount: 500,
          paymentMethod: 'bkash',
        },
        user,
      );

      expect(mockCustomer.closingBalance).toEqual(0); // -500 + 500 = 0!
      expect(mockCustomer.save).toHaveBeenCalled();
      expect(result.amount).toEqual('500');
      expect(result.newBalance).toEqual('0');
    });
  });
});
