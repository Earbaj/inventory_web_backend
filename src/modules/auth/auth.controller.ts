import { Controller, Post, Body, Get, UseGuards, Param, Patch, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto, CreateUserDto, UpdatePermissionsDto, ChangePasswordDto } from './dto/auth.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { GetUser } from '../../common/decorators/get-user.decorator';

@ApiTags('Authentication & Users')
@Controller('api')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('auth/login')
  @ApiOperation({ summary: 'Login user and get JWT token' })
  @ApiResponse({ status: 200, description: 'User authenticated successfully' })
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('auth/register')
  @ApiOperation({ summary: 'Register a new user account' })
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
  @Roles('admin')
  @ApiBearerAuth()
  @Get('users')
  @ApiOperation({ summary: 'List all system users (Admin only)' })
  getAllUsers() {
    return this.authService.getAllUsers();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @Post('users')
  @ApiOperation({ summary: 'Create a new manager or admin user (Admin only)' })
  createUser(@Body() createUserDto: CreateUserDto) {
    return this.authService.createUser(createUserDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @Patch('users/:id/permissions')
  @ApiOperation({ summary: 'Update manager permissions (Admin only)' })
  updateUserPermissions(
    @Param('id') id: string,
    @Body() updatePermissionsDto: UpdatePermissionsDto,
  ) {
    return this.authService.updateUserPermissions(id, updatePermissionsDto.permissions);
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
  @Roles('admin')
  @ApiBearerAuth()
  @Delete('users/:id')
  @ApiOperation({ summary: 'Delete user account (Admin only)' })
  deleteUser(@Param('id') id: string) {
    return this.authService.deleteUser(id);
  }
}
