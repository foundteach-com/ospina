import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class ProvidersService {
  constructor(private prisma: PrismaService) {}

  create(data: Prisma.ProviderCreateInput) {
    return this.prisma.provider.create({ data });
  }

  findAll() {
    return this.prisma.provider.findMany({
      include: {
        _count: {
          select: { purchases: true }
        }
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  findOne(id: string) {
    return this.prisma.provider.findUnique({
      where: { id },
      include: {
        purchases: {
          orderBy: { date: 'desc' },
          take: 10,
        },
        _count: {
          select: { purchases: true }
        }
      }
    });
  }

  update(id: string, data: Prisma.ProviderUpdateInput) {
    return this.prisma.provider.update({
      where: { id },
      data,
    });
  }

  remove(id: string) {
    return this.prisma.provider.delete({
      where: { id },
    });
  }
}
