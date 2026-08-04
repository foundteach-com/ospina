import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RolesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.accessRole.findMany({
      orderBy: { name: 'asc' }
    });
  }

  async findOne(id: string) {
    const role = await this.prisma.accessRole.findUnique({
      where: { id }
    });
    if (!role) {
      throw new NotFoundException(`Role with ID ${id} not found`);
    }
    return role;
  }

  async create(data: { name: string; description?: string; moduleAccess?: any; permissions?: any }) {
    return this.prisma.accessRole.create({
      data: {
        name: data.name,
        description: data.description,
        moduleAccess: data.moduleAccess || [],
        permissions: data.permissions || [],
      }
    });
  }

  async update(id: string, data: any) {
    return this.prisma.accessRole.update({
      where: { id },
      data
    });
  }

  async remove(id: string) {
    return this.prisma.accessRole.delete({
      where: { id }
    });
  }
}
