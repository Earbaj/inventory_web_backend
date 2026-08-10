import { Injectable, UnauthorizedException, ConflictException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from './schemas/user.schema';
import { LoginDto, RegisterDto, CreateUserDto, PermissionsDto, ChangePasswordDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto) {
    const email = loginDto.email.trim().toLowerCase();
    const user = await this.userModel.findOne({ email });
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isMatch = await bcrypt.compare(loginDto.password, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const payload = { sub: user._id.toString(), email: user.email, role: user.role };
    const token = this.jwtService.sign(payload);

    return {
      token,
      user: {
        uid: user._id.toString(),
        email: user.email,
        name: user.name,
        role: user.role,
        permissions: user.permissions,
      },
    };
  }

  async register(registerDto: RegisterDto) {
    const email = registerDto.email.trim().toLowerCase();
    const existing = await this.userModel.findOne({ email });
    if (existing) {
      throw new ConflictException('User with this email already exists');
    }

    const passwordHash = await bcrypt.hash(registerDto.password, 10);
    const role = registerDto.role || 'admin';
    const permissions = role === 'admin'
      ? { canProcessReturn: true, canExportExcel: true, canEditCustomers: true, canViewBuyPrice: true }
      : { canProcessReturn: false, canExportExcel: false, canEditCustomers: false, canViewBuyPrice: false };

    const newUser = new this.userModel({
      name: registerDto.name,
      email,
      passwordHash,
      role,
      permissions,
    });

    await newUser.save();

    const payload = { sub: newUser._id.toString(), email: newUser.email, role: newUser.role };
    const token = this.jwtService.sign(payload);

    return {
      token,
      user: {
        uid: newUser._id.toString(),
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
        permissions: newUser.permissions,
      },
    };
  }

  async createUser(createUserDto: CreateUserDto) {
    const email = createUserDto.email.trim().toLowerCase();
    const existing = await this.userModel.findOne({ email });
    if (existing) {
      throw new ConflictException('User with this email already exists');
    }

    const passwordHash = await bcrypt.hash(createUserDto.password, 10);
    const permissions = createUserDto.permissions || (createUserDto.role === 'admin'
      ? { canProcessReturn: true, canExportExcel: true, canEditCustomers: true, canViewBuyPrice: true }
      : { canProcessReturn: false, canExportExcel: false, canEditCustomers: false, canViewBuyPrice: false });

    const user = new this.userModel({
      name: createUserDto.name,
      email,
      passwordHash,
      role: createUserDto.role,
      permissions,
    });

    await user.save();

    return {
      uid: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
      permissions: user.permissions,
    };
  }

  async getAllUsers() {
    const users = await this.userModel.find().select('-passwordHash').exec();
    return users.map(user => ({
      uid: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
      permissions: user.permissions,
    }));
  }

  async updateUserPermissions(uid: string, permissions: PermissionsDto) {
    const user = await this.userModel.findById(uid);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.permissions = {
      ...user.permissions,
      ...permissions,
    };

    await user.save();

    return {
      uid: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
      permissions: user.permissions,
    };
  }

  async changePassword(uid: string, changePasswordDto: ChangePasswordDto) {
    const user = await this.userModel.findById(uid);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.passwordHash = await bcrypt.hash(changePasswordDto.newPassword, 10);
    await user.save();

    return { message: 'Password updated successfully' };
  }

  async deleteUser(uid: string) {
    const res = await this.userModel.findByIdAndDelete(uid);
    if (!res) {
      throw new NotFoundException('User not found');
    }
    return { message: 'User deleted successfully' };
  }
}
