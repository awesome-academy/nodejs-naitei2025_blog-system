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
  ParseEnumPipe,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { IJwtPayload } from 'src/common/interfaces/IJwtPayload';
import { Serialize } from 'src/common/decorators/serialize.decorator';
import { UserDetailDto, UserListItemDto } from './dto/user-response.dto';

enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
}

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post(':role')
  async create(
    @Param('role', new ParseEnumPipe(UserRole)) role: UserRole,
    @Body() createUserDto: CreateUserDto,
  ) {
    const roleUpper = role.toUpperCase() as 'USER' | 'ADMIN';
    createUserDto.role = roleUpper;
    return await this.userService.create(createUserDto);
  }

  @UseGuards(JwtGuard)
  @Serialize(UserListItemDto)
  @Get()
  async getCurrentUser(@Req() req: any) {
    const { id } = req.user as IJwtPayload;
    const user = await this.userService.findById(id);
    return {
      message: 'Get current user successfully',
      data: user,
    };
  }

  @UseGuards(JwtGuard)
  @Put()
  @Serialize(UserDetailDto)
  async update(@Req() req: any, @Body() updateUserDto: UpdateUserDto) {
    const { id } = req.user as IJwtPayload;
    const user = await this.userService.update(id, updateUserDto);
    return {
      message: 'User updated successfully',
      data: user,
    };
  }

  @UseGuards(JwtGuard)
  @Serialize(UserListItemDto)
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
