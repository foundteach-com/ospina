'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import KPICard from '@/components/dashboard/KPICard';
import LineChart from '@/components/charts/LineChart';
import BarChart from '@/components/charts/BarChart';
import PieChart from '@/components/charts/PieChart';
import AreaChart from '@/components/charts/AreaChart';

interface User {
  name: string;
  email: string;
  role: string;
}

interface DashboardStats {
  salesToday: { total: number; count: number };
  salesMonth: { total: number; count: number };
  salesYear: { total: number; count: number };
  totalClients: number;
  totalProducts: number;
  pendingSales: number;
  cashFlowBalance: number;
}

export default function AdminPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [salesTrend, setSalesTrend] = useState<any[]>([]);
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [topClients, setTopClients] = useState<any[]>([]);
  const [revenueByCategory, setRevenueByCategory] = useState<any[]>([]);
  const [cashFlowTrend, setCashFlowTrend] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    const userData = localStorage.getItem('user');
    
    if (!token) {
      router.push('/login');
      return;
    }

    if (userData) {
      setUser(JSON.parse(userData));
    }

    // Fetch dashboard data
    fetchDashboardData(token);
  }, [router]);

  const fetchDashboardData = async (token: string) => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      };

      // Fetch all dashboard data in parallel
      const [statsRes, trendRes, productsRes, clientsRes, categoryRes, cashFlowRes] = await Promise.all([
        fetch(`${baseUrl}/dashboard/stats`, { headers }),
        fetch(`${baseUrl}/dashboard/sales-trend?days=30`, { headers }),
        fetch(`${baseUrl}/dashboard/top-products?limit=5`, { headers }),
        fetch(`${baseUrl}/dashboard/top-clients?limit=5`, { headers }),
        fetch(`${baseUrl}/dashboard/revenue-by-category`, { headers }),
        fetch(`${baseUrl}/dashboard/cash-flow-trend?months=6`, { headers }),
      ]);

      const statsData = await statsRes.json();
      const trendData = await trendRes.json();
      const productsData = await productsRes.json();
      const clientsData = await clientsRes.json();
      const categoryData = await categoryRes.json();
      const cashFlowData = await cashFlowRes.json();

      setStats(statsData);
      setSalesTrend(trendData);
      setTopProducts(productsData);
      setTopClients(clientsData);
      setRevenueByCategory(categoryData);
      setCashFlowTrend(cashFlowData);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(value);
  };

  if (!user || loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard Ejecutivo</h1>
        <p className="text-gray-500">Bienvenido de vuelta, {user.name}. Aquí está el resumen de tu negocio.</p>
      </header>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <KPICard
          title="Ventas Hoy"
          value={formatCurrency(stats?.salesToday?.total || 0)}
          color="green"
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="1" x2="12" y2="23"/>
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
            </svg>
          }
        />
        <KPICard
          title="Ventas del Mes"
          value={formatCurrency(stats?.salesMonth?.total || 0)}
          color="blue"
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
              <polyline points="17 6 23 6 23 12"/>
            </svg>
          }
        />
        <KPICard
          title="Clientes Activos"
          value={stats?.totalClients || 0}
          color="purple"
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
          }
        />
        <KPICard
          title="Balance Flujo de Caja"
          value={formatCurrency(stats?.cashFlowBalance || 0)}
          color={(stats?.cashFlowBalance ?? 0) >= 0 ? 'green' : 'red'}
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
              <line x1="1" y1="10" x2="23" y2="10"/>
            </svg>
          }
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Sales Trend */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
          <LineChart
            data={salesTrend}
            dataKey="total"
            xAxisKey="date"
            title="Tendencia de Ventas (Últimos 30 días)"
            color="#10b981"
            height={300}
          />
        </div>

        {/* Revenue by Category */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
          <BarChart
            data={revenueByCategory}
            dataKey="revenue"
            xAxisKey="category"
            title="Ingresos por Categoría"
            color="#3b82f6"
            height={300}
          />
        </div>
      </div>

      {/* Second Row Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Top Products */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold mb-4 text-gray-900">Top 5 Productos Más Vendidos</h3>
          <div className="space-y-3">
            {topProducts.length > 0 ? (
              topProducts.map((product, index) => (
                <div key={product.productId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{product.productName}</p>
                      <p className="text-sm text-gray-500">{product.productCode}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">{product.totalQuantity} unidades</p>
                    <p className="text-sm text-gray-500">{product.salesCount} ventas</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-8">No hay datos disponibles</p>
            )}
          </div>
        </div>

        {/* Top Clients */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold mb-4 text-gray-900">Top 5 Clientes</h3>
          <div className="space-y-3">
            {topClients.length > 0 ? (
              topClients.map((client, index) => (
                <div key={client.clientId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{client.clientName}</p>
                      <p className="text-sm text-gray-500">{client.clientTaxId}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">{formatCurrency(client.totalPurchases)}</p>
                    <p className="text-sm text-gray-500">{client.purchaseCount} compras</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-8">No hay datos disponibles</p>
            )}
          </div>
        </div>
      </div>

      {/* Cash Flow Trend */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
        <AreaChart
          data={cashFlowTrend}
          dataKeys={['income', 'expense', 'balance']}
          xAxisKey="month"
          title="Flujo de Caja (Últimos 6 meses)"
          colors={['#10b981', '#ef4444', '#3b82f6']}
          height={300}
        />
      </div>
    </div>
  );
}
