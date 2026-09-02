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
import { PurchasesService } from './purchases.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('purchases')
export class PurchasesController {
  constructor(private readonly purchasesService: PurchasesService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(
    @Body()
    data: {
      providerId: string;
      referenceNumber: string;
      date: string;
      notes?: string;
      invoiceUrl?: string;
      status?: string;
      paymentType?: string;
      paymentDays?: number;
      paymentDate?: string;
      paymentMethod?: string;
      items: {
        productId: string;
        quantity: number;
        purchasePrice: number;
        discountPercent?: number; // Added field
        reteFuentePercent?: number; // Added field
        reteIvaPercent?: number; // Added field
      }[];
    }
  ) {
    return this.purchasesService.create({
      ...data,
      date: new Date(data.date),
      paymentType: data.paymentType as any,
      paymentDate: data.paymentDate ? new Date(data.paymentDate) : undefined,
      paymentMethod: data.paymentMethod as any,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(@Query() query: any) {
    const where: any = {};
    if (query.providerId) where.providerId = query.providerId;
    if (query.year) {
      const targetYear = parseInt(query.year, 10);
      where.date = {
        gte: new Date(Date.UTC(targetYear, 0, 1, 0, 0, 0, 0)),
        lte: new Date(Date.UTC(targetYear, 11, 31, 23, 59, 59, 999)),
      };
    }
    
    return this.purchasesService.findAll({ where });
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.purchasesService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body()
    data: {
      providerId?: string;
      referenceNumber?: string;
      date?: string;
      notes?: string;
      invoiceUrl?: string;
      status?: string;
      paymentType?: string;
      paymentDays?: number;
      paymentDate?: string;
      paymentMethod?: string;
      items?: {
        productId: string;
        quantity: number;
        purchasePrice: number;
        discountPercent?: number; // Added field
        reteFuentePercent?: number; // Added field
        reteIvaPercent?: number; // Added field
      }[];
    }
  ) {
    return this.purchasesService.update(id, {
      ...data,
      date: data.date ? new Date(data.date) : undefined,
      paymentType: data.paymentType as any,
      paymentDate: data.paymentDate ? new Date(data.paymentDate) : undefined,
      paymentMethod: data.paymentMethod as any,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.purchasesService.remove(id);
  }
}
