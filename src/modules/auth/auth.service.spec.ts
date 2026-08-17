import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import { ForbiddenException, UnauthorizedException, BadRequestException, ConflictException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { User } from './schemas/user.schema';
import * as bcrypt from 'bcrypt';

describe('AuthService Unit Tests', () => {
  let service: AuthService;
  let mockUserModel: any;
  let mockJwtService: any;

  beforeEach(async () => {
    mockUserModel = jest.fn();
    mockUserModel.countDocuments = jest.fn();
    mockUserModel.findOne = jest.fn();
    mockUserModel.findById = jest.fn();
    mockUserModel.find = jest.fn();
    mockUserModel.findByIdAndDelete = jest.fn();

    mockJwtService = {
      sign: jest.fn().mockReturnValue('mock_jwt_token_string'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getModelToken(User.name),
          useValue: mockUserModel,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('setupSuperAdmin', () => {
    it('should throw ForbiddenException if SuperAdmin already exists in database', async () => {
      mockUserModel.countDocuments.mockResolvedValue(1);

      await expect(
        service.setupSuperAdmin({
          name: 'Super Admin',
          email: 'superadmin@keeper.com',
          password: 'password123',
        }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should successfully create SuperAdmin if 0 SuperAdmins exist', async () => {
      mockUserModel.countDocuments.mockResolvedValue(0);
      mockUserModel.findOne.mockResolvedValue(null);

      const mockSave = jest.fn().mockResolvedValue(undefined);
      const mockCreatedUser = {
        _id: 'superadmin_id_123',
        name: 'Super Admin',
        email: 'superadmin@keeper.com',
        role: 'superadmin',
        subscriptionTier: 'premium',
        save: mockSave,
      };

      // Mock constructor pattern for new userModel instance
      mockUserModel.mockImplementation(() => mockCreatedUser);

      const result = await service.setupSuperAdmin({
        name: 'Super Admin',
        email: 'superadmin@keeper.com',
        password: 'password123',
      });

      expect(result.message).toEqual('SuperAdmin created successfully');
      expect(result.token).toEqual('mock_jwt_token_string');
      expect(result.user.role).toEqual('superadmin');
    });
  });

  describe('forgotPassword & resetPassword', () => {
    it('should generate 6-digit OTP code for forgotPassword', async () => {
      const mockUser = {
        email: 'user@shop.com',
        resetPasswordCode: null,
        resetPasswordExpiresAt: null,
        save: jest.fn().mockResolvedValue(undefined),
      };
      mockUserModel.findOne.mockResolvedValue(mockUser);

      const result = await service.forgotPassword({ email: 'user@shop.com' });
      expect(result.message).toContain('Password reset code has been sent');
      expect(mockUser.resetPasswordCode).toBeDefined();
      expect(mockUser.resetPasswordCode.length).toEqual(6);
    });

    it('should throw BadRequestException for invalid or expired OTP code in resetPassword', async () => {
      mockUserModel.findOne.mockResolvedValue({
        email: 'user@shop.com',
        resetPasswordCode: '123456',
        resetPasswordExpiresAt: new Date(Date.now() - 1000), // Expired!
      });

      await expect(
        service.resetPassword({
          email: 'user@shop.com',
          resetCode: '123456',
          newPassword: 'newpassword123',
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('createUser Free Tier Limitation', () => {
    it('should throw BadRequestException when Free Tier shop tries to create 2nd Manager', async () => {
      mockUserModel.findOne.mockResolvedValue(null); // No existing email conflict
      mockUserModel.countDocuments.mockResolvedValue(1); // 1 manager already exists!
      mockUserModel.findById.mockResolvedValue({
        _id: 'shop_admin_id',
        subscriptionTier: 'free',
      });

      const loggedInUser = {
        role: 'admin',
        shopId: 'shop_admin_id',
        subscriptionTier: 'free',
      };

      await expect(
        service.createUser(
          {
            name: 'Second Manager',
            email: 'manager2@shop.com',
            password: 'password123',
            role: 'manager',
          },
          loggedInUser,
        ),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
