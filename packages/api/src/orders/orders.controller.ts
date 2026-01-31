import { Controller, Get, Post, Body, Patch, Param, UseGuards, Request } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  create(@Request() req: any, @Body() body: any) {
    return this.ordersService.create(req.user.sub, body);
  }

  @Get()
  findAll(@Request() req: any) {
    // If admin, show all? Or just users own?
    // Simplified: Just user's own orders for now. 
    // Admin dashboard endpoint might be separate or check role here.
    if (req.user.role === 'ADMIN') {
        return this.ordersService.findAllAdmin();
    }
    return this.ordersService.findAll(req.user.sub);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ordersService.findOne(id);
  }

  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body('status') status: any) {
    return this.ordersService.updateStatus(id, status);
  }
}
