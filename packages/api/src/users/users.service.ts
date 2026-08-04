import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, User } from '@prisma/client';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async createUser(data: Prisma.UserCreateInput): Promise<User> {
    return this.prisma.user.create({
      data,
    });
  }

  async findOne(email: string): Promise<any | null> {
    return this.prisma.user.findUnique({
      where: { email },
      include: { accessRole: true }
    });
  }

  async findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { id },
      include: { accessRole: true }
    });
  }

  async findAll(): Promise<any[]> {
    return this.prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      include: { accessRole: true }
    });
  }

  async update(id: string, data: any): Promise<User> {
    const updateData = { ...data };
    
    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 10);
    }

    return this.prisma.user.update({
      where: { id },
      data: updateData,
    });
  }

  async remove(id: string): Promise<User> {
    return this.prisma.user.delete({
      where: { id },
    });
  }

  async toggleStatus(id: string): Promise<User> {
    const user = await this.findById(id);
    if (!user) throw new Error('User not found');
    return this.prisma.user.update({
      where: { id },
      data: { isActive: !user.isActive }
    });
  }

  async resetPassword(id: string, newPassword?: string): Promise<{ user: User, tempPassword?: string }> {
    const user = await this.findById(id);
    if (!user) throw new Error('User not found');
    
    // Generate a random temp password if not provided
    const tempPassword = newPassword || Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.hash(tempPassword, 10);
    
    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: { password: hashedPassword }
    });
    
    return { user: updatedUser, tempPassword };
  }
}
