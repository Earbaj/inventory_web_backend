import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredPermissions) {
      return true;
    }
    const { user } = context.switchToHttp().getRequest();
    if (!user) {
      throw new ForbiddenException('User authentication required');
    }
    // Admins have all permissions automatically
    if (user.role === 'admin') {
      return true;
    }
    const userPermissions = user.permissions || {};
    for (const perm of requiredPermissions) {
      if (!userPermissions[perm]) {
        throw new ForbiddenException(`Permission '${perm}' is required for this action`);
      }
    }
    return true;
  }
}
