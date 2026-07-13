'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  ComposedChart,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import KPICard from '@/components/dashboard/KPICard';
import ChartCard from '@/components/dashboard/ChartCard';
import { formatCurrency } from '@/lib/formatters';

interface MonthData {
  month: string;
  total: number;
  count: number;
}

interface TopProduct {
  productId: string;
  productName: string;
  productCode: string;
  totalQuantity: number;
  salesCount: number;
}

interface TopClient {
  clientId: string;
  clientName: string;
  clientTaxId: string;
  totalPurchases: number;
  purchaseCount: number;
}

interface TopProvider {
  providerId: string;
  providerName: string;
  providerTaxId: string;
  totalPurchases: number;
  purchaseCount: number;
}

const MONTH_LABELS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

const PIE_COLORS = ['#3b82f6', '#8b5cf6', '#f59e0b', '#10b981', '#ef4444', '#06b6d4', '#ec4899', '#84cc16'];

const compactCurrency = (value: number) => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value || 0);
};

export default function AdminPage() {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [loading, setLoading] = useState(true);

  const [purchasesByMonth, setPurchasesByMonth] = useState<MonthData[]>([]);
  const [salesByMonth, setSalesByMonth] = useState<MonthData[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [topClients, setTopClients] = useState<TopClient[]>([]);
  const [topProviders, setTopProviders] = useState<TopProvider[]>([]);

  const yearOptions = useMemo(() => {
    const years: number[] = [];
    for (let y = currentYear; y >= currentYear - 5; y--) years.push(y);
    return years;
  }, [currentYear]);

  const apiFetch = useCallback(async (path: string) => {
    const token = localStorage.getItem('access_token');
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${path}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error(`Error ${res.status} en ${path}`);
    return res.json();
  }, []);

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      try {
        const [purchases, sales, products, clients, providers] = await Promise.all([
          apiFetch(`/dashboard/purchases-by-month?year=${selectedYear}`),
          apiFetch(`/dashboard/sales-by-month?year=${selectedYear}`),
          apiFetch(`/dashboard/top-products?limit=6`),
          apiFetch(`/dashboard/top-clients?limit=6`),
          apiFetch(`/dashboard/top-providers?limit=6`),
        ]);
        if (!active) return;
        setPurchasesByMonth(Array.isArray(purchases) ? purchases : []);
        setSalesByMonth(Array.isArray(sales) ? sales : []);
        setTopProducts(Array.isArray(products) ? products : []);
        setTopClients(Array.isArray(clients) ? clients : []);
        setTopProviders(Array.isArray(providers) ? providers : []);
      } catch (err) {
        console.error('Error cargando dashboard:', err);
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => {
      active = false;
    };
  }, [selectedYear, apiFetch]);

  const monthlyData = useMemo(() => {
    return MONTH_LABELS.map((label, i) => ({
      month: label,
      compras: Number(purchasesByMonth[i]?.total || 0),
      ventas: Number(salesByMonth[i]?.total || 0),
    }));
  }, [purchasesByMonth, salesByMonth]);

  const currentMonthIndex = new Date().getMonth();

  const totals = useMemo(() => {
    const purchasesYear = purchasesByMonth.reduce((s, m) => s + Number(m.total || 0), 0);
    const salesYear = salesByMonth.reduce((s, m) => s + Number(m.total || 0), 0);
    const purchasesMonth = Number(purchasesByMonth[currentMonthIndex]?.total || 0);
    const salesMonth = Number(salesByMonth[currentMonthIndex]?.total || 0);
    const prevMonthIndex = currentMonthIndex - 1;
    const purchasesPrevMonth = prevMonthIndex >= 0 ? Number(purchasesByMonth[prevMonthIndex]?.total || 0) : 0;
    const salesPrevMonth = prevMonthIndex >= 0 ? Number(salesByMonth[prevMonthIndex]?.total || 0) : 0;

    const marginYear = salesYear - purchasesYear;
    const marginPercent = salesYear > 0 ? (marginYear / salesYear) * 100 : 0;

    const pctChange = (curr: number, prev: number) => {
      if (prev === 0) return curr > 0 ? 100 : 0;
      return Math.round(((curr - prev) / prev) * 100);
    };

    return {
      purchasesYear,
      salesYear,
      purchasesMonth,
      salesMonth,
      marginYear,
      marginPercent,
      purchasesChange: pctChange(purchasesMonth, purchasesPrevMonth),
      salesChange: pctChange(salesMonth, salesPrevMonth),
    };
  }, [purchasesByMonth, salesByMonth, currentMonthIndex]);

  const productsChartData = useMemo(
    () =>
      topProducts.map((p) => ({
        name: p.productName.length > 18 ? p.productName.slice(0, 18) + '…' : p.productName,
        cantidad: Number(p.totalQuantity || 0),
      })),
    [topProducts]
  );

  const clientsChartData = useMemo(
    () =>
      topClients.map((c) => ({
        name: c.clientName,
        value: Number(c.totalPurchases || 0),
      })),
    [topClients]
  );

  const providersChartData = useMemo(
    () =>
      topProviders.map((p) => ({
        name: p.providerName.length > 18 ? p.providerName.slice(0, 18) + '…' : p.providerName,
        value: Number(p.totalPurchases || 0),
      })),
    [topProviders]
  );

  const CurrencyTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 text-sm">
        <p className="font-semibold text-gray-800 mb-1">{label}</p>
        {payload.map((entry: any, i: number) => (
          <p key={i} style={{ color: entry.color }} className="font-medium">
            {entry.name}: {formatCurrency(entry.value)}
          </p>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-100 p-4 md:p-8">
      {/* Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Dashboard de Gestión
          </h1>
          <p className="mt-2 text-gray-600 font-medium">
            Análisis integral de compras, ventas e indicadores de desempeño
          </p>
        </div>
        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-2 shadow-sm">
          <span className="text-sm font-medium text-gray-500">Año</span>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="bg-transparent font-bold text-gray-800 focus:outline-none cursor-pointer"
          >
            {yearOptions.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-32">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-6">
          {/* KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            <KPICard
              title="Compras del Mes"
              value={compactCurrency(totals.purchasesMonth)}
              change={totals.purchasesChange}
              changeLabel="vs mes anterior"
              color="orange"
            />
            <KPICard
              title="Ventas del Mes"
              value={compactCurrency(totals.salesMonth)}
              change={totals.salesChange}
              changeLabel="vs mes anterior"
              color="green"
            />
            <KPICard
              title={`Margen de Ganancia ${selectedYear}`}
              value={compactCurrency(totals.marginYear)}
              change={Math.round(totals.marginPercent)}
              changeLabel="del total vendido"
              color={totals.marginYear >= 0 ? 'blue' : 'red'}
            />
            <KPICard
              title={`Compras Totales ${selectedYear}`}
              value={compactCurrency(totals.purchasesYear)}
              color="orange"
            />
            <KPICard
              title={`Ventas Totales ${selectedYear}`}
              value={compactCurrency(totals.salesYear)}
              color="green"
            />
            <KPICard
              title="Ganancia Neta (%)"
              value={`${totals.marginPercent.toFixed(1)}%`}
              color="purple"
            />
          </div>

          {/* Comparativa Compras vs Ventas */}
          <ChartCard
            title="Comparativa Compras vs Ventas"
            subtitle={`Evolución mensual durante ${selectedYear}`}
          >
            <ResponsiveContainer width="100%" height={340}>
              <ComposedChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tickFormatter={(v) => compactCurrency(v)} tick={{ fontSize: 11 }} width={70} />
                <Tooltip content={<CurrencyTooltip />} />
                <Legend />
                <Bar dataKey="compras" name="Compras" fill="#f59e0b" radius={[6, 6, 0, 0]} barSize={18} />
                <Bar dataKey="ventas" name="Ventas" fill="#10b981" radius={[6, 6, 0, 0]} barSize={18} />
                <Line type="monotone" dataKey="ventas" name="Tendencia Ventas" stroke="#059669" strokeWidth={2} dot={false} legendType="none" />
              </ComposedChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Compras por Mes / Ventas por Mes */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <ChartCard title="Compras por Mes" subtitle={`Total con IVA · ${selectedYear}`}>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tickFormatter={(v) => compactCurrency(v)} tick={{ fontSize: 11 }} width={70} />
                  <Tooltip content={<CurrencyTooltip />} />
                  <Bar dataKey="compras" name="Compras" fill="#f59e0b" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Ventas por Mes" subtitle={`Total · ${selectedYear}`}>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tickFormatter={(v) => compactCurrency(v)} tick={{ fontSize: 11 }} width={70} />
                  <Tooltip content={<CurrencyTooltip />} />
                  <Line type="monotone" dataKey="ventas" name="Ventas" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>

          {/* Productos mas vendidos / Proveedores / Clientes */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <ChartCard title="Productos más Vendidos" subtitle="Por cantidad de unidades">
              {productsChartData.length === 0 ? (
                <EmptyState />
              ) : (
                <ResponsiveContainer width="100%" height={320}>
                  <BarChart data={productsChartData} layout="vertical" margin={{ left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis type="number" tick={{ fontSize: 11 }} />
                    <YAxis type="category" dataKey="name" width={130} tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="cantidad" name="Unidades" fill="#8b5cf6" radius={[0, 6, 6, 0]} barSize={20} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </ChartCard>

            <ChartCard title="Principales Clientes" subtitle="Por volumen de compra">
              {clientsChartData.length === 0 ? (
                <EmptyState />
              ) : (
                <ResponsiveContainer width="100%" height={320}>
                  <PieChart>
                    <Pie
                      data={clientsChartData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={110}
                      innerRadius={55}
                      paddingAngle={2}
                    >
                      {clientsChartData.map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v: any) => formatCurrency(Number(v))} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </ChartCard>
          </div>

          {/* Proveedores */}
          <ChartCard title="Principales Proveedores" subtitle="Por volumen de compras registradas">
            {providersChartData.length === 0 ? (
              <EmptyState />
            ) : (
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={providersChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tickFormatter={(v) => compactCurrency(v)} tick={{ fontSize: 11 }} width={70} />
                  <Tooltip formatter={(v: any) => formatCurrency(Number(v))} />
                  <Bar dataKey="value" name="Compras" fill="#06b6d4" radius={[6, 6, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </ChartCard>
        </div>
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-[280px] text-gray-400">
      <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M3 3v18h18" />
        <path d="M18 17V9" />
        <path d="M13 17V5" />
        <path d="M8 17v-3" />
      </svg>
      <p className="mt-3 text-sm font-medium">No hay datos disponibles</p>
    </div>
  );
}
