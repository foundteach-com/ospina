import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, Cotizacion, CotizacionItem } from '@prisma/client';

@Injectable()
export class CotizacionesService {
  constructor(private prisma: PrismaService) {}

  private async generateNumero(): Promise<string> {
    const lastCotizacion = await this.prisma.cotizacion.findFirst({
      orderBy: { createdAt: 'desc' },
      select: { numero: true },
    });

    if (!lastCotizacion) {
      return 'COT-0001';
    }

    const lastNumber = parseInt(lastCotizacion.numero.replace('COT-', ''), 10);
    const nextNumber = lastNumber + 1;
    return `COT-${nextNumber.toString().padStart(4, '0')}`;
  }

  async create(data: {
    clienteNombre: string;
    clienteEmail?: string;
    clienteTelefono?: string;
    fecha: Date;
    validezDias?: number;
    notas?: string;
    items: {
      productId: string;
      quantity: number;
      unitPrice: number;
    }[];
  }): Promise<Cotizacion & { items: CotizacionItem[] }> {
    const numero = await this.generateNumero();

    // Calculate total from items
    const total = data.items.reduce(
      (sum, item) => sum + item.quantity * item.unitPrice,
      0
    );

    return this.prisma.cotizacion.create({
      data: {
        numero,
        clienteNombre: data.clienteNombre,
        clienteEmail: data.clienteEmail,
        clienteTelefono: data.clienteTelefono,
        fecha: data.fecha,
        validezDias: data.validezDias || 30,
        notas: data.notas,
        total,
        items: {
          create: data.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
          })),
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

  // Method for public quotation requests (from store, no auth required)
  async createPublic(data: {
    clienteNombre: string;
    clienteEmail?: string;
    clienteTelefono?: string;
    empresa?: string;
    fecha: Date;
    notas?: string;
    items: {
      productId: string;
      quantity: number;
    }[];
  }): Promise<Cotizacion & { items: CotizacionItem[] }> {
    const numero = await this.generateNumero();

    // Fetch actual product prices from database
    const productIds = data.items.map(item => item.productId);
    const products = await this.prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, basePrice: true },
    });

    const priceMap = new Map(products.map(p => [p.id, Number(p.basePrice)]));

    // Build items with prices and calculate total
    const itemsWithPrices = data.items.map(item => ({
      productId: item.productId,
      quantity: item.quantity,
      unitPrice: priceMap.get(item.productId) || 0,
    }));

    const total = itemsWithPrices.reduce(
      (sum, item) => sum + item.quantity * item.unitPrice,
      0
    );

    // Build notes including empresa if provided
    const notas = data.empresa 
      ? `Empresa: ${data.empresa}\n${data.notas || ''}`
      : data.notas;

    return this.prisma.cotizacion.create({
      data: {
        numero,
        clienteNombre: data.clienteNombre,
        clienteEmail: data.clienteEmail,
        clienteTelefono: data.clienteTelefono,
        fecha: data.fecha,
        validezDias: 30,
        notas,
        total,
        items: {
          create: itemsWithPrices,
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

  async findAll(params?: {
    skip?: number;
    take?: number;
    where?: Prisma.CotizacionWhereInput;
    orderBy?: Prisma.CotizacionOrderByWithRelationInput;
  }): Promise<Cotizacion[]> {
    const { skip, take, where, orderBy } = params || {};
    return this.prisma.cotizacion.findMany({
      skip,
      take,
      where,
      orderBy: orderBy || { fecha: 'desc' },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });
  }

  async findOne(id: string): Promise<Cotizacion | null> {
    return this.prisma.cotizacion.findUnique({
      where: { id },
      include: {
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
      clienteNombre?: string;
      clienteEmail?: string;
      clienteTelefono?: string;
      fecha?: Date;
      validezDias?: number;
      estado?: string;
      notas?: string;
      items?: {
        productId: string;
        quantity: number;
        unitPrice: number;
      }[];
    }
  ): Promise<Cotizacion> {
    const total = data.items
      ? data.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)
      : undefined;

    return this.prisma.cotizacion.update({
      where: { id },
      data: {
        clienteNombre: data.clienteNombre,
        clienteEmail: data.clienteEmail,
        clienteTelefono: data.clienteTelefono,
        fecha: data.fecha,
        validezDias: data.validezDias,
        estado: data.estado as any,
        notas: data.notas,
        total,
        ...(data.items && {
          items: {
            deleteMany: {},
            create: data.items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
            })),
          },
        }),
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

  async remove(id: string): Promise<Cotizacion> {
    return this.prisma.cotizacion.delete({
      where: { id },
    });
  }

  async getSummary() {
    const [total, pendientes, aprobadas, rechazadas] = await Promise.all([
      this.prisma.cotizacion.count(),
      this.prisma.cotizacion.count({ where: { estado: 'PENDIENTE' } }),
      this.prisma.cotizacion.count({ where: { estado: 'APROBADA' } }),
      this.prisma.cotizacion.count({ where: { estado: 'RECHAZADA' } }),
    ]);

    return {
      total,
      pendientes,
      aprobadas,
      rechazadas,
    };
  }
}
