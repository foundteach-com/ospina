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

  @Get('purchases-by-month')
  getPurchasesByMonth(@Query('year') year?: string) {
    const yearNum = year ? parseInt(year, 10) : undefined;
    return this.dashboardService.getPurchasesByMonth(yearNum);
  }

  @Get('sales-by-month')
  getSalesByMonth(@Query('year') year?: string) {
    const yearNum = year ? parseInt(year, 10) : undefined;
    return this.dashboardService.getSalesByMonth(yearNum);
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

  @Get('top-products')
  getTopSellingProducts(@Query('limit') limit?: string) {
    const limitNum = limit ? parseInt(limit, 10) : 5;
    return this.dashboardService.getTopSellingProducts(limitNum);
  }

  @Get('top-clients')
  getTopClients(@Query('limit') limit?: string) {
    const limitNum = limit ? parseInt(limit, 10) : 5;
    return this.dashboardService.getTopClients(limitNum);
  }
}
