'use client';

import { useState } from 'react';

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

export default function AdminPage() {
  const [purchaseYear, setPurchaseYear] = useState('2026');
  const [salesYear, setSalesYear] = useState('2026');

  const purchasesByMonth = purchaseDataByYear[purchaseYear] || purchaseDataByYear['2026'];
  const salesByMonth = salesDataByYear[salesYear] || salesDataByYear['2026'];
  const maxPurchases = Math.max(...purchasesByMonth.map((item) => item.value));
  const maxSales = Math.max(...salesByMonth.map((item) => item.value));

  const totalPurchases = purchasesByMonth.reduce((sum, item) => sum + item.value, 0);
  const totalSales = salesByMonth.reduce((sum, item) => sum + item.value, 0);
  const growth = ((totalSales - totalPurchases) / totalPurchases) * 100;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Inicio</h1>
        <p className="mt-1 text-gray-500">Dashboard gerencial para analizar compras y ventas por mes</p>
      </div>

      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-100/50 p-5 shadow-sm">
          <p className="text-sm font-semibold text-blue-700">Compras totales</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">${totalPurchases.toFixed(0)}k</p>
        </div>
        <div className="rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-teal-100/50 p-5 shadow-sm">
          <p className="text-sm font-semibold text-emerald-700">Ventas totales</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">${totalSales.toFixed(0)}k</p>
        </div>
        <div className="rounded-2xl border border-amber-100 bg-gradient-to-br from-amber-50 to-yellow-100/50 p-5 shadow-sm">
          <p className="text-sm font-semibold text-amber-700">Margen estimado</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">{growth.toFixed(1)}%</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Compras por mes</h2>
              <p className="text-sm text-gray-500">Tendencia mensual de compras</p>
            </div>
            <div className="w-full md:w-36">
              <label htmlFor="purchase-year" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500">
                Año
              </label>
              <select
                id="purchase-year"
                value={purchaseYear}
                onChange={(e) => setPurchaseYear(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="2024">2024</option>
                <option value="2025">2025</option>
                <option value="2026">2026</option>
              </select>
            </div>
          </div>

          <div className="mt-6 flex h-64 items-end gap-3 rounded-2xl bg-gradient-to-b from-blue-50/70 to-white p-4">
            {purchasesByMonth.map((item) => (
              <div key={item.month} className="flex flex-1 flex-col items-center gap-2">
                <div className="flex h-44 w-full items-end rounded-xl bg-white/80 p-1 shadow-inner">
                  <div
                    className="w-full rounded-lg bg-gradient-to-t from-blue-600 to-blue-400 shadow-sm"
                    style={{ height: `${(item.value / maxPurchases) * 100}%` }}
                  />
                </div>
                <span className="text-xs font-medium text-gray-500">{item.month}</span>
              </div>
            ))}
          </div>

          <div className="mt-4 flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 px-3 py-2 text-sm text-gray-600">
            <span>Promedio mensual</span>
            <span className="font-semibold text-gray-900">${(totalPurchases / purchasesByMonth.length).toFixed(0)}k</span>
          </div>
        </div>

        <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Ventas por mes</h2>
              <p className="text-sm text-gray-500">Tendencia mensual de ventas</p>
            </div>
            <div className="w-full md:w-36">
              <label htmlFor="sales-year" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500">
                Año
              </label>
              <select
                id="sales-year"
                value={salesYear}
                onChange={(e) => setSalesYear(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              >
                <option value="2024">2024</option>
                <option value="2025">2025</option>
                <option value="2026">2026</option>
              </select>
            </div>
          </div>

          <div className="mt-6 flex h-64 items-end gap-3 rounded-2xl bg-gradient-to-b from-emerald-50/70 to-white p-4">
            {salesByMonth.map((item) => (
              <div key={item.month} className="flex flex-1 flex-col items-center gap-2">
                <div className="flex h-44 w-full items-end rounded-xl bg-white/80 p-1 shadow-inner">
                  <div
                    className="w-full rounded-lg bg-gradient-to-t from-emerald-600 to-emerald-400 shadow-sm"
                    style={{ height: `${(item.value / maxSales) * 100}%` }}
                  />
                </div>
                <span className="text-xs font-medium text-gray-500">{item.month}</span>
              </div>
            ))}
          </div>

          <div className="mt-4 flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 px-3 py-2 text-sm text-gray-600">
            <span>Promedio mensual</span>
            <span className="font-semibold text-gray-900">${(totalSales / salesByMonth.length).toFixed(0)}k</span>
          </div>
        </div>
      </div>
    </div>
  );
}
