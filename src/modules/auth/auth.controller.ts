import { Controller, Post, Body, Get, UseGuards, Param, Patch, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto, CreateUserDto, UpdatePermissionsDto, ChangePasswordDto, SetupSuperAdminDto, ForgotPasswordDto, ResetPasswordDto } from './dto/auth.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { GetUser } from '../../common/decorators/get-user.decorator';

@ApiTags('Authentication & Users')
@Controller('api')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('auth/setup-superadmin')
  @ApiOperation({ summary: 'One-time initial SuperAdmin creation (Allowed only if 0 SuperAdmins exist)' })
  @ApiResponse({ status: 201, description: 'SuperAdmin created successfully' })
  @ApiResponse({ status: 403, description: 'SuperAdmin already exists' })
  setupSuperAdmin(@Body() setupDto: SetupSuperAdminDto) {
    return this.authService.setupSuperAdmin(setupDto);
  }

  @Post('auth/forgot-password')
  @ApiOperation({ summary: 'Request password recovery OTP code sent to user email' })
  forgotPassword(@Body() forgotDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotDto);
  }

  @Post('auth/reset-password')
  @ApiOperation({ summary: 'Reset password using OTP reset code' })
  resetPassword(@Body() resetDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetDto);
  }

  @Post('auth/login')
  @ApiOperation({ summary: 'Login user and get JWT token' })
  @ApiResponse({ status: 200, description: 'User authenticated successfully' })
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('auth/register')
  @ApiOperation({ summary: 'Register a new Shop Owner (Admin) account' })
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('auth/me')
  @ApiOperation({ summary: 'Get profile of current logged in user' })
  getProfile(@GetUser() user: any) {
    return user;
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'superadmin')
  @ApiBearerAuth()
  @Get('users')
  @ApiOperation({ summary: 'List all shop users (Admin/SuperAdmin only)' })
  getAllUsers(@GetUser() user: any) {
    return this.authService.getAllUsers(user);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'superadmin')
  @ApiBearerAuth()
  @Post('users')
  @ApiOperation({ summary: 'Create a new manager account (Shop Admin only - Max 1 for Free Tier)' })
  createUser(@Body() createUserDto: CreateUserDto, @GetUser() user: any) {
    return this.authService.createUser(createUserDto, user);
  }

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

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'superadmin')
  @ApiBearerAuth()
  @Delete('users/:id')
  @ApiOperation({ summary: 'Delete user account (Admin only)' })
  deleteUser(@Param('id') id: string, @GetUser() user: any) {
    return this.authService.deleteUser(id, user);
  }
}
