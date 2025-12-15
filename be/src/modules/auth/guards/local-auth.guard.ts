import { BadRequestException, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {
  handleRequest(err: any, user: any, info: any) {
    if (err) {
      throw new BadRequestException('Login failed', {
        description:
          err.response?.error || ('An error occurred during login' as string),
      });
    }

    return user;
  }
}
