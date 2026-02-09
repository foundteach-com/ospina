
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { InternalMovementType } from '@prisma/client';

@Injectable()
export class InternalMovementsService {
  constructor(private prisma: PrismaService) {}

  async create(data: {
    date: string | Date;
    type: InternalMovementType;
    description?: string;
    items: { productId: string; quantity: number }[];
  }) {
    // Calculate total cost based on current product purchasePrice
    let total = 0;
    const itemsWithPrice = await Promise.all(
      data.items.map(async (item) => {
        const product = await this.prisma.product.findUnique({
          where: { id: item.productId },
        });
        const unitPrice = product ? Number(product.purchasePrice) : 0;
        total += unitPrice * item.quantity;
        return {
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: unitPrice,
        };
      })
    );

    return this.prisma.internalMovement.create({
      data: {
        date: new Date(data.date),
        type: data.type,
        description: data.description,
        total,
        items: {
          create: itemsWithPrice,
        },
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });
  }

  async findAll() {
    return this.prisma.internalMovement.findMany({
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: {
        date: 'desc',
      },
    });
  }

  /* 
  async update(id: string, data: any) {
    // Implementation for update if needed. 
    // Updating movements with inventory effects is complex, so let's stick to create/delete for now or simple updates.
    return this.prisma.internalMovement.update({
        where: { id },
        data: {
            description: data.description,
            // Simple fields update
        }
    })
  }
  */

  async remove(id: string) {
    return this.prisma.internalMovement.delete({
      where: { id },
    });
  }
}
