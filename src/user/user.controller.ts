import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UserService } from './user.service';

@Controller('profile')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async getProfile(@Req() req: any) {
    const user = await this.userService.findById(req.user.id);
    if (!user) {
      return null;
    }
    const { password, ...result } = user;
    return result;
  }
}
