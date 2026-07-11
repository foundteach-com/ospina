'use client';

const purchasesByMonth = [
  { month: 'Ene', value: 140 },
  { month: 'Feb', value: 180 },
  { month: 'Mar', value: 220 },
  { month: 'Abr', value: 260 },
  { month: 'May', value: 300 },
  { month: 'Jun', value: 280 },
];

const salesByMonth = [
  { month: 'Ene', value: 210 },
  { month: 'Feb', value: 240 },
  { month: 'Mar', value: 260 },
  { month: 'Abr', value: 310 },
  { month: 'May', value: 360 },
  { month: 'Jun', value: 390 },
];

const topProducts = [
  { name: 'Producto A', value: 42 },
  { name: 'Producto B', value: 35 },
  { name: 'Producto C', value: 28 },
];

export default function AdminPage() {
  const maxPurchases = Math.max(...purchasesByMonth.map((item) => item.value));
  const maxSales = Math.max(...salesByMonth.map((item) => item.value));

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Inicio</h1>
        <p className="mt-1 text-gray-500">Dashboard para análisis gerencial de compras, ventas y rendimiento</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-100/50 p-6 shadow-sm">
          <p className="text-sm font-semibold text-blue-700">Compras del semestre</p>
          <p className="mt-2 text-4xl font-bold text-gray-900">$1.28M</p>
        </div>
        <div className="rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-teal-100/50 p-6 shadow-sm">
          <p className="text-sm font-semibold text-emerald-700">Ventas del semestre</p>
          <p className="mt-2 text-4xl font-bold text-gray-900">$1.76M</p>
        </div>
        <div className="rounded-2xl border border-amber-100 bg-gradient-to-br from-amber-50 to-yellow-100/50 p-6 shadow-sm">
          <p className="text-sm font-semibold text-amber-700">Margen estimado</p>
          <p className="mt-2 text-4xl font-bold text-gray-900">18.4%</p>
        </div>
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Compras por mes</h2>
              <p className="text-sm text-gray-500">Evolución de compras en los últimos meses</p>
            </div>
            <span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700">Compras</span>
          </div>
          <div className="mt-6 flex h-56 items-end gap-3">
            {purchasesByMonth.map((item) => (
              <div key={item.month} className="flex flex-1 flex-col items-center gap-2">
                <div className="flex h-40 w-full items-end rounded-xl bg-gray-100 p-1">
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
              <p className="text-sm text-gray-500">Tendencia de ventas para seguimiento gerencial</p>
            </div>
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-700">Ventas</span>
          </div>
          <div className="mt-6 flex h-56 items-end gap-3">
            {salesByMonth.map((item) => (
              <div key={item.month} className="flex flex-1 flex-col items-center gap-2">
                <div className="flex h-40 w-full items-end rounded-xl bg-gray-100 p-1">
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

      <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900">Productos con mayor movimiento</h2>
        <div className="mt-4 space-y-4">
          {topProducts.map((product) => (
            <div key={product.name}>
              <div className="mb-1 flex items-center justify-between text-sm text-gray-600">
                <span>{product.name}</span>
                <span className="font-semibold text-gray-900">{product.value}%</span>
              </div>
              <div className="h-2 rounded-full bg-gray-100">
                <div className="h-2 rounded-full bg-amber-500" style={{ width: `${product.value}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
