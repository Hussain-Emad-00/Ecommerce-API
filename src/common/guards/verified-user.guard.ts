import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

@Injectable()
export class VerifiedUserGuard implements CanActivate {
  constructor() {}

  canActivate(context: ExecutionContext): boolean {
    return true; //context.switchToHttp().getRequest()?.user;
  }
}
