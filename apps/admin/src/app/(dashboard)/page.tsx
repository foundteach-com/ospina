'use client';

import { useState, useMemo } from 'react';
import { BarChart as RechartsBarChart, Bar, LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const purchaseDataByYear: Record<string, Array<{ month: string; value: number }>> = {
  '2024': [
    { month: 'Ene', value: 140 },
    { month: 'Feb', value: 180 },
    { month: 'Mar', value: 220 },
    { month: 'Abr', value: 260 },
    { month: 'May', value: 300 },
    { month: 'Jun', value: 280 },
  ],
  '2025': [
    { month: 'Ene', value: 210 },
    { month: 'Feb', value: 240 },
    { month: 'Mar', value: 270 },
    { month: 'Abr', value: 310 },
    { month: 'May', value: 340 },
    { month: 'Jun', value: 360 },
  ],
  '2026': [
    { month: 'Ene', value: 190 },
    { month: 'Feb', value: 220 },
    { month: 'Mar', value: 250 },
    { month: 'Abr', value: 290 },
    { month: 'May', value: 320 },
    { month: 'Jun', value: 350 },
  ],
};

const salesDataByYear: Record<string, Array<{ month: string; value: number }>> = {
  '2024': [
    { month: 'Ene', value: 210 },
    { month: 'Feb', value: 240 },
    { month: 'Mar', value: 260 },
    { month: 'Abr', value: 310 },
    { month: 'May', value: 360 },
    { month: 'Jun', value: 390 },
  ],
  '2025': [
    { month: 'Ene', value: 250 },
    { month: 'Feb', value: 280 },
    { month: 'Mar', value: 310 },
    { month: 'Abr', value: 340 },
    { month: 'May', value: 380 },
    { month: 'Jun', value: 410 },
  ],
  '2026': [
    { month: 'Ene', value: 270 },
    { month: 'Feb', value: 300 },
    { month: 'Mar', value: 330 },
    { month: 'Abr', value: 370 },
    { month: 'May', value: 400 },
    { month: 'Jun', value: 440 },
  ],
};

interface KPIIndicator {
  label: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon: React.ReactNode;
  colorClass: string;
}

const TrendIndicator = ({ change, label }: { change?: number; label?: string }) => {
  if (change === undefined) return null;
  const isPositive = change >= 0;
  return (
    <div className={`flex items-center gap-1 text-xs font-semibold ${isPositive ? 'text-emerald-600' : 'text-red-600'}`}>
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className={isPositive ? '' : 'rotate-180'}>
        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
        <polyline points="17 6 23 6 23 12"/>
      </svg>
      <span>{isPositive ? '+' : ''}{change.toFixed(1)}% {label || 'vs anterior'}</span>
    </div>
  );
};

const KPICard = ({ label, value, change, icon, colorClass }: KPIIndicator) => (
  <div className={`${colorClass} rounded-2xl border p-6 transition-all hover:shadow-lg hover:scale-105 cursor-pointer group`}>
    <div className="flex items-start justify-between mb-4">
      <div className="opacity-10 group-hover:opacity-20 transition-opacity">{icon}</div>
    </div>
    <p className="text-sm font-medium text-gray-600 mb-2">{label}</p>
    <p className="text-3xl font-bold text-gray-900 mb-2">{value}</p>
    {change !== undefined && <TrendIndicator change={change} />}
  </div>
);

export default function AdminPage() {
  const [purchaseYear, setPurchaseYear] = useState('2026');
  const [salesYear, setSalesYear] = useState('2026');

  const purchasesByMonth = purchaseDataByYear[purchaseYear] || purchaseDataByYear['2026'];
  const salesByMonth = salesDataByYear[salesYear] || salesDataByYear['2026'];

  const metrics = useMemo(() => {
    const totalPurchases = purchasesByMonth.reduce((sum, item) => sum + item.value, 0);
    const totalSales = salesByMonth.reduce((sum, item) => sum + item.value, 0);
    const margin = ((totalSales - totalPurchases) / totalPurchases) * 100;
    const avgPurchase = totalPurchases / purchasesByMonth.length;
    const avgSales = totalSales / salesByMonth.length;
    const conversionRate = (totalSales / totalPurchases) * 100;

    const prevYearPurchases = (purchaseYear === '2026' ? purchaseDataByYear['2025'] : purchaseDataByYear[purchaseYear === '2025' ? '2024' : '2025']).reduce((sum, item) => sum + item.value, 0);
    const purchaseGrowth = ((totalPurchases - prevYearPurchases) / prevYearPurchases) * 100;

    const prevYearSales = (salesYear === '2026' ? salesDataByYear['2025'] : salesDataByYear[salesYear === '2025' ? '2024' : '2025']).reduce((sum, item) => sum + item.value, 0);
    const salesGrowth = ((totalSales - prevYearSales) / prevYearSales) * 100;

    return {
      totalPurchases,
      totalSales,
      margin,
      avgPurchase,
      avgSales,
      conversionRate,
      purchaseGrowth,
      salesGrowth,
    };
  }, [purchaseYear, salesYear]);

  const combinedData = useMemo(() => {
    return purchasesByMonth.map((item, index) => ({
      month: item.month,
      compras: item.value,
      ventas: salesByMonth[index]?.value || 0,
    }));
  }, [purchasesByMonth, salesByMonth]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-100 p-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Dashboard de Gestión</h1>
        <p className="mt-2 text-gray-600 font-medium">Análisis integral de compras, ventas e indicadores de desempeño</p>
      </div>

      <div className="mb-8 grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <KPICard
          label="Compras Totales"
          value={`$${metrics.totalPurchases.toFixed(0)}k`}
          change={metrics.purchaseGrowth}
          icon={<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>}
          colorClass="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200"
        />
        <KPICard
          label="Ventas Totales"
          value={`$${metrics.totalSales.toFixed(0)}k`}
          change={metrics.salesGrowth}
          icon={<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>}
          colorClass="bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200"
        />
        <KPICard
          label="Margen Bruto"
          value={`${metrics.margin.toFixed(1)}%`}
          change={metrics.margin > 25 ? 5.2 : -2.1}
          icon={<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/></svg>}
          colorClass="bg-gradient-to-br from-amber-50 to-amber-100 border border-amber-200"
        />
        <KPICard
          label="Tasa Conversión"
          value={`${metrics.conversionRate.toFixed(1)}%`}
          change={3.8}
          icon={<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 11l3 3L22 4"/><path d="M20 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h11"/></svg>}
          colorClass="bg-gradient-to-br from-violet-50 to-violet-100 border border-violet-200"
        />
      </div>

      <div className="mb-8 grid gap-4 grid-cols-1 sm:grid-cols-3">
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-all">
          <p className="text-sm font-medium text-gray-600 mb-2">Promedio Compras</p>
          <p className="text-2xl font-bold text-gray-900">${metrics.avgPurchase.toFixed(0)}k</p>
          <p className="text-xs text-gray-500 mt-2">Por mes</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-all">
          <p className="text-sm font-medium text-gray-600 mb-2">Promedio Ventas</p>
          <p className="text-2xl font-bold text-gray-900">${metrics.avgSales.toFixed(0)}k</p>
          <p className="text-xs text-gray-500 mt-2">Por mes</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-all">
          <p className="text-sm font-medium text-gray-600 mb-2">ROI Estimado</p>
          <p className="text-2xl font-bold text-emerald-600">{((metrics.totalSales / metrics.totalPurchases - 1) * 100).toFixed(1)}%</p>
          <p className="text-xs text-gray-500 mt-2">Retorno de inversión</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2 mb-8">
        <div className="bg-white rounded-3xl border border-gray-200 p-8 shadow-sm hover:shadow-lg transition-all">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Análisis de Compras</h2>
              <p className="text-sm text-gray-500 mt-1">Tendencia mensual y comparativa</p>
            </div>
            <select
              value={purchaseYear}
              onChange={(e) => setPurchaseYear(e.target.value)}
              className="mt-4 sm:mt-0 px-4 py-2 border border-gray-300 rounded-xl bg-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            >
              <option value="2024">2024</option>
              <option value="2025">2025</option>
              <option value="2026">2026</option>
            </select>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <RechartsBarChart data={combinedData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
              <XAxis dataKey="month" stroke="#9ca3af" fontSize={12} />
              <YAxis stroke="#9ca3af" fontSize={12} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                formatter={(value) => `$${value}k`}
              />
              <Bar dataKey="compras" fill="#3b82f6" radius={[8, 8, 0, 0]} />
            </RechartsBarChart>
          </ResponsiveContainer>
          <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-blue-100/50 rounded-xl">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">Promedio Mensual</span>
              <span className="text-lg font-bold text-blue-600">${metrics.avgPurchase.toFixed(0)}k</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-gray-200 p-8 shadow-sm hover:shadow-lg transition-all">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Análisis de Ventas</h2>
              <p className="text-sm text-gray-500 mt-1">Tendencia mensual y comparativa</p>
            </div>
            <select
              value={salesYear}
              onChange={(e) => setSalesYear(e.target.value)}
              className="mt-4 sm:mt-0 px-4 py-2 border border-gray-300 rounded-xl bg-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
            >
              <option value="2024">2024</option>
              <option value="2025">2025</option>
              <option value="2026">2026</option>
            </select>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <RechartsBarChart data={combinedData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
              <XAxis dataKey="month" stroke="#9ca3af" fontSize={12} />
              <YAxis stroke="#9ca3af" fontSize={12} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                formatter={(value) => `$${value}k`}
              />
              <Bar dataKey="ventas" fill="#10b981" radius={[8, 8, 0, 0]} />
            </RechartsBarChart>
          </ResponsiveContainer>
          <div className="mt-4 p-4 bg-gradient-to-r from-emerald-50 to-emerald-100/50 rounded-xl">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">Promedio Mensual</span>
              <span className="text-lg font-bold text-emerald-600">${metrics.avgSales.toFixed(0)}k</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-gray-200 p-8 shadow-sm hover:shadow-lg transition-all">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900">Comparativa Compras vs Ventas</h2>
          <p className="text-sm text-gray-500 mt-1">Análisis de ambos canales en el período seleccionado</p>
        </div>
        <ResponsiveContainer width="100%" height={350}>
          <RechartsLineChart data={combinedData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
            <XAxis dataKey="month" stroke="#9ca3af" fontSize={12} />
            <YAxis stroke="#9ca3af" fontSize={12} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
              formatter={(value) => `$${value}k`}
            />
            <Legend />
            <Line type="monotone" dataKey="compras" stroke="#3b82f6" strokeWidth={3} dot={{ fill: '#3b82f6', r: 5 }} activeDot={{ r: 7 }} name="Compras" />
            <Line type="monotone" dataKey="ventas" stroke="#10b981" strokeWidth={3} dot={{ fill: '#10b981', r: 5 }} activeDot={{ r: 7 }} name="Ventas" />
          </RechartsLineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
