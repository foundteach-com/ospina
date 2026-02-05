'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import KPICard from '@/components/dashboard/KPICard';
import BarChart from '@/components/charts/BarChart';
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

interface MonthlyData {
  month: string;
  total: number;
  count: number;
  [key: string]: string | number;
}

interface TopProduct {
  productId: string;
  productName: string;
  productCode: string;
  totalQuantity: number;
  salesCount: number;
  [key: string]: string | number;
}

interface TopClient {
  clientId: string;
  clientName: string;
  clientTaxId: string;
  totalPurchases: number;
  purchaseCount: number;
  [key: string]: string | number;
}

interface CashFlowTrendData {
  month: string;
  income: number;
  expense: number;
  balance: number;
  [key: string]: string | number;
}

export default function AdminPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [purchasesByMonth, setPurchasesByMonth] = useState<MonthlyData[]>([]);
  const [salesByMonth, setSalesByMonth] = useState<MonthlyData[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [topClients, setTopClients] = useState<TopClient[]>([]);
  const [cashFlowTrend, setCashFlowTrend] = useState<CashFlowTrendData[]>([]);
  const [purchasesYear, setPurchasesYear] = useState<number>(new Date().getFullYear());
  const [salesYear, setSalesYear] = useState<number>(new Date().getFullYear());
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
  }, [router, purchasesYear, salesYear]);

  const fetchDashboardData = async (token: string) => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      };

      // Fetch all dashboard data in parallel
      const [statsRes, purchasesRes, salesRes, productsRes, clientsRes, cashFlowRes] = await Promise.all([
        fetch(`${baseUrl}/dashboard/stats`, { headers }),
        fetch(`${baseUrl}/dashboard/purchases-by-month?year=${purchasesYear}`, { headers }),
        fetch(`${baseUrl}/dashboard/sales-by-month?year=${salesYear}`, { headers }),
        fetch(`${baseUrl}/dashboard/top-products?limit=5`, { headers }),
        fetch(`${baseUrl}/dashboard/top-clients?limit=5`, { headers }),
        fetch(`${baseUrl}/dashboard/cash-flow-trend?months=6`, { headers }),
      ]);

      const statsData = await statsRes.json();
      const purchasesData = await purchasesRes.json();
      const salesData = await salesRes.json();
      const productsData = await productsRes.json();
      const clientsData = await clientsRes.json();
      const cashFlowData = await cashFlowRes.json();

      setStats(statsData);
      setPurchasesByMonth(purchasesData);
      setSalesByMonth(salesData);
      setTopProducts(productsData);
      setTopClients(clientsData);
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
      maximumFractionDigits: 0,
    }).format(value);
  };

  const getMonthName = (dateString: string) => {
    const [year, month] = dateString.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return new Intl.DateTimeFormat('es-CO', { month: 'short' }).format(date);
  };

  // Transform data to use month names
  const purchasesData = purchasesByMonth.map(item => ({
    ...item,
    monthName: item.month.includes('-') ? getMonthName(item.month) : item.month
  }));

  const salesData = salesByMonth.map(item => ({
    ...item,
    monthName: item.month.includes('-') ? getMonthName(item.month) : item.month
  }));

  const formatPeriod = (dateString: string) => {
    if (!dateString.includes('-')) return dateString;
    const [year, month] = dateString.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    // Return lowercase format: "ene. 2026"
    return new Intl.DateTimeFormat('es-CO', { month: 'short', year: 'numeric' }).format(date);
  };

  const cashFlowData = cashFlowTrend.map(item => ({
    ...item,
    period: formatPeriod(item.month),
    Ingresos: item.income,
    Egresos: item.expense,
    Balance: item.balance
  }));

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
        {/* Purchases by Month */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Compras por Mes</h3>
            <select
              value={purchasesYear}
              onChange={(e) => setPurchasesYear(Number(e.target.value))}
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {Array.from({ length: new Date().getFullYear() - 2019 }, (_, i) => 2020 + i).map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
          <BarChart
            data={purchasesData}
            dataKey="total"
            xAxisKey="monthName"
            color="#f59e0b"
            height={300}
            yAxisFormatter={formatCurrency}
            hideLegend={true}
          />
        </div>

        {/* Sales by Month */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Ventas por Mes</h3>
            <select
              value={salesYear}
              onChange={(e) => setSalesYear(Number(e.target.value))}
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {Array.from({ length: new Date().getFullYear() - 2019 }, (_, i) => 2020 + i).map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
          <BarChart
            data={salesData}
            dataKey="total"
            xAxisKey="monthName"
            color="#10b981"
            height={300}
            yAxisFormatter={formatCurrency}
            hideLegend={true}
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
          data={cashFlowData}
          dataKeys={['Balance', 'Egresos', 'Ingresos']}
          xAxisKey="period"
          title="Flujo de Caja (Últimos 6 meses)"
          colors={['#3b82f6', '#ef4444', '#10b981']}
          height={300}
          yAxisFormatter={formatCurrency}
        />
      </div>
    </div>
  );
}
