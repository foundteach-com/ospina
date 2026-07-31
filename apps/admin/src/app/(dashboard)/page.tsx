'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
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

const apiFetch = async (path: string) => {
  const token = localStorage.getItem('access_token');
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`Error ${res.status} en ${path}`);
  return res.json();
};

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

// ─────────────────────────────────────────────────────────────────────────────
// VENTAS SECTION
// ─────────────────────────────────────────────────────────────────────────────
function VentasSection() {
  const currentYear = new Date().getFullYear();
  const [salesYear, setSalesYear] = useState(currentYear);
  const [loading, setLoading] = useState(true);

  const [salesByMonth, setSalesByMonth] = useState<MonthData[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [topClients, setTopClients] = useState<TopClient[]>([]);

  const yearOptions = useMemo(() => {
    const years: number[] = [];
    for (let y = currentYear; y >= currentYear - 5; y--) years.push(y);
    return years;
  }, [currentYear]);

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      try {
        const [sales, products, clients] = await Promise.all([
          apiFetch(`/dashboard/sales-by-month?year=${salesYear}`),
          apiFetch(`/dashboard/top-products?limit=6`),
          apiFetch(`/dashboard/top-clients?limit=6`),
        ]);
        if (!active) return;
        setSalesByMonth(Array.isArray(sales) ? sales : []);
        setTopProducts(Array.isArray(products) ? products : []);
        setTopClients(Array.isArray(clients) ? clients : []);
      } catch (err) {
        console.error('Error cargando ventas:', err);
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => {
      active = false;
    };
  }, [salesYear]);

  const monthlyData = useMemo(() => {
    return MONTH_LABELS.map((label, i) => ({
      month: label,
      ventas: Number(salesByMonth[i]?.total || 0),
    }));
  }, [salesByMonth]);

  const currentMonthIndex = new Date().getMonth();

  const totals = useMemo(() => {
    const salesYearTotal = salesByMonth.reduce((s, m) => s + Number(m.total || 0), 0);
    const salesMonth = Number(salesByMonth[currentMonthIndex]?.total || 0);
    const prevMonthIndex = currentMonthIndex - 1;
    const salesPrevMonth = prevMonthIndex >= 0 ? Number(salesByMonth[prevMonthIndex]?.total || 0) : 0;

    const pctChange = (curr: number, prev: number) => {
      if (prev === 0) return curr > 0 ? 100 : 0;
      return Math.round(((curr - prev) / prev) * 100);
    };

    return {
      salesYearTotal,
      salesMonth,
      salesChange: pctChange(salesMonth, salesPrevMonth),
    };
  }, [salesByMonth, currentMonthIndex]);

  const productsChartData = useMemo(() => topProducts.map((p) => ({
    name: p.productName.length > 18 ? p.productName.slice(0, 18) + '…' : p.productName,
    cantidad: Number(p.totalQuantity || 0),
  })), [topProducts]);

  const clientsChartData = useMemo(() => topClients.map((c) => ({
    name: c.clientName,
    value: Number(c.totalPurchases || 0),
  })), [topClients]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-800">Métricas de Ventas</h2>
        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-2 shadow-sm">
          <span className="text-sm font-medium text-gray-500">Año</span>
          <select
            value={salesYear}
            onChange={(e) => setSalesYear(Number(e.target.value))}
            className="bg-transparent font-bold text-gray-800 focus:outline-none cursor-pointer"
          >
            {yearOptions.map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-32">
          <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <KPICard
              title="Ventas del Mes"
              value={compactCurrency(totals.salesMonth)}
              change={totals.salesChange}
              changeLabel="vs mes anterior"
              color="green"
            />
            <KPICard
              title={`Ventas Totales ${salesYear}`}
              value={compactCurrency(totals.salesYearTotal)}
              color="green"
            />
          </div>

          <ChartCard title="Ventas por Mes" subtitle={`Evolución durante ${salesYear}`}>
            <ResponsiveContainer width="100%" height={340}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tickFormatter={(v) => compactCurrency(v)} tick={{ fontSize: 11 }} width={70} />
                <Tooltip content={<CurrencyTooltip />} />
                <Legend />
                <Line type="monotone" dataKey="ventas" name="Ventas" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <ChartCard title="Productos más Vendidos" subtitle="Por cantidad de unidades">
              {productsChartData.length === 0 ? <EmptyState /> : (
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

            <ChartCard title="Principales Clientes" subtitle="Por volumen de facturación">
              {clientsChartData.length === 0 ? <EmptyState /> : (
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
                      {clientsChartData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                    </Pie>
                    <Tooltip formatter={(v: any) => formatCurrency(Number(v))} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </ChartCard>
          </div>
        </>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPRAS SECTION
// ─────────────────────────────────────────────────────────────────────────────
function ComprasSection() {
  const currentYear = new Date().getFullYear();
  const [purchasesYear, setPurchasesYear] = useState(currentYear);
  const [loading, setLoading] = useState(true);

  const [purchasesByMonth, setPurchasesByMonth] = useState<MonthData[]>([]);
  const [topProviders, setTopProviders] = useState<TopProvider[]>([]);

  const yearOptions = useMemo(() => {
    const years: number[] = [];
    for (let y = currentYear; y >= currentYear - 5; y--) years.push(y);
    return years;
  }, [currentYear]);

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      try {
        const [purchases, providers] = await Promise.all([
          apiFetch(`/dashboard/purchases-by-month?year=${purchasesYear}`),
          apiFetch(`/dashboard/top-providers?limit=6`),
        ]);
        if (!active) return;
        setPurchasesByMonth(Array.isArray(purchases) ? purchases : []);
        setTopProviders(Array.isArray(providers) ? providers : []);
      } catch (err) {
        console.error('Error cargando compras:', err);
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => {
      active = false;
    };
  }, [purchasesYear]);

  const monthlyData = useMemo(() => {
    return MONTH_LABELS.map((label, i) => ({
      month: label,
      compras: Number(purchasesByMonth[i]?.total || 0),
    }));
  }, [purchasesByMonth]);

  const currentMonthIndex = new Date().getMonth();

  const totals = useMemo(() => {
    const purchasesYearTotal = purchasesByMonth.reduce((s, m) => s + Number(m.total || 0), 0);
    const purchasesMonth = Number(purchasesByMonth[currentMonthIndex]?.total || 0);
    const prevMonthIndex = currentMonthIndex - 1;
    const purchasesPrevMonth = prevMonthIndex >= 0 ? Number(purchasesByMonth[prevMonthIndex]?.total || 0) : 0;

    const pctChange = (curr: number, prev: number) => {
      if (prev === 0) return curr > 0 ? 100 : 0;
      return Math.round(((curr - prev) / prev) * 100);
    };

    return {
      purchasesYearTotal,
      purchasesMonth,
      purchasesChange: pctChange(purchasesMonth, purchasesPrevMonth),
    };
  }, [purchasesByMonth, currentMonthIndex]);

  const providersChartData = useMemo(() => topProviders.map((p) => ({
    name: p.providerName.length > 18 ? p.providerName.slice(0, 18) + '…' : p.providerName,
    value: Number(p.totalPurchases || 0),
  })), [topProviders]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-800">Métricas de Compras</h2>
        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-2 shadow-sm">
          <span className="text-sm font-medium text-gray-500">Año</span>
          <select
            value={purchasesYear}
            onChange={(e) => setPurchasesYear(Number(e.target.value))}
            className="bg-transparent font-bold text-gray-800 focus:outline-none cursor-pointer"
          >
            {yearOptions.map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-32">
          <div className="w-12 h-12 border-4 border-amber-200 border-t-amber-600 rounded-full animate-spin" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <KPICard
              title="Compras del Mes"
              value={compactCurrency(totals.purchasesMonth)}
              change={totals.purchasesChange}
              changeLabel="vs mes anterior"
              color="orange"
            />
            <KPICard
              title={`Compras Totales ${purchasesYear}`}
              value={compactCurrency(totals.purchasesYearTotal)}
              color="orange"
            />
          </div>

          <ChartCard title="Compras por Mes" subtitle={`Total con IVA · ${purchasesYear}`}>
            <ResponsiveContainer width="100%" height={340}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tickFormatter={(v) => compactCurrency(v)} tick={{ fontSize: 11 }} width={70} />
                <Tooltip content={<CurrencyTooltip />} />
                <Legend />
                <Bar dataKey="compras" name="Compras" fill="#f59e0b" radius={[6, 6, 0, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Principales Proveedores" subtitle="Por volumen de compras registradas">
            {providersChartData.length === 0 ? <EmptyState /> : (
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={providersChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tickFormatter={(v) => compactCurrency(v)} tick={{ fontSize: 11 }} width={70} />
                  <Tooltip formatter={(v: any) => formatCurrency(Number(v))} />
                  <Bar dataKey="value" name="Total Comprado" fill="#06b6d4" radius={[6, 6, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </ChartCard>
        </>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────────────────────
export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<'ventas' | 'compras'>('ventas');

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-100 p-4 md:p-8">
      {/* Header */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Dashboard de Gestión
          </h1>
          <p className="mt-2 text-gray-600 font-medium">
            Análisis detallado de indicadores de negocio
          </p>
        </div>
      </div>

      {/* Tabs Selector */}
      <div className="mb-8 flex space-x-2 bg-white/60 p-1.5 rounded-xl w-fit shadow-sm border border-gray-100">
        <button
          onClick={() => setActiveTab('ventas')}
          className={`px-8 py-2.5 rounded-lg text-sm font-bold transition-all ${
            activeTab === 'ventas' 
              ? 'bg-blue-600 text-white shadow-md' 
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100/80'
          }`}
        >
          Ventas
        </button>
        <button
          onClick={() => setActiveTab('compras')}
          className={`px-8 py-2.5 rounded-lg text-sm font-bold transition-all ${
            activeTab === 'compras' 
              ? 'bg-amber-500 text-white shadow-md' 
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100/80'
          }`}
        >
          Compras
        </button>
      </div>

      {/* Content */}
      <div className="bg-white/40 p-6 rounded-3xl border border-white/60 shadow-sm">
        {activeTab === 'ventas' && <VentasSection />}
        {activeTab === 'compras' && <ComprasSection />}
      </div>
    </div>
  );
}
