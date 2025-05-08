import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Role, User } from '@prisma/client';
import { Observable } from 'rxjs';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(
    private roles: Role[]
  ) { }
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const user = request['user'] as User

    if (!user) {
      return false
    }

    return this.checkRole(user.role);
  }

  async checkRole(role: Role) {
    return this.roles.includes(role)
  }
}

