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

  async getSalesTrend(days: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const sales = await this.prisma.sale.findMany({
      where: {
        date: { gte: startDate },
        status: { not: 'CANCELLED' },
      },
      select: {
        date: true,
        total: true,
      },
      orderBy: { date: 'asc' },
    });

    // Group by date
    const salesByDate = sales.reduce((acc, sale) => {
      const dateKey = sale.date.toISOString().split('T')[0];
      if (!acc[dateKey]) {
        acc[dateKey] = { date: dateKey, total: 0, count: 0 };
      }
      acc[dateKey].total += Number(sale.total);
      acc[dateKey].count += 1;
      return acc;
    }, {} as Record<string, { date: string; total: number; count: number }>);

    return Object.values(salesByDate);
  }

  async getTopProducts(limit: number = 5) {
    const topProducts = await this.prisma.saleItem.groupBy({
      by: ['productId'],
      _sum: {
        quantity: true,
      },
      _count: {
        productId: true,
      },
      orderBy: {
        _sum: {
          quantity: 'desc',
        },
      },
      take: limit,
    });

    const productsWithDetails = await Promise.all(
      topProducts.map(async (item) => {
        const product = await this.prisma.product.findUnique({
          where: { id: item.productId },
          select: { name: true, code: true },
        });
        return {
          productId: item.productId,
          productName: product?.name || 'Unknown',
          productCode: product?.code || 'N/A',
          totalQuantity: item._sum.quantity || 0,
          salesCount: item._count.productId,
        };
      })
    );

    return productsWithDetails;
  }

  async getTopClients(limit: number = 5) {
    const topClients = await this.prisma.sale.groupBy({
      by: ['clientId'],
      where: {
        status: { not: 'CANCELLED' },
      },
      _sum: {
        total: true,
      },
      _count: {
        clientId: true,
      },
      orderBy: {
        _sum: {
          total: 'desc',
        },
      },
      take: limit,
    });

    const clientsWithDetails = await Promise.all(
      topClients.map(async (item) => {
        const client = await this.prisma.client.findUnique({
          where: { id: item.clientId },
          select: { name: true, taxId: true },
        });
        return {
          clientId: item.clientId,
          clientName: client?.name || 'Unknown',
          clientTaxId: client?.taxId || 'N/A',
          totalPurchases: item._sum.total || 0,
          purchaseCount: item._count.clientId,
        };
      })
    );

    return clientsWithDetails;
  }

  async getRevenueByCategory() {
    const sales = await this.prisma.saleItem.findMany({
      include: {
        product: {
          include: {
            category: true,
          },
        },
      },
    });

    const revenueByCategory = sales.reduce((acc, item) => {
      const categoryName = item.product.category?.name || 'Sin categoría';
      if (!acc[categoryName]) {
        acc[categoryName] = { category: categoryName, revenue: 0, count: 0 };
      }
      acc[categoryName].revenue += Number(item.salePrice) * item.quantity;
      acc[categoryName].count += 1;
      return acc;
    }, {} as Record<string, { category: string; revenue: number; count: number }>);

    return Object.values(revenueByCategory).sort((a, b) => b.revenue - a.revenue);
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
