'use client';

import { useState, useEffect } from 'react';
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const monthLabels = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

const transformApiData = (apiData: Array<{ month: string; total: number; count: number }>) => {
  return apiData.map(item => ({
    month: monthLabels[parseInt(item.month.split('-')[1]) - 1],
    total: Math.round(item.total),
  }));
};

export default function AdminPage() {
  const [purchaseYear, setPurchaseYear] = useState('2026');
  const [purchasesData, setPurchasesData] = useState<Array<{ month: string; total: number }> | null>(null);
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

        const purchasesRes = await fetch(`${apiUrl}/dashboard/purchases-by-month?year=${purchaseYear}`, { headers });

        if (purchasesRes.ok) {
          const purchasesApiData = await purchasesRes.json();
          setPurchasesData(transformApiData(purchasesApiData));
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [purchaseYear]);

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

      <div className="bg-white rounded-3xl border border-gray-200 p-8 shadow-sm hover:shadow-lg transition-all">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Total de Compras por Mes</h2>
            <p className="text-sm text-gray-500 mt-1">Valores totales con IVA incluido</p>
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
        {purchasesData && purchasesData.length > 0 ? (
          <ResponsiveContainer width="100%" height={400}>
            <RechartsBarChart data={purchasesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
              <XAxis dataKey="month" stroke="#9ca3af" fontSize={12} />
              <YAxis stroke="#9ca3af" fontSize={12} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                formatter={(value) => `$${Number(value).toLocaleString('es-CO')}`}
              />
              <Bar dataKey="total" fill="#3b82f6" radius={[8, 8, 0, 0]} />
            </RechartsBarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-96 bg-gray-50 rounded-lg">
            <p className="text-gray-500">No hay datos disponibles</p>
          </div>
        )}
      </div>
    </div>
  );
}
