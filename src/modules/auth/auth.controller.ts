import { Controller, Post, Body, Get, Query, UseGuards, Param, Patch, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto, CreateUserDto, UpdatePermissionsDto, ChangePasswordDto, SetupSuperAdminDto, ForgotPasswordDto, ResetPasswordDto } from './dto/auth.dto';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { GetUser } from '../../common/decorators/get-user.decorator';

/**
 * Authentication & User Management Controller
 * এইচটিটিপি রাউটিং এবং Swagger ডকুমেন্টেশন হ্যান্ডেল করার জন্য কন্ট্রোলার।
 */
@ApiTags('Authentication & Users')
@Controller('api')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * 1. One-Time Initial SuperAdmin Creation Endpoint
   * ডাটাবেজে ০টি সুপার অ্যাডমিন থাকলে ১ বার ইমপ্লিমেন্ট করা যাবে। পরবর্তীতে ব্লক থাকবে।
   */
  @Post('auth/setup-superadmin')
  @ApiOperation({ summary: 'One-time initial SuperAdmin creation (Allowed only if 0 SuperAdmins exist)' })
  @ApiResponse({ status: 201, description: 'SuperAdmin created successfully' })
  @ApiResponse({ status: 403, description: 'SuperAdmin already exists' })
  setupSuperAdmin(@Body() setupDto: SetupSuperAdminDto) {
    return this.authService.setupSuperAdmin(setupDto);
  }

  /**
   * 2. Request Password Recovery OTP Code
   * পাসওয়ার্ড ভুলে গেলে ইমেইলে ৬ ডিজিটের ওটিপি পাঠানোর রিকোয়েস্ট এন্ডপয়েন্ট।
   */
  @Post('auth/forgot-password')
  @ApiOperation({ summary: 'Request password recovery OTP code sent to user email' })
  forgotPassword(@Body() forgotDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotDto);
  }

  /**
   * 3. Reset Password Using OTP Code
   * ওটিপি কোড দিয়ে নতুন পাসওয়ার্ড আপডেট করার এন্ডপয়েন্ট।
   */
  @Post('auth/reset-password')
  @ApiOperation({ summary: 'Reset password using OTP reset code' })
  resetPassword(@Body() resetDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetDto);
  }

  /**
   * 4. User Login Endpoint
   * ইমেইল ও পাসওয়ার্ড প্রদান করে JWT Bearer Token পাওয়ার এন্ডপয়েন্ট।
   */
  @Post('auth/login')
  @ApiOperation({ summary: 'Login user and get JWT token' })
  @ApiResponse({ status: 200, description: 'User authenticated successfully' })
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  /**
   * 5. Register New Shop Owner (Admin)
   * রেজিস্ট্রেশন পেজ থেকে নতুন শপ অ্যাডমিন সাইন-আপ করার এন্ডপয়েন্ট।
   */
  @Post('auth/register')
  @ApiOperation({ summary: 'Register a new Shop Owner (Admin) account' })
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  /**
   * 6. Get Current Logged In Profile
   * বর্তমানে লগইন থাকা ইউজারের প্রোফাইল ও সাবস্ক্রিপশন স্ট্যাটাস দেখার এন্ডপয়েন্ট।
   */
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('auth/me')
  @ApiOperation({ summary: 'Get profile of current logged in user' })
  getProfile(@GetUser() user: any) {
    return user;
  }

  /**
   * 7. List Shop Users (Admin / SuperAdmin Only)
   * নিজের শপের ইউজারদের পেজিনেটেড তালিকা দেখা (সুপার অ্যাডমিনদের জন্য সকল শপের তালিকা)।
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'superadmin')
  @ApiBearerAuth()
  @Get('users')
  @ApiOperation({ summary: 'List all shop users (Admin/SuperAdmin only) (Paginated)' })
  getAllUsers(@GetUser() user: any, @Query() query: PaginationQueryDto) {
    return this.authService.getAllUsers(user, query);
  }

  /**
   * 8. Create Manager Account (Shop Admin Only)
   * শপের জন্য ম্যানেজার তৈরি করা (ফ্রি টিয়ার শপে সর্বোচ্চ ১ জন ম্যানেজার তৈরির অনুমতি রয়েছে)।
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'superadmin')
  @ApiBearerAuth()
  @Post('users')
  @ApiOperation({ summary: 'Create a new manager account (Shop Admin only - Max 1 for Free Tier)' })
  createUser(@Body() createUserDto: CreateUserDto, @GetUser() user: any) {
    return this.authService.createUser(createUserDto, user);
  }

  /**
   * 9. Update Manager Permissions
   * নির্দিষ্ট ম্যানেজারের অনুমতি আপডেট করার এন্ডপয়েন্ট।
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'superadmin')
  @ApiBearerAuth()
  @Patch('users/:id/permissions')
  @ApiOperation({ summary: 'Update manager permissions (Admin only)' })
  updateUserPermissions(
    @Param('id') id: string,
    @Body() updatePermissionsDto: UpdatePermissionsDto,
    @GetUser() user: any,
  ) {
    return this.authService.updateUserPermissions(id, updatePermissionsDto.permissions, user);
  }

  /**
   * 10. Change Password Endpoint
   * ইউজার লগইন থাকা অবস্থায় পাসওয়ার্ড পরিবর্তন করা।
   */
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('users/change-password')
  @ApiOperation({ summary: 'Change current logged in user password' })
  changePassword(
    @GetUser('uid') uid: string,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    return this.authService.changePassword(uid, changePasswordDto);
  }

  /**
   * 11. Delete User Account Endpoint
   * ইউজার অ্যাকাউন্ট মুছে ফেলার এন্ডপয়েন্ট।
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'superadmin')
  @ApiBearerAuth()
  @Delete('users/:id')
  @ApiOperation({ summary: 'Delete user account (Admin only)' })
  deleteUser(@Param('id') id: string, @GetUser() user: any) {
    return this.authService.deleteUser(id, user);
  }
}
