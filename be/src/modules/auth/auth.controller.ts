import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  BadRequestException,
  Req,
  UseGuards,
  SerializeOptions,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { Throttle } from '@nestjs/throttler';
import { LogInDto } from './dto/login.dto';
import { UserEntity } from '../user/entities/user.entity';

@Controller('users')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Throttle({ login: {} })
  @UseGuards(LocalAuthGuard)
  @SerializeOptions({ type: UserEntity })
  @Post('login')
  async signIn(@Body() logInDto: LogInDto, @Req() req: any) {
    const user = await this.authService.signIn(req.user);
    return {
      message: 'Login successfully',
      data: user,
    };
  }
}