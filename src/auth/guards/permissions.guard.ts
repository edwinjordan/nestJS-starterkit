import { Injectable, CanActivate, ExecutionContext, ForbiddenException, Logger } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';

@Injectable()
export class PermissionsGuard implements CanActivate {
  private readonly logger = new Logger(PermissionsGuard.name);

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
      this.logger.warn('No user found in request');
      throw new ForbiddenException('User not authenticated');
    }

    if (!user.permissions || !Array.isArray(user.permissions)) {
      this.logger.warn(`User ${user.email} has no permissions array. User object: ${JSON.stringify(user)}`);
      throw new ForbiddenException('User has no permissions');
    }

    const hasPermission = requiredPermissions.some((permission) => 
      user.permissions.includes(permission)
    );

    if (!hasPermission) {
      this.logger.warn(
        `User ${user.email} lacks required permissions. ` +
        `Required: [${requiredPermissions.join(', ')}], ` +
        `Has: [${user.permissions.join(', ')}]`
      );
      throw new ForbiddenException(
        `Missing required permissions: ${requiredPermissions.join(', ')}`
      );
    }

    this.logger.debug(`User ${user.email} authorized with permission: ${requiredPermissions.join(', ')}`);
    return true;
  }
}
