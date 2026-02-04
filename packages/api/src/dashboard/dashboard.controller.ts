import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('dashboard')
@UseGuards(JwtAuthGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('stats')
  getStats() {
    return this.dashboardService.getStats();
  }

  @Get('sales-trend')
  getSalesTrend(@Query('days') days?: string) {
    const daysNum = days ? parseInt(days, 10) : 30;
    return this.dashboardService.getSalesTrend(daysNum);
  }

  @Get('top-products')
  getTopProducts(@Query('limit') limit?: string) {
    const limitNum = limit ? parseInt(limit, 10) : 5;
    return this.dashboardService.getTopProducts(limitNum);
  }

  @Get('top-clients')
  getTopClients(@Query('limit') limit?: string) {
    const limitNum = limit ? parseInt(limit, 10) : 5;
    return this.dashboardService.getTopClients(limitNum);
  }

  @Get('revenue-by-category')
  getRevenueByCategory() {
    return this.dashboardService.getRevenueByCategory();
  }

  @Get('inventory-status')
  getInventoryStatus() {
    return this.dashboardService.getInventoryStatus();
  }

  @Get('cash-flow-trend')
  getCashFlowTrend(@Query('months') months?: string) {
    const monthsNum = months ? parseInt(months, 10) : 6;
    return this.dashboardService.getCashFlowTrend(monthsNum);
  }
}
