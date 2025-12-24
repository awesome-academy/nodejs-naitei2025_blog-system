import { Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { IJwtPayload } from 'src/common/interfaces/IJwtPayload';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { Serialize } from 'src/common/decorators/serialize.decorator';
import { UserListItemDto } from './dto/user-response.dto';

@Controller('profiles')
export class ProfileController {
  constructor(private readonly userService: UserService) {}

  @Get(':username')
  @Serialize(UserListItemDto)
  async getProfile(@Param('username') username: string, @Req() req) {
    let id = req.user?.id || undefined;
    const user = await this.userService.getProfile(username, id);
    return {
      message: 'Profile fetched successfully',
      data: user,
    };
  }

  @UseGuards(JwtGuard)
  @Post(':username/follow')
  async followUser(@Param('username') username: string, @Req() req) {
    const { id } = req.user as IJwtPayload;
    const user = await this.userService.follow(id, username);
    return {
      message: 'User followed successfully',
      data: user,
    };
  }

  @UseGuards(JwtGuard)
  @Post(':username/unfollow')
  async unfollowUser(@Param('username') username: string, @Req() req) {
    const { id } = req.user as IJwtPayload;
    const user = await this.userService.unfollowUser(id, username);
    return {
      message: 'User unfollowed successfully',
      data: user,
    };
  }
}
