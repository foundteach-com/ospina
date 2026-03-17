import { Controller, Get, Post, Body, Param, Patch } from '@nestjs/common';
import { ContactService } from './contact.service';

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

  @Get()
  findAll() {
    return this.contactService.getNotifications();
  }

  @Patch(':id/read')
  markAsRead(@Param('id') id: string) {
    return this.contactService.markAsRead(id);
  }
}
