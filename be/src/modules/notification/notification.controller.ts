import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { IJwtPayload } from 'src/common/interfaces/IJwtPayload';

@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @UseGuards(JwtGuard)
  @Get()
  async getNotifications(
    @Req() req: any,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    const { id } = req.user as IJwtPayload;
    const result = await this.notificationService.getNotifications(
      id,
      Number(page) || 1,
      Number(limit) || 20,
    );

    return {
      message: 'Notifications retrieved successfully',
      data: result,
    };
  }
}
