'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  TrendingUp, 
  Users, 
  FileText, 
  ArrowUpRight, 
  ArrowDownRight,
  PlusCircle,
  FileSpreadsheet,
  PackageSearch,
  ShoppingCart
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';


const COLORS = ['#3b82f6', '#10b981', '#ef4444', '#f59e0b']; // PENDIENTE, APROBADA, RECHAZADA, VENCIDA

interface DashboardData {
  kpis: {
    currentRevenue: number;
    lastRevenue: number;
    revenueGrowth: number;
    pendingQuotesCount: number;
    approvedQuotesCountThisMonth: number;
    totalQuotesThisMonth: number;
    newClientsThisMonth: number;
  };
  recentSales: {
    id: string;
    referenceNumber: string;
    clientName: string;
    date: string;
    total: number;
    status: string;
  }[];
  charts: {
    salesTrend: { name: string; ventas: number }[];
    quotesDistribution: { name: string; value: number }[];
  };
}

export default function ComercialPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const res = await fetch(`${apiUrl}/comercial/dashboard`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-500 font-medium">Cargando métricas comerciales...</p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Centro Comercial</h1>
          <p className="text-gray-500 mt-1">Control de ventas, cotizaciones y clientes.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/ventas/crear" className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-lg shadow-blue-600/20">
            <PlusCircle className="w-5 h-5" />
            <span>Nueva Venta</span>
          </Link>
          <Link href="/cotizaciones/crear" className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 px-5 py-2.5 rounded-xl font-medium transition-all shadow-sm">
            <FileText className="w-5 h-5" />
            <span>Cotizar</span>
          </Link>
        </div>
      </div>

      {/* KPIS (Glassmorphism Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* KPI 1 */}
        <div className="bg-white/70 backdrop-blur-xl border border-white/20 p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden group">
          <div className="absolute top-0 right-0 -mr-4 -mt-4 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-all"></div>
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shadow-sm">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div className={`flex items-center gap-1 text-sm font-semibold px-2.5 py-1 rounded-full ${data.kpis.revenueGrowth >= 0 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
              {data.kpis.revenueGrowth >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
              {Math.abs(data.kpis.revenueGrowth).toFixed(1)}%
            </div>
          </div>
          <p className="text-gray-500 text-sm font-medium mb-1">Ventas del Mes</p>
          <h3 className="text-3xl font-bold text-gray-900 tracking-tight">
            ${data.kpis.currentRevenue.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </h3>
        </div>

        {/* KPI 2 */}
        <div className="bg-white/70 backdrop-blur-xl border border-white/20 p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden group">
          <div className="absolute top-0 right-0 -mr-4 -mt-4 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all"></div>
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center shadow-sm">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
          </div>
          <p className="text-gray-500 text-sm font-medium mb-1">Cotizaciones (Mes)</p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-3xl font-bold text-gray-900 tracking-tight">{data.kpis.totalQuotesThisMonth}</h3>
            <span className="text-sm text-gray-500 font-medium">emitidas</span>
          </div>
          <p className="text-sm text-emerald-600 font-medium mt-2">{data.kpis.approvedQuotesCountThisMonth} aprobadas</p>
        </div>

        {/* KPI 3 */}
        <div className="bg-white/70 backdrop-blur-xl border border-white/20 p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden group">
          <div className="absolute top-0 right-0 -mr-4 -mt-4 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl group-hover:bg-amber-500/20 transition-all"></div>
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center shadow-sm">
              <PackageSearch className="w-6 h-6" />
            </div>
          </div>
          <p className="text-gray-500 text-sm font-medium mb-1">Cotizaciones Pendientes</p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-3xl font-bold text-gray-900 tracking-tight">{data.kpis.pendingQuotesCount}</h3>
            <span className="text-sm text-gray-500 font-medium">por gestionar</span>
          </div>
        </div>

        {/* KPI 4 */}
        <div className="bg-white/70 backdrop-blur-xl border border-white/20 p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden group">
          <div className="absolute top-0 right-0 -mr-4 -mt-4 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl group-hover:bg-purple-500/20 transition-all"></div>
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center shadow-sm">
              <Users className="w-6 h-6" />
            </div>
          </div>
          <p className="text-gray-500 text-sm font-medium mb-1">Clientes Nuevos</p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-3xl font-bold text-gray-900 tracking-tight">{data.kpis.newClientsThisMonth}</h3>
            <span className="text-sm text-gray-500 font-medium">este mes</span>
          </div>
        </div>
      </div>

      {/* CHARTS ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* AREA CHART */}
        <div className="lg:col-span-2 bg-white/70 backdrop-blur-xl border border-white/20 p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
          <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-gray-400" /> Tendencia de Ventas (6 meses)
          </h2>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.charts.salesTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorVentas" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} tickFormatter={(val) => `$${(val/1000000).toFixed(1)}M`} />
                <RechartsTooltip 
                  contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontWeight: 500 }}
                  formatter={(value: any) => [`$${Number(value || 0).toLocaleString('es-CO')}`, 'Ingresos']}
                />
                <Area type="monotone" dataKey="ventas" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorVentas)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* PIE CHART */}
        <div className="bg-white/70 backdrop-blur-xl border border-white/20 p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
          <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-gray-400" /> Estado de Cotizaciones
          </h2>
          {data.charts.quotesDistribution.length > 0 ? (
            <div className="h-[250px] w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.charts.quotesDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {data.charts.quotesDistribution.map((entry, index) => {
                      let color = COLORS[0];
                      if (entry.name === 'APROBADA') color = COLORS[1];
                      if (entry.name === 'RECHAZADA') color = COLORS[2];
                      if (entry.name === 'VENCIDA') color = COLORS[3];
                      return <Cell key={`cell-${index}`} fill={color} />;
                    })}
                  </Pie>
                  <RechartsTooltip 
                    contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-[250px] flex items-center justify-center text-gray-400 font-medium">
              No hay datos suficientes
            </div>
          )}
          
          <div className="mt-4 space-y-2">
            {data.charts.quotesDistribution.map((entry, index) => {
              let color = 'bg-blue-500';
              if (entry.name === 'APROBADA') color = 'bg-emerald-500';
              if (entry.name === 'RECHAZADA') color = 'bg-red-500';
              if (entry.name === 'VENCIDA') color = 'bg-amber-500';
              return (
                <div key={index} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-gray-600 font-medium">
                    <div className={`w-3 h-3 rounded-full ${color}`}></div>
                    {entry.name}
                  </div>
                  <span className="font-bold text-gray-900">{entry.value}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* RECENT SALES TABLE & QUICK LINKS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white/70 backdrop-blur-xl border border-white/20 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-gray-400" /> Ventas Recientes
            </h2>
            <Link href="/ventas" className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors">
              Ver todas
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50/50">
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Referencia</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Cliente</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Fecha</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.recentSales.map(sale => (
                  <tr key={sale.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">{sale.referenceNumber || 'N/A'}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 font-medium">{sale.clientName}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(sale.date).toLocaleDateString('es-CO')}
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-gray-900 text-right font-mono">
                      ${sale.total.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
                {data.recentSales.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-gray-500 font-medium">
                      No hay ventas recientes
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        
        {/* ACCESOS DIRECTOS */}
        <div className="bg-white/70 backdrop-blur-xl border border-white/20 p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] h-fit">
          <h2 className="text-lg font-bold text-gray-900 mb-6">Accesos Directos</h2>
          <div className="space-y-3">
            <Link href="/clientes" className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 hover:bg-gray-100 transition-colors group border border-transparent hover:border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-gray-600 shadow-sm">
                  <Users className="w-5 h-5" />
                </div>
                <span className="font-semibold text-gray-700 group-hover:text-gray-900">Directorio de Clientes</span>
              </div>
              <ArrowUpRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
            </Link>
            
            <Link href="/cotizaciones" className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 hover:bg-gray-100 transition-colors group border border-transparent hover:border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-gray-600 shadow-sm">
                  <FileText className="w-5 h-5" />
                </div>
                <span className="font-semibold text-gray-700 group-hover:text-gray-900">Historial de Cotizaciones</span>
              </div>
              <ArrowUpRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
            </Link>

            <Link href="/ventas" className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 hover:bg-gray-100 transition-colors group border border-transparent hover:border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-gray-600 shadow-sm">
                  <ShoppingCart className="w-5 h-5" />
                </div>
                <span className="font-semibold text-gray-700 group-hover:text-gray-900">Historial de Ventas</span>
              </div>
              <ArrowUpRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
