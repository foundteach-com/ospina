import { Controller, Get, UseGuards } from '@nestjs/common';
import { ComercialService } from './comercial.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('comercial')
@UseGuards(JwtAuthGuard)
export class ComercialController {
  constructor(private readonly comercialService: ComercialService) {}

  @Get('dashboard')
  async getDashboard() {
    return this.comercialService.getDashboardData();
  }
}
