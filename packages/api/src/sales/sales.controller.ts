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
      purchaseOrder?: string;
      date: string;
      notes?: string;
      documentUrl?: string;
      status?: string;
      paymentStatus?: string;
      paymentType?: string;
      paymentDays?: number;
      paymentDate?: string;
      paymentMethod?: string;
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
      paymentDate: data.paymentDate ? new Date(data.paymentDate) : undefined,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(@Query() query: any) {
    const where: any = {};
    if (query.clientId) where.clientId = query.clientId;
    if (query.year) {
      const targetYear = parseInt(query.year, 10);
      where.date = {
        gte: new Date(targetYear, 0, 1),
        lte: new Date(targetYear, 11, 31, 23, 59, 59, 999),
      };
    }
    
    return this.salesService.findAll({ where });
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
      clientId?: string;
      referenceNumber?: string;
      purchaseOrder?: string;
      date?: string;
      notes?: string;
      documentUrl?: string;
      status?: string;
      paymentStatus?: string;
      paymentType?: string;
      paymentDays?: number;
      paymentDate?: string;
      paymentMethod?: string;
      items?: {
        productId: string;
        quantity: number;
        salePrice: number;
      }[];
    }
  ) {
    return this.salesService.update(id, {
      ...data,
      date: data.date ? new Date(data.date) : undefined,
      paymentDate: data.paymentDate ? new Date(data.paymentDate) : undefined,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.salesService.remove(id);
  }
}
