import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, Product } from '@prisma/client';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async create(data: Prisma.ProductCreateInput): Promise<Product> {
    return this.prisma.product.create({ data });
  }

  async findAll(params?: {
    skip?: number;
    take?: number;
    cursor?: Prisma.ProductWhereUniqueInput;
    where?: Prisma.ProductWhereInput;
    orderBy?: Prisma.ProductOrderByWithRelationInput;
  }): Promise<Product[]> {
    const { skip, take, cursor, where, orderBy } = params || {};
    return this.prisma.product.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
      include: { category: true },
    });
  }

  async findOne(id: string): Promise<Product | null> {
    return this.prisma.product.findUnique({
      where: { id },
      include: { category: true },
    });
  }

  async update(id: string, data: Prisma.ProductUpdateInput): Promise<Product> {
    return this.prisma.product.update({
      where: { id },
      data,
    });
  }

  async remove(id: string): Promise<Product> {
    // Check for dependencies
    const purchaseCount = await this.prisma.purchaseItem.count({
      where: { productId: id },
    });
    const saleCount = await this.prisma.saleItem.count({
      where: { productId: id },
    });

    if (purchaseCount > 0 || saleCount > 0) {
      throw new BadRequestException('No se puede eliminar el producto porque tiene movimientos de inventario registrados (compras o ventas).');
    }

    return this.prisma.product.delete({
      where: { id },
    });
  }

  async findAllCategories() {
    return this.prisma.category.findMany({
      orderBy: { name: 'asc' },
    });
  }
}
