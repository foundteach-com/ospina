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
  const [selectedYear, setSelectedYear] = useState('2026');

  const purchasesByMonth = purchaseDataByYear[selectedYear] || purchaseDataByYear['2026'];
  const salesByMonth = salesDataByYear[selectedYear] || salesDataByYear['2026'];
  const maxPurchases = Math.max(...purchasesByMonth.map((item) => item.value));
  const maxSales = Math.max(...salesByMonth.map((item) => item.value));

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mb-6 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Inicio</h1>
          <p className="mt-1 text-gray-500">Dashboard gerencial para analizar compras y ventas por mes</p>
        </div>
        <div className="w-full md:w-44">
          <label htmlFor="year-select" className="mb-1 block text-sm font-medium text-gray-700">
            Filtrar por año
          </label>
          <select
            id="year-select"
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="2024">2024</option>
            <option value="2025">2025</option>
            <option value="2026">2026</option>
          </select>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Compras por mes</h2>
              <p className="text-sm text-gray-500">Evolución mensual de compras para {selectedYear}</p>
            </div>
            <span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700">Compras</span>
          </div>
          <div className="mt-6 flex h-64 items-end gap-3">
            {purchasesByMonth.map((item) => (
              <div key={item.month} className="flex flex-1 flex-col items-center gap-2">
                <div className="flex h-44 w-full items-end rounded-xl bg-gray-100 p-1">
                  <div
                    className="w-full rounded-lg bg-blue-500"
                    style={{ height: `${(item.value / maxPurchases) * 100}%` }}
                  />
                </div>
                <span className="text-xs font-medium text-gray-500">{item.month}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Ventas por mes</h2>
              <p className="text-sm text-gray-500">Evolución mensual de ventas para {selectedYear}</p>
            </div>
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-700">Ventas</span>
          </div>
          <div className="mt-6 flex h-64 items-end gap-3">
            {salesByMonth.map((item) => (
              <div key={item.month} className="flex flex-1 flex-col items-center gap-2">
                <div className="flex h-44 w-full items-end rounded-xl bg-gray-100 p-1">
                  <div
                    className="w-full rounded-lg bg-emerald-500"
                    style={{ height: `${(item.value / maxSales) * 100}%` }}
                  />
                </div>
                <span className="text-xs font-medium text-gray-500">{item.month}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
