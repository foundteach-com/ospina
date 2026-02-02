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
      orderBy: { createdAt: 'desc' },
    });
  }

  findOne(id: string) {
    return this.prisma.provider.findUnique({
      where: { id },
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
