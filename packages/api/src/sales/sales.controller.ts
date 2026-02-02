import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { SalesService } from './sales.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('sales')
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(
    @Body()
    data: {
      clientId: string;
      referenceNumber?: string;
      date: string;
      notes?: string;
      items: {
        productId: string;
        quantity: number;
        salePrice: number;
      }[];
    }
  ) {
    return this.salesService.create({
      ...data,
      date: new Date(data.date),
    });
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(@Query() query: any) {
    return this.salesService.findAll({
      where: query.clientId ? { clientId: query.clientId } : undefined,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.salesService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body()
    data: {
      status?: string;
      notes?: string;
    }
  ) {
    return this.salesService.update(id, data);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.salesService.remove(id);
  }
}
