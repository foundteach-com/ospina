import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getStats(startDate?: Date, endDate?: Date) {
    const now = new Date();
    const todayStart = new Date(now.setHours(0, 0, 0, 0));
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const yearStart = new Date(now.getFullYear(), 0, 1);

    // Sales today
    const salesToday = await this.prisma.sale.aggregate({
      where: {
        date: { gte: todayStart },
        status: { not: 'CANCELLED' },
      },
      _sum: { total: true },
      _count: true,
    });

    // Sales this month
    const salesMonth = await this.prisma.sale.aggregate({
      where: {
        date: { gte: monthStart },
        status: { not: 'CANCELLED' },
      },
      _sum: { total: true },
      _count: true,
    });

    // Sales this year
    const salesYear = await this.prisma.sale.aggregate({
      where: {
        date: { gte: yearStart },
        status: { not: 'CANCELLED' },
      },
      _sum: { total: true },
      _count: true,
    });

    // Total clients
    const totalClients = await this.prisma.client.count();

    // Total products
    const totalProducts = await this.prisma.product.count();

    // Pending sales
    const pendingSales = await this.prisma.sale.count({
      where: { status: 'PENDING' },
    });

    // Cash flow balance
    const cashFlowSummary = await this.getCashFlowSummary();

    return {
      salesToday: {
        total: salesToday._sum.total || 0,
        count: salesToday._count,
      },
      salesMonth: {
        total: salesMonth._sum.total || 0,
        count: salesMonth._count,
      },
      salesYear: {
        total: salesYear._sum.total || 0,
        count: salesYear._count,
      },
      totalClients,
      totalProducts,
      pendingSales,
      cashFlowBalance: cashFlowSummary.balance,
    };
  }

  async getPurchasesByMonth(year?: number) {
    const targetYear = year || new Date().getFullYear();
    const startDate = new Date(targetYear, 0, 1); // January 1st
    const endDate = new Date(targetYear, 11, 31, 23, 59, 59); // December 31st

    const purchases = await this.prisma.purchase.findMany({
      where: {
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        date: true,
        total: true,
      },
      orderBy: { date: 'asc' },
    });

    // Group by month
    const purchasesByMonth = purchases.reduce((acc, purchase) => {
      const monthKey = `${purchase.date.getFullYear()}-${String(purchase.date.getMonth() + 1).padStart(2, '0')}`;
      if (!acc[monthKey]) {
        acc[monthKey] = { month: monthKey, total: 0, count: 0 };
      }
      acc[monthKey].total += Number(purchase.total);
      acc[monthKey].count += 1;
      return acc;
    }, {} as Record<string, { month: string; total: number; count: number }>);

    // Ensure all 12 months are present
    const allMonths = [];
    for (let i = 0; i < 12; i++) {
      const monthKey = `${targetYear}-${String(i + 1).padStart(2, '0')}`;
      allMonths.push(
        purchasesByMonth[monthKey] || { month: monthKey, total: 0, count: 0 }
      );
    }

    return allMonths;
  }

  async getSalesByMonth(year?: number) {
    const targetYear = year || new Date().getFullYear();
    const startDate = new Date(targetYear, 0, 1); // January 1st
    const endDate = new Date(targetYear, 11, 31, 23, 59, 59); // December 31st

    const sales = await this.prisma.sale.findMany({
      where: {
        date: {
          gte: startDate,
          lte: endDate,
        },
        status: { not: 'CANCELLED' },
      },
      select: {
        date: true,
        total: true,
      },
      orderBy: { date: 'asc' },
    });

    // Group by month
    const salesByMonth = sales.reduce((acc, sale) => {
      const monthKey = `${sale.date.getFullYear()}-${String(sale.date.getMonth() + 1).padStart(2, '0')}`;
      if (!acc[monthKey]) {
        acc[monthKey] = { month: monthKey, total: 0, count: 0 };
      }
      acc[monthKey].total += Number(sale.total);
      acc[monthKey].count += 1;
      return acc;
    }, {} as Record<string, { month: string; total: number; count: number }>);

    // Ensure all 12 months are present
    const allMonths = [];
    for (let i = 0; i < 12; i++) {
      const monthKey = `${targetYear}-${String(i + 1).padStart(2, '0')}`;
      allMonths.push(
        salesByMonth[monthKey] || { month: monthKey, total: 0, count: 0 }
      );
    }

    return allMonths;
  }

  async getInventoryStatus() {
    const products = await this.prisma.product.findMany({
      select: {
        id: true,
        name: true,
        code: true,
      },
    });

    // For now, we'll return a simple count
    // In a real scenario, you'd calculate stock levels from inventory movements
    const totalProducts = products.length;

    return {
      total: totalProducts,
      lowStock: 0, // Placeholder - would need inventory tracking
      normal: totalProducts,
      high: 0,
    };
  }

  async getCashFlowTrend(months: number = 6) {
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);

    const cashFlows = await this.prisma.cashFlow.findMany({
      where: {
        date: { gte: startDate },
      },
      orderBy: { date: 'asc' },
    });

    // Group by month
    const flowByMonth = cashFlows.reduce((acc, flow) => {
      const monthKey = `${flow.date.getFullYear()}-${String(flow.date.getMonth() + 1).padStart(2, '0')}`;
      if (!acc[monthKey]) {
        acc[monthKey] = { month: monthKey, income: 0, expense: 0, balance: 0 };
      }
      if (flow.type === 'INCOME') {
        acc[monthKey].income += Number(flow.amount);
      } else {
        acc[monthKey].expense += Number(flow.amount);
      }
      acc[monthKey].balance = acc[monthKey].income - acc[monthKey].expense;
      return acc;
    }, {} as Record<string, { month: string; income: number; expense: number; balance: number }>);

    return Object.values(flowByMonth);
  }

  private async getCashFlowSummary() {
    const cashFlows = await this.prisma.cashFlow.findMany();

    const summary = cashFlows.reduce(
      (acc, flow) => {
        if (flow.type === 'INCOME') {
          acc.totalIncome += Number(flow.amount);
        } else {
          acc.totalExpense += Number(flow.amount);
        }
        return acc;
      },
      { totalIncome: 0, totalExpense: 0 }
    );

    return {
      ...summary,
      balance: summary.totalIncome - summary.totalExpense,
    };
  }
}
