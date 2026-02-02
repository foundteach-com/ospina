import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  getInventory(
    @Query('categoryId') categoryId?: string,
    @Query('lowStock') lowStock?: string,
    @Query('search') search?: string
  ) {
    return this.inventoryService.getInventory({
      categoryId,
      lowStock: lowStock === 'true',
      search,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Get('low-stock')
  getLowStockProducts(@Query('threshold') threshold?: string) {
    return this.inventoryService.getLowStockProducts(
      threshold ? parseInt(threshold) : 10
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get(':productId')
  getProductStock(@Param('productId') productId: string) {
    return this.inventoryService.getProductStock(productId);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':productId/movements')
  getProductMovements(@Param('productId') productId: string) {
    return this.inventoryService.getProductMovements(productId);
  }
}
