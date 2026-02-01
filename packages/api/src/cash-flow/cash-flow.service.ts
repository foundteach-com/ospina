import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CashFlowType } from '@prisma/client';

@Injectable()
export class CashFlowService {
  constructor(private prisma: PrismaService) {}

  async create(data: {
    date: string | Date;
    receiptNumber: string;
    provider: string;
    description: string;
    type: 'INCOME' | 'EXPENSE';
    amount: number;
  }) {
    return this.prisma.cashFlow.create({
      data: {
        date: new Date(data.date),
        receiptNumber: data.receiptNumber,
        provider: data.provider,
        description: data.description,
        type: data.type as CashFlowType,
        amount: data.amount,
      },
    });
  }

  async findAll(filters?: {
    type?: 'INCOME' | 'EXPENSE';
    startDate?: string;
    endDate?: string;
    search?: string;
    sortBy?: string;
    order?: 'asc' | 'desc';
  }) {
    const where: any = {};

    if (filters?.type) {
      where.type = filters.type as CashFlowType;
    }

    if (filters?.startDate || filters?.endDate) {
      where.date = {};
      if (filters.startDate) {
        where.date.gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        where.date.lte = new Date(filters.endDate);
      }
    }

    if (filters?.search) {
      where.OR = [
        { provider: { contains: filters.search, mode: 'insensitive' } },
        { receiptNumber: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    const orderBy = filters?.sortBy
      ? { [filters.sortBy]: filters.order || 'desc' }
      : { date: 'desc' as const };

    return this.prisma.cashFlow.findMany({
      where,
      orderBy,
    });
  }

  async update(id: string, data: {
    date?: string | Date;
    receiptNumber?: string;
    provider?: string;
    description?: string;
    type?: 'INCOME' | 'EXPENSE';
    amount?: number;
  }) {
    return this.prisma.cashFlow.update({
      where: { id },
      data: {
        ...(data.date && { date: new Date(data.date) }),
        ...(data.receiptNumber && { receiptNumber: data.receiptNumber }),
        ...(data.provider && { provider: data.provider }),
        ...(data.description && { description: data.description }),
        ...(data.type && { type: data.type as CashFlowType }),
        ...(data.amount !== undefined && { amount: data.amount }),
      },
    });
  }

  async remove(id: string) {
    return this.prisma.cashFlow.delete({
      where: { id },
    });
  }

  async getSummary() {
    const aggregated = await this.prisma.cashFlow.groupBy({
      by: ['type'],
      _sum: {
        amount: true,
      },
    });

    const totalIncome = aggregated.find((a) => a.type === CashFlowType.INCOME)?._sum.amount || 0;
    const totalExpense = aggregated.find((a) => a.type === CashFlowType.EXPENSE)?._sum.amount || 0;

    return {
      totalIncome: Number(totalIncome),
      totalExpense: Number(totalExpense),
      balance: Number(totalIncome) - Number(totalExpense),
    };
  }
}
