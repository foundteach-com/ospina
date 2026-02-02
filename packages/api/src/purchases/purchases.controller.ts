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
      items: {
        productId: string;
        quantity: number;
        purchasePrice: number;
      }[];
    }
  ) {
    return this.purchasesService.create({
      ...data,
      date: new Date(data.date),
    });
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(@Query() query: any) {
    return this.purchasesService.findAll({
      where: query.providerId ? { providerId: query.providerId } : undefined,
    });
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
      items?: {
        productId: string;
        quantity: number;
        purchasePrice: number;
      }[];
    }
  ) {
    return this.purchasesService.update(id, {
      ...data,
      date: data.date ? new Date(data.date) : undefined,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.purchasesService.remove(id);
  }
}
