import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  Put,
  UseInterceptors,
  ClassSerializerInterceptor,
  Query,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { IJwtPayload } from 'src/common/interfaces/IJwtPayload';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    return await this.userService.create(createUserDto);
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @UseGuards(JwtGuard)
  @Get()
  async getCurrentUser(@Req() req: any) {
    const { id } = req.user as IJwtPayload;
    const user = await this.userService.findByIdWithArticleCount(id);
    return {
      message: 'Get current user successfully',
      data: user,
    };
  }

  @UseGuards(JwtGuard)
  @Patch()
  async update(@Req() req: any, @Body() updateUserDto: UpdateUserDto) {
    const { id } = req.user as IJwtPayload;
    const user = await this.userService.update(id, updateUserDto);
    return {
      message: 'User updated successfully',
      data: user,
    };
  }

  @UseGuards(JwtGuard)
  @Get('all')
  async getAllUsers(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('username') username?: string,
    @Query('email') email?: string,
  ) {
    const result = await this.userService.listUsers({
      page: Number(page),
      limit: Number(limit),
      username,
      email,
    });

    return {
      message: 'List users successfully',
      data: result,
    };
  }

  @UseGuards(JwtGuard)
  @Get('count')
  async countUsers() {
    const { total } = await this.userService.countUsers();
    return {
      message: 'Count users successfully',
      data: { total },
    };
  }
}
