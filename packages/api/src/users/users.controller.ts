import { Controller, Get, Patch, Delete, Param, Body, UseGuards, Request } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UserRole } from '@prisma/client';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('profile')
  getProfile(@Request() req: { user: { userId: string } }) {
    return this.usersService.findById(req.user.userId);
  }

  @Patch('profile')
  updateProfile(
    @Request() req: { user: { userId: string } },
    @Body() data: { name?: string; email?: string; avatarUrl?: string; password?: string }
  ) {
    // Basic protection: users can only update their own profile here
    // Admins can still use the /users/:id route for others
    return this.usersService.update(req.user.userId, data);
  }

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findById(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() data: { name?: string; email?: string; role?: UserRole; password?: string; avatarUrl?: string; isActive?: boolean; accessRoleId?: string; moduleAccess?: any; permissions?: any; }
  ) {
    return this.usersService.update(id, data);
  }

  @Patch(':id/toggle-status')
  toggleStatus(@Param('id') id: string) {
    return this.usersService.toggleStatus(id);
  }

  @Patch(':id/reset-password')
  resetPassword(@Param('id') id: string, @Body() data: { password?: string }) {
    return this.usersService.resetPassword(id, data.password);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
