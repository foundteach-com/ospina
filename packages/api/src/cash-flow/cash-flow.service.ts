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

  async findAll() {
    return this.prisma.cashFlow.findMany({
      orderBy: {
        date: 'desc',
      },
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
