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
import { CotizacionesService } from './cotizaciones.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('cotizaciones')
export class CotizacionesController {
  constructor(private readonly cotizacionesService: CotizacionesService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(
    @Body()
    data: {
      clienteNombre: string;
      clienteEmail?: string;
      clienteTelefono?: string;
      fecha: string;
      validezDias?: number;
      notas?: string;
      items: {
        productId: string;
        quantity: number;
        unitPrice: number;
      }[];
    }
  ) {
    return this.cotizacionesService.create({
      ...data,
      fecha: new Date(data.fecha),
    });
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(@Query() query: any) {
    return this.cotizacionesService.findAll({
      where: query.estado ? { estado: query.estado } : undefined,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Get('summary')
  getSummary() {
    return this.cotizacionesService.getSummary();
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.cotizacionesService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body()
    data: {
      clienteNombre?: string;
      clienteEmail?: string;
      clienteTelefono?: string;
      fecha?: string;
      validezDias?: number;
      estado?: string;
      notas?: string;
      items?: {
        productId: string;
        quantity: number;
        unitPrice: number;
      }[];
    }
  ) {
    return this.cotizacionesService.update(id, {
      ...data,
      fecha: data.fecha ? new Date(data.fecha) : undefined,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.cotizacionesService.remove(id);
  }
}
