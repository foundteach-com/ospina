import { Controller, Get, Post, Body, Param, Patch, UseGuards } from '@nestjs/common';
import { ContactService } from './contact.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('contact')
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  @Post()
  create(@Body() data: { nombre: string; empresa?: string; email: string; telefono: string; mensaje: string }) {
    if (!data.nombre || !data.email || !data.telefono || !data.mensaje) {
      throw new Error('Faltan campos obligatorios');
    }
    return this.contactService.createNotification(data);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll() {
    return this.contactService.getNotifications();
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/read')
  markAsRead(@Param('id') id: string) {
    return this.contactService.markAsRead(id);
  }
}
