import { Controller, Get, Patch, Body, UseGuards, UnauthorizedException, Request } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  getSettings() {
    return this.settingsService.getSettings();
  }

  @UseGuards(JwtAuthGuard)
  @Patch()
  updateSettings(@Request() req: any, @Body() data: any) {
    if (req.user.role !== 'ADMIN') {
      throw new UnauthorizedException('Solo los administradores pueden cambiar la configuración de la empresa');
    }
    return this.settingsService.updateSettings(data);
  }
}
