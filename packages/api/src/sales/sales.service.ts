import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, Sale, SaleItem } from '@prisma/client';

@Injectable()
export class SalesService {
  constructor(private prisma: PrismaService) {}

  async create(data: {
    clientId: string;
    referenceNumber?: string;
    date: Date;
    notes?: string;
    items: {
      productId: string;
      quantity: number;
      salePrice: number;
    }[];
  }): Promise<Sale & { items: SaleItem[] }> {
    // Validate stock availability for each item
    for (const item of data.items) {
      const stock = await this.getProductStock(item.productId);
      if (stock < item.quantity) {
        const product = await this.prisma.product.findUnique({
          where: { id: item.productId },
        });
        throw new BadRequestException(
          `Stock insuficiente para ${product?.name}. Disponible: ${stock}, Solicitado: ${item.quantity}`
        );
      }
    }

    // Calculate total from items
    const total = data.items.reduce(
      (sum, item) => sum + item.quantity * item.salePrice,
      0
    );

    // Create sale with items in a transaction
    return this.prisma.sale.create({
      data: {
        clientId: data.clientId,
        referenceNumber: data.referenceNumber,
        date: data.date,
        notes: data.notes,
        total,
        items: {
          create: data.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            salePrice: item.salePrice,
          })),
        },
      },
      include: {
        client: true,
        items: {
          include: {
            product: true,
          },
        },
      },
    });
  }

  async findAll(params?: {
    skip?: number;
    take?: number;
    where?: Prisma.SaleWhereInput;
    orderBy?: Prisma.SaleOrderByWithRelationInput;
  }): Promise<Sale[]> {
    const { skip, take, where, orderBy } = params || {};
    return this.prisma.sale.findMany({
      skip,
      take,
      where,
      orderBy: orderBy || { date: 'desc' },
      include: {
        client: true,
        items: {
          include: {
            product: true,
          },
        },
      },
    });
  }

  async findOne(id: string): Promise<Sale | null> {
    return this.prisma.sale.findUnique({
      where: { id },
      include: {
        client: true,
        items: {
          include: {
            product: true,
          },
        },
      },
    });
  }

  async update(
    id: string,
    data: {
      clientId?: string;
      referenceNumber?: string;
      date?: Date;
      notes?: string;
      status?: string;
      items?: {
        productId: string;
        quantity: number;
        salePrice: number;
      }[];
    }
  ): Promise<Sale> {
    const total = data.items
      ? data.items.reduce((sum, item) => sum + item.quantity * item.salePrice, 0)
      : undefined;

    return this.prisma.sale.update({
      where: { id },
      data: {
        clientId: data.clientId,
        referenceNumber: data.referenceNumber,
        date: data.date,
        status: data.status as any,
        notes: data.notes,
        total,
        ...(data.items && {
          items: {
            deleteMany: {},
            create: data.items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              salePrice: item.salePrice,
            })),
          },
        }),
      },
      include: {
        client: true,
        items: {
          include: {
            product: true,
          },
        },
      },
    });
  }

  async remove(id: string): Promise<Sale> {
    return this.prisma.sale.delete({
      where: { id },
    });
  }

  // Helper method to calculate current stock for a product
  private async getProductStock(productId: string): Promise<number> {
    // Get total purchased
    const purchases = await this.prisma.purchaseItem.aggregate({
      where: { productId },
      _sum: { quantity: true },
    });

    // Get total sold
    const sales = await this.prisma.saleItem.aggregate({
      where: { productId },
      _sum: { quantity: true },
    });

    const totalPurchased = purchases._sum.quantity || 0;
    const totalSold = sales._sum.quantity || 0;

    return Number(totalPurchased) - Number(totalSold);
  }
}
