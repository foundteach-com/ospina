import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ContactService {
  constructor(private prisma: PrismaService) {}

  async createNotification(data: {
    nombre: string;
    empresa?: string;
    email: string;
    telefono: string;
    mensaje: string;
  }) {
    return this.prisma.contactNotification.create({
      data,
    });
  }

  async getNotifications() {
    return this.prisma.contactNotification.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async markAsRead(id: string) {
    return this.prisma.contactNotification.update({
      where: { id },
      data: { isRead: true },
    });
  }
}
