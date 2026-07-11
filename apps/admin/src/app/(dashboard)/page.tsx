'use client';

import { useState, useMemo, useEffect } from 'react';
import { BarChart as RechartsBarChart, Bar, LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import KPICard from '@/components/dashboard/KPICard';

const monthLabels = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

const transformApiData = (apiData: Array<{ month: string; total: number; count: number }>) => {
  return apiData.map(item => ({
    month: monthLabels[parseInt(item.month.split('-')[1]) - 1],
    value: Math.round(item.total / 1000),
  }));
};

const fallbackPurchaseData: Record<string, Array<{ month: string; value: number }>> = {
  '2024': [
    { month: 'Ene', value: 140 },
    { month: 'Feb', value: 180 },
    { month: 'Mar', value: 220 },
    { month: 'Abr', value: 260 },
    { month: 'May', value: 300 },
    { month: 'Jun', value: 280 },
    { month: 'Jul', value: 310 },
    { month: 'Ago', value: 330 },
    { month: 'Sep', value: 350 },
    { month: 'Oct', value: 370 },
    { month: 'Nov', value: 390 },
    { month: 'Dic', value: 420 },
  ],
  '2025': [
    { month: 'Ene', value: 210 },
    { month: 'Feb', value: 240 },
    { month: 'Mar', value: 270 },
    { month: 'Abr', value: 310 },
    { month: 'May', value: 340 },
    { month: 'Jun', value: 360 },
    { month: 'Jul', value: 380 },
    { month: 'Ago', value: 400 },
    { month: 'Sep', value: 420 },
    { month: 'Oct', value: 440 },
    { month: 'Nov', value: 460 },
    { month: 'Dic', value: 490 },
  ],
  '2026': [
    { month: 'Ene', value: 190 },
    { month: 'Feb', value: 220 },
    { month: 'Mar', value: 250 },
    { month: 'Abr', value: 290 },
    { month: 'May', value: 320 },
    { month: 'Jun', value: 350 },
    { month: 'Jul', value: 0 },
    { month: 'Ago', value: 0 },
    { month: 'Sep', value: 0 },
    { month: 'Oct', value: 0 },
    { month: 'Nov', value: 0 },
    { month: 'Dic', value: 0 },
  ],
};

const fallbackSalesData: Record<string, Array<{ month: string; value: number }>> = {
  '2024': [
    { month: 'Ene', value: 210 },
    { month: 'Feb', value: 240 },
    { month: 'Mar', value: 260 },
    { month: 'Abr', value: 310 },
    { month: 'May', value: 360 },
    { month: 'Jun', value: 390 },
    { month: 'Jul', value: 420 },
    { month: 'Ago', value: 450 },
    { month: 'Sep', value: 480 },
    { month: 'Oct', value: 510 },
    { month: 'Nov', value: 540 },
    { month: 'Dic', value: 570 },
  ],
  '2025': [
    { month: 'Ene', value: 250 },
    { month: 'Feb', value: 280 },
    { month: 'Mar', value: 310 },
    { month: 'Abr', value: 340 },
    { month: 'May', value: 380 },
    { month: 'Jun', value: 410 },
    { month: 'Jul', value: 440 },
    { month: 'Ago', value: 470 },
    { month: 'Sep', value: 500 },
    { month: 'Oct', value: 530 },
    { month: 'Nov', value: 560 },
    { month: 'Dic', value: 600 },
  ],
  '2026': [
    { month: 'Ene', value: 270 },
    { month: 'Feb', value: 300 },
    { month: 'Mar', value: 330 },
    { month: 'Abr', value: 370 },
    { month: 'May', value: 400 },
    { month: 'Jun', value: 440 },
    { month: 'Jul', value: 0 },
    { month: 'Ago', value: 0 },
    { month: 'Sep', value: 0 },
    { month: 'Oct', value: 0 },
    { month: 'Nov', value: 0 },
    { month: 'Dic', value: 0 },
  ],
};

export default function AdminPage() {
  const [purchaseYear, setPurchaseYear] = useState('2026');
  const [salesYear, setSalesYear] = useState('2026');
  const [purchasesRealData, setPurchasesRealData] = useState<Array<{ month: string; value: number }> | null>(null);
  const [salesRealData, setSalesRealData] = useState<Array<{ month: string; value: number }> | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

        const headers = {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        };

        const [purchasesRes, salesRes] = await Promise.all([
          fetch(`${apiUrl}/dashboard/purchases-by-month?year=${purchaseYear}`, { headers }),
          fetch(`${apiUrl}/dashboard/sales-by-month?year=${salesYear}`, { headers }),
        ]);

        if (purchasesRes.ok) {
          const purchasesData = await purchasesRes.json();
          setPurchasesRealData(transformApiData(purchasesData));
        }

        if (salesRes.ok) {
          const salesData = await salesRes.json();
          setSalesRealData(transformApiData(salesData));
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [purchaseYear, salesYear]);

  const purchasesByMonth = purchasesRealData || fallbackPurchaseData[purchaseYear] || fallbackPurchaseData['2026'];
  const salesByMonth = salesRealData || fallbackSalesData[salesYear] || fallbackSalesData['2026'];

  const metrics = useMemo(() => {
    const totalPurchases = purchasesByMonth.reduce((sum, item) => sum + item.value, 0);
    const totalSales = salesByMonth.reduce((sum, item) => sum + item.value, 0);
    const margin = totalPurchases > 0 ? ((totalSales - totalPurchases) / totalPurchases) * 100 : 0;
    const avgPurchase = purchasesByMonth.length > 0 ? totalPurchases / purchasesByMonth.length : 0;
    const avgSales = salesByMonth.length > 0 ? totalSales / salesByMonth.length : 0;
    const conversionRate = totalPurchases > 0 ? (totalSales / totalPurchases) * 100 : 0;

    const prevYearNum = parseInt(purchaseYear) - 1;
    const prevYearKey = prevYearNum.toString();
    const prevYearPurchases = (fallbackPurchaseData[prevYearKey] || fallbackPurchaseData['2025']).reduce((sum, item) => sum + item.value, 0);
    const purchaseGrowth = prevYearPurchases > 0 ? ((totalPurchases - prevYearPurchases) / prevYearPurchases) * 100 : 0;

    const prevYearSalesNum = parseInt(salesYear) - 1;
    const prevYearSalesKey = prevYearSalesNum.toString();
    const prevYearSales = (fallbackSalesData[prevYearSalesKey] || fallbackSalesData['2025']).reduce((sum, item) => sum + item.value, 0);
    const salesGrowth = prevYearSales > 0 ? ((totalSales - prevYearSales) / prevYearSales) * 100 : 0;

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
  }, [purchasesByMonth, salesByMonth, purchaseYear, salesYear]);

  const combinedData = useMemo(() => {
    return purchasesByMonth.map((item, index) => ({
      month: item.month,
      compras: item.value,
      ventas: salesByMonth[index]?.value || 0,
    }));
  }, [purchasesByMonth, salesByMonth]);

  return (
    <div className={`min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-100 p-8 ${isLoading ? 'opacity-75' : ''}`}>
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Dashboard de Gestión</h1>
            <p className="mt-2 text-gray-600 font-medium">Análisis integral de compras, ventas e indicadores de desempeño</p>
          </div>
          {isLoading && (
            <div className="flex items-center gap-2 px-4 py-2 bg-blue-100 border border-blue-300 rounded-lg">
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-blue-700">Cargando datos...</span>
            </div>
          )}
        </div>
      </div>

      <div className="mb-8 grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="Compras Totales"
          value={`$${metrics.totalPurchases.toFixed(0)}k`}
          change={metrics.purchaseGrowth}
          icon={<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>}
          color="blue"
        />
        <KPICard
          title="Ventas Totales"
          value={`$${metrics.totalSales.toFixed(0)}k`}
          change={metrics.salesGrowth}
          icon={<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>}
          color="green"
        />
        <KPICard
          title="Margen Bruto"
          value={`${metrics.margin.toFixed(1)}%`}
          change={metrics.margin > 25 ? 5.2 : -2.1}
          icon={<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/></svg>}
          color="orange"
        />
        <KPICard
          title="Tasa Conversión"
          value={`${metrics.conversionRate.toFixed(1)}%`}
          change={3.8}
          icon={<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 11l3 3L22 4"/><path d="M20 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h11"/></svg>}
          color="purple"
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
