import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UserDocument } from '../schemas/user.schema';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  matchRoles(roles: string[], userRole: string): boolean {
    console.log('roles', roles);
    console.log('userRole', userRole);

    console.log(
      'roles.some((role) => role === userRole)',
      roles.some((role) => role === userRole),
    );
    return roles.some((role) => role === userRole);
  }

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.get<string[]>('roles', context.getHandler());

    console.log('roles', roles);

    if (!roles) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    console.log(request.user);
    const user = request.user as UserDocument;

    // If AuthGuard hasn't run or user is missing, throw 401
    if (!user) {
      throw new UnauthorizedException(
        'Authentication required before role check',
      );
    }

    // Check role
    if (!this.matchRoles(roles, user.role)) {
      throw new ForbiddenException('Insufficient role');
    }

    return true;
  }
}
