import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { ACCESS_TOKEN_COOKIE } from './auth.constants';
import { Request } from 'express';

@Injectable()
export class PageAuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const token = request.cookies?.[ACCESS_TOKEN_COOKIE] as string | undefined;

    if (!token) {
      throw new UnauthorizedException();
    }

    try {
      const payload = this.authService.verifyToken(token);
      (request as Request & { user: { sub: string; email: string } }).user = {
        sub: payload.sub,
        email: payload.email,
      };
      return true;
    } catch {
      throw new UnauthorizedException();
    }
  }
}
