import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ComercialService {
  constructor(private prisma: PrismaService) {}

  async getDashboardData() {
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
    
    // 1. Ingresos y Ventas (Completadas o Pagadas)
    // Asumimos que Sale.status = COMPLETED representa ventas cerradas.
    const currentMonthSales = await this.prisma.sale.aggregate({
      where: {
        date: { gte: currentMonthStart },
        status: 'COMPLETED'
      },
      _sum: { total: true },
      _count: { id: true }
    });

    const lastMonthSales = await this.prisma.sale.aggregate({
      where: {
        date: { gte: lastMonthStart, lte: lastMonthEnd },
        status: 'COMPLETED'
      },
      _sum: { total: true },
      _count: { id: true }
    });

    const currentRevenue = Number(currentMonthSales._sum.total || 0);
    const lastRevenue = Number(lastMonthSales._sum.total || 0);
    const revenueGrowth = lastRevenue === 0 
      ? 100 
      : ((currentRevenue - lastRevenue) / lastRevenue) * 100;

    // 2. Cotizaciones (Métricas)
    const pendingQuotesCount = await this.prisma.cotizacion.count({
      where: { estado: 'PENDIENTE' }
    });
    
    const approvedQuotesCountThisMonth = await this.prisma.cotizacion.count({
      where: { 
        estado: 'APROBADA',
        fecha: { gte: currentMonthStart }
      }
    });

    const totalQuotesThisMonth = await this.prisma.cotizacion.count({
      where: { fecha: { gte: currentMonthStart } }
    });

    // 3. Clientes Nuevos
    const newClientsThisMonth = await this.prisma.client.count({
      where: { createdAt: { gte: currentMonthStart } }
    });

    // 4. Ventas Recientes
    const recentSales = await this.prisma.sale.findMany({
      take: 5,
      orderBy: { date: 'desc' },
      include: { client: { select: { name: true } } }
    });

    // 5. Gráfico de Ventas (Últimos 6 meses)
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);
    const rawSalesLast6Months = await this.prisma.sale.groupBy({
      by: ['date'],
      where: {
        date: { gte: sixMonthsAgo },
        status: 'COMPLETED'
      },
      _sum: { total: true }
    });

    // Agrupar por mes en memoria para el gráfico
    const monthsData = Array.from({ length: 6 }).map((_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
      return {
        month: d.getMonth(),
        year: d.getFullYear(),
        label: d.toLocaleString('es-CO', { month: 'short' }),
        total: 0
      };
    });

    rawSalesLast6Months.forEach(sale => {
      const d = new Date(sale.date);
      const m = d.getMonth();
      const y = d.getFullYear();
      
      const monthObj = monthsData.find(md => md.month === m && md.year === y);
      if (monthObj) {
        monthObj.total += Number(sale._sum.total || 0);
      }
    });

    // Distribución de estado de Cotizaciones
    const quotesDistribution = await this.prisma.cotizacion.groupBy({
      by: ['estado'],
      _count: { id: true }
    });

    const quotesChart = quotesDistribution.map(item => ({
      name: item.estado,
      value: item._count.id
    }));

    return {
      kpis: {
        currentRevenue,
        lastRevenue,
        revenueGrowth,
        pendingQuotesCount,
        approvedQuotesCountThisMonth,
        totalQuotesThisMonth,
        newClientsThisMonth
      },
      recentSales: recentSales.map(s => ({
        id: s.id,
        referenceNumber: s.referenceNumber,
        clientName: s.client.name,
        date: s.date,
        total: Number(s.total),
        status: s.status
      })),
      charts: {
        salesTrend: monthsData.map(m => ({
          name: m.label,
          ventas: m.total
        })),
        quotesDistribution: quotesChart
      }
    };
  }
}
