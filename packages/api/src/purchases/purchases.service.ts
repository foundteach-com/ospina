import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, Purchase, PurchaseItem } from '@prisma/client';

@Injectable()
export class PurchasesService {
  constructor(private prisma: PrismaService) {}

  async create(data: {
    providerId: string;
    referenceNumber: string;
    date: Date;
    notes?: string;
    invoiceUrl?: string;
    items: {
      productId: string;
      quantity: number;
      purchasePrice: number;
      reteFuentePercent?: number;
      reteIvaPercent?: number;
    }[];
  }): Promise<Purchase & { items: PurchaseItem[] }> {
    // Calculate net total from items (Gross - Retentions)
    const productIds = data.items.map((i) => i.productId);
    const products = await this.prisma.product.findMany({
      where: { id: { in: productIds } },
    });
    const productMap = new Map(products.map((p) => [p.id, p]));

    const total = data.items.reduce((sum, item) => {
      const product = productMap.get(item.productId);
      const ivaPerc = product?.purchaseIvaPercent
        ? Number(product.purchaseIvaPercent)
        : 19;

      const totalLine = item.quantity * item.purchasePrice;
      const baseLine = totalLine / (1 + ivaPerc / 100);
      const ivaLine = totalLine - baseLine;

      const rfValue = baseLine * ((item.reteFuentePercent || 0) / 100);
      const riValue = ivaLine * ((item.reteIvaPercent || 0) / 100);

      return sum + (totalLine - rfValue - riValue);
    }, 0);

    // Create purchase with items in a transaction
    return this.prisma.purchase.create({
      data: {
        providerId: data.providerId,
        referenceNumber: data.referenceNumber,
        date: data.date,
        notes: data.notes,
        invoiceUrl: data.invoiceUrl,
        total,
        items: {
          create: data.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            purchasePrice: item.purchasePrice,
            reteFuentePercent: item.reteFuentePercent || 0,
            reteIvaPercent: item.reteIvaPercent || 0,
          })),
        },
      },
      include: {
        provider: true,
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
    where?: Prisma.PurchaseWhereInput;
    orderBy?: Prisma.PurchaseOrderByWithRelationInput;
  }): Promise<Purchase[]> {
    const { skip, take, where, orderBy } = params || {};
    return this.prisma.purchase.findMany({
      skip,
      take,
      where,
      orderBy: orderBy || { date: 'desc' },
      include: {
        provider: true,
        items: {
          include: {
            product: true,
          },
        },
      },
    });
  }

  async findOne(id: string): Promise<Purchase | null> {
    return this.prisma.purchase.findUnique({
      where: { id },
      include: {
        provider: true,
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
      providerId?: string;
      referenceNumber?: string;
      date?: Date;
      notes?: string;
      invoiceUrl?: string;
      items?: {
        productId: string;
        quantity: number;
        purchasePrice: number;
        reteFuentePercent?: number;
        reteIvaPercent?: number;
      }[];
    }
  ): Promise<Purchase> {
    // If items are updated, recalculate net total
    let total: number | undefined;
    if (data.items) {
      const productIds = data.items.map((i) => i.productId);
      const products = await this.prisma.product.findMany({
        where: { id: { in: productIds } },
      });
      const productMap = new Map(products.map((p) => [p.id, p]));

      total = data.items.reduce((sum, item) => {
        const product = productMap.get(item.productId);
        const ivaPerc = product?.purchaseIvaPercent
          ? Number(product.purchaseIvaPercent)
          : 19;

        const totalLine = item.quantity * item.purchasePrice;
        const baseLine = totalLine / (1 + ivaPerc / 100);
        const ivaLine = totalLine - baseLine;

        const rfValue = baseLine * ((item.reteFuentePercent || 0) / 100);
        const riValue = ivaLine * ((item.reteIvaPercent || 0) / 100);

        return sum + (totalLine - rfValue - riValue);
      }, 0);
    }

    // Update purchase
    return this.prisma.purchase.update({
      where: { id },
      data: {
        providerId: data.providerId,
        referenceNumber: data.referenceNumber,
        date: data.date,
        notes: data.notes,
        invoiceUrl: data.invoiceUrl,
        ...(total !== undefined && { total }),
        ...(data.items && {
          items: {
            deleteMany: {},
            create: data.items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              purchasePrice: item.purchasePrice,
              reteFuentePercent: item.reteFuentePercent || 0,
              reteIvaPercent: item.reteIvaPercent || 0,
            })),
          },
        }),
      },
      include: {
        provider: true,
        items: {
          include: {
            product: true,
          },
        },
      },
    });
  }

  async remove(id: string): Promise<Purchase> {
    return this.prisma.purchase.delete({
      where: { id },
    });
  }
}
