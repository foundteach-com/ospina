'use client';

import { useEffect, useState } from 'react';

export default function AdminPage() {
  const [stats, setStats] = useState({ high: 0, medium: 0, low: 0, outOfStock: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('access_token');
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/inventory/stats`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch (error) {
        console.error('Error fetching inventory stats:', error);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Inicio</h1>
        <p className="mt-1 text-gray-500">Indicadores generales del inventario</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-teal-100/50 p-6 shadow-sm">
          <p className="text-sm font-semibold text-emerald-700">Stock Alto</p>
          <p className="mt-2 text-4xl font-bold text-gray-900">{stats.high}</p>
        </div>
        <div className="rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-100/50 p-6 shadow-sm">
          <p className="text-sm font-semibold text-blue-700">Stock Medio</p>
          <p className="mt-2 text-4xl font-bold text-gray-900">{stats.medium}</p>
        </div>
        <div className="rounded-2xl border border-amber-100 bg-gradient-to-br from-amber-50 to-yellow-100/50 p-6 shadow-sm">
          <p className="text-sm font-semibold text-amber-700">Stock Bajo</p>
          <p className="mt-2 text-4xl font-bold text-gray-900">{stats.low}</p>
        </div>
        <div className="rounded-2xl border border-rose-100 bg-gradient-to-br from-rose-50 to-red-100/50 p-6 shadow-sm">
          <p className="text-sm font-semibold text-rose-700">Agotado</p>
          <p className="mt-2 text-4xl font-bold text-gray-900">{stats.outOfStock}</p>
        </div>
      </div>
    </div>
  );
}
