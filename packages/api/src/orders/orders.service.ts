import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, Order } from '@prisma/client';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, data: any): Promise<Order> {
    const { items, ...orderData } = data;
    
    // Calculate total from items if not provided or just trust backend calculation
    // Ideally we fetch product prices and calculate total here.
    // For simplicity, assuming validation happens before or taking simplified approach
    
    return this.prisma.order.create({
      data: {
        userId,
        status: 'PENDING',
        total: orderData.total || 0, // Should be calculated
        items: {
          create: items.map((item: any) => ({
             product: { connect: { id: item.productId } },
             quantity: item.quantity,
             price: item.price
          }))
        }
      },
      include: { items: { include: { product: true } } }
    });
  }

  async findAll(userId: string): Promise<Order[]> {
    return this.prisma.order.findMany({
      where: { userId },
      include: { items: { include: { product: true } } },
      orderBy: { createdAt: 'desc' }
    });
  }

  async findAllAdmin(): Promise<Order[]> {
    return this.prisma.order.findMany({
      include: { user: true, items: { include: { product: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }
  
  async findOne(id: string): Promise<Order | null> {
    return this.prisma.order.findUnique({
      where: { id },
      include: { items: { include: { product: true } }, user: true },
    });
  }

  async updateStatus(id: string, status: any): Promise<Order> {
    return this.prisma.order.update({
      where: { id },
      data: { status },
    });
  }
}
