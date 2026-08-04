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
  ComposedChart,
} from 'recharts';
import { ChevronUp, ChevronDown, Search } from 'lucide-react';
import KPICard from '@/components/dashboard/KPICard';
import ChartCard from '@/components/dashboard/ChartCard';
import { formatCurrency } from '@/lib/formatters';

interface InventoryItem {
  productId: string;
  productCode: string;
  productName: string;
  unit: string | null;
  measurementQuantity: number | null;
  currentStock: number;
  basePrice: number;
  providerName: string | null;
}

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

interface InventoryStats {
  high: number;
  medium: number;
  low: number;
  outOfStock: number;
}

interface LowStockItem {
  productId: string;
  productCode: string;
  productName: string;
  unit: string | null;
  currentStock: number;
  providerName: string | null;
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

  // NUEVO ESTADO PARA DETALLE
  const [allSales, setAllSales] = useState<any[]>([]);
  const [clientFilter, setClientFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' } | null>(null);
  const ITEMS_PER_PAGE = 8;

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
        const [sales, products, clients, detailedSales] = await Promise.all([
          apiFetch(`/dashboard/sales-by-month?year=${salesYear}`),
          apiFetch(`/dashboard/top-products?limit=6`),
          apiFetch(`/dashboard/top-clients?limit=6`),
          apiFetch(`/sales?year=${salesYear}`)
        ]);
        if (!active) return;
        setSalesByMonth(Array.isArray(sales) ? sales : []);
        setTopProducts(Array.isArray(products) ? products : []);
        setTopClients(Array.isArray(clients) ? clients : []);
        setAllSales(Array.isArray(detailedSales) ? detailedSales : []);
        setCurrentPage(1); // Reset page on year change
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

  // ======= LÓGICA DE DETALLE Y GRÁFICO SINCRONIZADO =======
  const flattenedSalesItems = useMemo(() => {
    const items: any[] = [];
    allSales.forEach(sale => {
      sale.items?.forEach((item: any) => {
        items.push({
          id: item.id,
          saleId: sale.id,
          date: new Date(sale.date),
          clientName: sale.client?.name || 'Consumidor Final',
          productCode: item.product?.code || '',
          productName: item.product?.name || '',
          measurementQuantity: item.product?.measurementQuantity || 1,
          measurementUnit: item.product?.measurementUnit || 'UN',
          quantity: Number(item.quantity),
          salePrice: Number(item.salePrice),
          salesIvaPercent: Number(item.product?.salesIvaPercent || 19),
        });
      });
    });
    return items;
  }, [allSales]);

  const filteredSalesItems = useMemo(() => {
    let result = flattenedSalesItems;
    if (clientFilter) {
      const lowerFilter = clientFilter.toLowerCase();
      result = result.filter(item => item.clientName.toLowerCase().includes(lowerFilter));
    }
    return result;
  }, [flattenedSalesItems, clientFilter]);

  const dynamicChartData = useMemo(() => {
    const months = MONTH_LABELS.map(label => ({
      month: label,
      cantidad: 0,
      valorTotal: 0
    }));

    filteredSalesItems.forEach(item => {
      const monthIndex = item.date.getMonth();
      const valSinIva = item.quantity * item.salePrice;
      const valConIva = valSinIva * (1 + item.salesIvaPercent / 100);
      
      months[monthIndex].cantidad += item.quantity;
      months[monthIndex].valorTotal += valConIva;
    });
    return months;
  }, [filteredSalesItems]);

  const totalsFiltrados = useMemo(() => {
    return filteredSalesItems.reduce((acc, item) => {
      const valSinIva = item.quantity * item.salePrice;
      const valConIva = valSinIva * (1 + item.salesIvaPercent / 100);
      acc.cantidad += item.quantity;
      acc.sinIva += valSinIva;
      acc.conIva += valConIva;
      return acc;
    }, { cantidad: 0, sinIva: 0, conIva: 0 });
  }, [filteredSalesItems]);
  
  const sortedSalesItems = useMemo(() => {
    if (!sortConfig) return filteredSalesItems;
    return [...filteredSalesItems].sort((a, b) => {
      let aVal = a[sortConfig.key];
      let bVal = b[sortConfig.key];
      
      if (sortConfig.key === 'totalSinIva') {
        aVal = a.quantity * a.salePrice;
        bVal = b.quantity * b.salePrice;
      } else if (sortConfig.key === 'totalConIva') {
        aVal = (a.quantity * a.salePrice) * (1 + a.salesIvaPercent / 100);
        bVal = (b.quantity * b.salePrice) * (1 + b.salesIvaPercent / 100);
      }
      
      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredSalesItems, sortConfig]);

  const paginatedSalesItems = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return sortedSalesItems.slice(start, start + ITEMS_PER_PAGE);
  }, [sortedSalesItems, currentPage]);

  const totalPages = Math.max(1, Math.ceil(sortedSalesItems.length / ITEMS_PER_PAGE));
  
  const handleSort = (key: string) => {
    setSortConfig(current => {
      if (!current || current.key !== key) return { key, direction: 'asc' };
      if (current.direction === 'asc') return { key, direction: 'desc' };
      return null;
    });
  };

  const SortIcon = ({ columnKey }: { columnKey: string }) => {
    if (sortConfig?.key !== columnKey) return <ChevronUp className="w-3 h-3 text-gray-300 opacity-0 group-hover:opacity-100" />;
    return sortConfig.direction === 'asc' ? <ChevronUp className="w-3 h-3 text-blue-600" /> : <ChevronDown className="w-3 h-3 text-blue-600" />;
  };
  // ========================================================

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

          {/* Gráficos Generales Originales */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <ChartCard title="Ventas Generales por Mes" subtitle={`Evolución durante ${salesYear}`}>
              <ResponsiveContainer width="100%" height={320}>
                <LineChart data={monthlyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tickFormatter={(v) => compactCurrency(v)} tick={{ fontSize: 11 }} width={70} />
                  <Tooltip content={<CurrencyTooltip />} />
                  <Legend />
                  <Line type="monotone" dataKey="ventas" name="Ventas" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>

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
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
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

            {/* Nuevo Gráfico Interactivo de Ventas Sincronizado */}
            <ChartCard title="Comportamiento de Ventas (Detalle)" subtitle="Actualizado por el filtro de la tabla">
              <ResponsiveContainer width="100%" height={320}>
                <ComposedChart data={dynamicChartData} margin={{ top: 10, right: 30, left: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis yAxisId="left" tickFormatter={(v) => compactCurrency(v)} tick={{ fontSize: 11 }} width={70} orientation="left" />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} width={40} />
                  <Tooltip 
                    formatter={(value: any, name: any) => {
                      if (name === "Valor Total") return formatCurrency(Number(value));
                      return [value, "Cantidad"];
                    }} 
                  />
                  <Legend />
                  <Bar yAxisId="right" dataKey="cantidad" name="Cantidad" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={30} />
                  <Line yAxisId="left" type="monotone" dataKey="valorTotal" name="Valor Total" stroke="#f59e0b" strokeWidth={3} dot={{ r: 4 }} />
                </ComposedChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>

          {/* Nueva Tabla de Detalle de Ventas */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mt-6">
            <div className="p-5 border-b border-gray-200 flex flex-col md:flex-row justify-between items-center gap-4">
              <div>
                <h3 className="text-lg font-bold text-gray-800">Detalle de Productos Vendidos</h3>
                <p className="text-sm text-gray-500">Filtrado y ordenamiento dinámico de transacciones</p>
              </div>
              <div className="relative w-full md:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input 
                  type="text" 
                  placeholder="Buscar por cliente..." 
                  value={clientFilter}
                  onChange={e => {
                    setClientFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left whitespace-nowrap">
                <thead className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-3 cursor-pointer group hover:bg-gray-100 transition-colors" onClick={() => handleSort('clientName')}>
                      <div className="flex items-center gap-1">Cliente <SortIcon columnKey="clientName" /></div>
                    </th>
                    <th className="px-6 py-3 cursor-pointer group hover:bg-gray-100 transition-colors" onClick={() => handleSort('productCode')}>
                      <div className="flex items-center gap-1">Cód <SortIcon columnKey="productCode" /></div>
                    </th>
                    <th className="px-6 py-3 cursor-pointer group hover:bg-gray-100 transition-colors" onClick={() => handleSort('productName')}>
                      <div className="flex items-center gap-1">Descripción <SortIcon columnKey="productName" /></div>
                    </th>
                    <th className="px-6 py-3">Presentación</th>
                    <th className="px-6 py-3 text-right cursor-pointer group hover:bg-gray-100 transition-colors" onClick={() => handleSort('quantity')}>
                      <div className="flex items-center justify-end gap-1">Cant Vendida <SortIcon columnKey="quantity" /></div>
                    </th>
                    <th className="px-6 py-3 text-right cursor-pointer group hover:bg-gray-100 transition-colors" onClick={() => handleSort('totalSinIva')}>
                      <div className="flex items-center justify-end gap-1">Total sin IVA <SortIcon columnKey="totalSinIva" /></div>
                    </th>
                    <th className="px-6 py-3 text-right cursor-pointer group hover:bg-gray-100 transition-colors" onClick={() => handleSort('totalConIva')}>
                      <div className="flex items-center justify-end gap-1">Total con IVA <SortIcon columnKey="totalConIva" /></div>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm">
                  {paginatedSalesItems.length > 0 ? paginatedSalesItems.map((item, idx) => {
                    const totalSinIva = item.quantity * item.salePrice;
                    const totalConIva = totalSinIva * (1 + item.salesIvaPercent / 100);
                    return (
                      <tr key={idx} className="hover:bg-blue-50/30 transition-colors">
                        <td className="px-6 py-3 text-gray-900 font-medium">{item.clientName}</td>
                        <td className="px-6 py-3 text-gray-500">{item.productCode}</td>
                        <td className="px-6 py-3 text-gray-900">{item.productName}</td>
                        <td className="px-6 py-3 text-gray-500">{item.measurementQuantity} {item.measurementUnit}</td>
                        <td className="px-6 py-3 text-right text-gray-900 font-medium">{item.quantity}</td>
                        <td className="px-6 py-3 text-right text-gray-900">{formatCurrency(totalSinIva)}</td>
                        <td className="px-6 py-3 text-right font-semibold text-emerald-700">{formatCurrency(totalConIva)}</td>
                      </tr>
                    );
                  }) : (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                        No se encontraron registros de ventas para los filtros actuales.
                      </td>
                    </tr>
                  )}
                </tbody>
                <tfoot className="bg-gray-50 border-t-2 border-gray-200 font-bold text-sm">
                  <tr>
                    <td colSpan={4} className="px-6 py-4 text-right text-gray-700">TOTALES GENERALES (Filtro Actual):</td>
                    <td className="px-6 py-4 text-right text-gray-900">{totalsFiltrados.cantidad}</td>
                    <td className="px-6 py-4 text-right text-gray-900">{formatCurrency(totalsFiltrados.sinIva)}</td>
                    <td className="px-6 py-4 text-right text-emerald-700">{formatCurrency(totalsFiltrados.conIva)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
            
            {/* Paginación */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between bg-white">
                <span className="text-sm text-gray-500">
                  Mostrando {(currentPage - 1) * ITEMS_PER_PAGE + 1} a {Math.min(currentPage * ITEMS_PER_PAGE, sortedSalesItems.length)} de {sortedSalesItems.length} registros
                </span>
                <div className="flex gap-1">
                  <button 
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    className="px-3 py-1 border border-gray-200 rounded-md text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:hover:bg-white"
                  >
                    Anterior
                  </button>
                  <button 
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    className="px-3 py-1 border border-gray-200 rounded-md text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:hover:bg-white"
                  >
                    Siguiente
                  </button>
                </div>
              </div>
            )}
          </div>

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
// INVENTARIO SECTION
// ─────────────────────────────────────────────────────────────────────────────
const STOCK_COLORS: Record<string, string> = {
  'Stock Alto': '#10b981',
  'Stock Medio': '#3b82f6',
  'Stock Bajo': '#f59e0b',
  'Agotado': '#ef4444',
};

function InventarioSection() {
  const [loadingStats, setLoadingStats] = useState(true);
  const [stats, setStats] = useState<InventoryStats | null>(null);
  const [lowStock, setLowStock] = useState<LowStockItem[]>([]);

  // Table state
  const [loadingTable, setLoadingTable] = useState(true);
  const [tableData, setTableData] = useState<InventoryItem[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [providerFilter, setProviderFilter] = useState('');
  const [measurementQuantityFilter, setMeasurementQuantityFilter] = useState('');
  const [providers, setProviders] = useState<any[]>([]);
  const [sortBy, setSortBy] = useState('productName');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const limit = 10;

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(timer);
  }, [search]);

  // Load stats
  useEffect(() => {
    let active = true;
    const loadStats = async () => {
      setLoadingStats(true);
      try {
        const [statsData, lowStockData, providersData] = await Promise.all([
          apiFetch('/inventory/stats'),
          apiFetch('/inventory/low-stock?threshold=10'),
          apiFetch('/providers'),
        ]);
        if (!active) return;
        setStats(statsData);
        setLowStock(Array.isArray(lowStockData?.data) ? lowStockData.data : []);
        setProviders(Array.isArray(providersData) ? providersData : []);
      } catch (err) {
        console.error('Error cargando stats de inventario:', err);
      } finally {
        if (active) setLoadingStats(false);
      }
    };
    loadStats();
    return () => { active = false; };
  }, []);

  // Load table data
  useEffect(() => {
    let active = true;
    const loadTable = async () => {
      setLoadingTable(true);
      try {
        const queryParams = new URLSearchParams({
          page: String(page),
          limit: String(limit),
          sortBy,
          sortOrder,
        });
        if (debouncedSearch) queryParams.append('search', debouncedSearch);
        if (statusFilter) queryParams.append('status', statusFilter);
        if (providerFilter) queryParams.append('providerId', providerFilter);
        if (measurementQuantityFilter) queryParams.append('measurementQuantity', measurementQuantityFilter);

        const data = await apiFetch(`/inventory?${queryParams.toString()}`);
        if (!active) return;
        setTableData(Array.isArray(data?.data) ? data.data : []);
        setTotalPages(data?.totalPages || 1);
      } catch (err) {
        console.error('Error cargando tabla de inventario:', err);
      } finally {
        if (active) setLoadingTable(false);
      }
    };
    loadTable();
    return () => { active = false; };
  }, [page, debouncedSearch, statusFilter, providerFilter, measurementQuantityFilter, sortBy, sortOrder]);

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
    setPage(1); // Reset page on sort
  };

  const SortIcon = ({ column }: { column: string }) => {
    if (sortBy !== column) return <div className="w-4 h-4 opacity-0 group-hover:opacity-30 transition-opacity"><ChevronDown size={16} /></div>;
    return sortOrder === 'asc' ? <ChevronUp size={16} className="text-blue-600" /> : <ChevronDown size={16} className="text-blue-600" />;
  };

  const pieData = stats
    ? [
        { name: 'Stock Alto', value: stats.high },
        { name: 'Stock Medio', value: stats.medium },
        { name: 'Stock Bajo', value: stats.low },
        { name: 'Agotado', value: stats.outOfStock },
      ].filter((d) => d.value > 0)
    : [];

  const totalProducts = stats ? stats.high + stats.medium + stats.low + stats.outOfStock : 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-800">Estado del Inventario</h2>
      </div>

      {loadingStats ? (
        <div className="flex items-center justify-center py-32">
          <div className="w-12 h-12 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {/* KPIs */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 hover:shadow-md transition-all">
              <p className="text-sm font-medium text-emerald-700 mb-1">Stock Alto</p>
              <p className="text-4xl font-bold text-emerald-600">{stats?.high ?? 0}</p>
              <p className="text-xs text-emerald-500 mt-1">≥ 50 unidades</p>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 hover:shadow-md transition-all">
              <p className="text-sm font-medium text-blue-700 mb-1">Stock Medio</p>
              <p className="text-4xl font-bold text-blue-600">{stats?.medium ?? 0}</p>
              <p className="text-xs text-blue-500 mt-1">10 – 49 unidades</p>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 hover:shadow-md transition-all">
              <p className="text-sm font-medium text-amber-700 mb-1">Stock Bajo</p>
              <p className="text-4xl font-bold text-amber-600">{stats?.low ?? 0}</p>
              <p className="text-xs text-amber-500 mt-1">1 – 9 unidades</p>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-2xl p-5 hover:shadow-md transition-all">
              <p className="text-sm font-medium text-red-700 mb-1">Agotado</p>
              <p className="text-4xl font-bold text-red-600">{stats?.outOfStock ?? 0}</p>
              <p className="text-xs text-red-500 mt-1">0 unidades</p>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* Distribución de Stock */}
            <ChartCard title="Distribución de Stock" subtitle={`${totalProducts} productos en total`}>
              {pieData.length === 0 ? <EmptyState /> : (
                <ResponsiveContainer width="100%" height={320}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={120}
                      innerRadius={60}
                      paddingAngle={3}
                      label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                      labelLine={false}
                    >
                      {pieData.map((entry, i) => (
                        <Cell key={i} fill={STOCK_COLORS[entry.name] ?? PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v: any) => [`${v} productos`, '']} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </ChartCard>

            {/* Productos con Stock Bajo */}
            <ChartCard title="Productos con Stock Bajo" subtitle="Umbral: menos de 10 unidades">
              {lowStock.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-[280px] text-emerald-500">
                  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                  <p className="mt-3 text-sm font-medium text-gray-500">¡Todo el inventario en buen nivel!</p>
                </div>
              ) : (
                <div className="overflow-auto max-h-[320px]">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-100">
                        <th className="text-left py-2 px-3 text-gray-500 font-medium">Producto</th>
                        <th className="text-left py-2 px-3 text-gray-500 font-medium">Código</th>
                        <th className="text-right py-2 px-3 text-gray-500 font-medium">Stock</th>
                      </tr>
                    </thead>
                    <tbody>
                      {lowStock.map((item) => (
                        <tr key={item.productId} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                          <td className="py-2.5 px-3 font-medium text-gray-800 max-w-[180px] truncate">{item.productName}</td>
                          <td className="py-2.5 px-3 text-gray-500 font-mono text-xs">{item.productCode}</td>
                          <td className="py-2.5 px-3 text-right">
                            <span className={`inline-flex items-center justify-center min-w-[40px] px-2 py-0.5 rounded-full text-xs font-bold ${
                              item.currentStock <= 0
                                ? 'bg-red-100 text-red-700'
                                : 'bg-amber-100 text-amber-700'
                            }`}>
                              {item.currentStock}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </ChartCard>
          </div>
          
          {/* Tabla Interactiva de Inventario */}
          <ChartCard title="Listado de Productos" subtitle="Inventario general detallado">
            <div className="mb-4 flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="relative w-full md:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Buscar por nombre o código..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                />
              </div>
              <div className="w-full md:w-auto flex flex-wrap items-center gap-2">
                <span className="text-sm font-medium text-gray-500">Cant. Medida:</span>
                <input
                  type="number"
                  min="0"
                  placeholder="Ej: 500"
                  value={measurementQuantityFilter}
                  onChange={(e) => {
                    setMeasurementQuantityFilter(e.target.value);
                    setPage(1);
                  }}
                  className="w-24 bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                {measurementQuantityFilter && (
                  <button
                    onClick={() => { setMeasurementQuantityFilter(''); setPage(1); }}
                    className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
                    title="Limpiar filtro"
                  >
                    ✕
                  </button>
                )}

                <span className="text-sm font-medium text-gray-500 ml-2">Proveedor:</span>
                <select
                  value={providerFilter}
                  onChange={(e) => {
                    setProviderFilter(e.target.value);
                    setPage(1);
                  }}
                  className="bg-white border border-gray-200 rounded-xl px-4 py-2 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 max-w-[150px] md:max-w-[200px]"
                >
                  <option value="">Todos</option>
                  {providers.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>

                <span className="text-sm font-medium text-gray-500 ml-2">Estado:</span>
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setPage(1);
                  }}
                  className="bg-white border border-gray-200 rounded-xl px-4 py-2 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Todos los Estados</option>
                  <option value="ALTO">Stock Alto</option>
                  <option value="MEDIO">Stock Medio</option>
                  <option value="BAJO">Stock Bajo</option>
                  <option value="AGOTADO">Agotado</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto rounded-xl border border-gray-100">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-gray-600 font-semibold border-b border-gray-200">
                  <tr>
                    <th className="py-3 px-4 cursor-pointer group hover:bg-gray-100 transition-colors" onClick={() => handleSort('productCode')}>
                      <div className="flex items-center gap-1">Código <SortIcon column="productCode" /></div>
                    </th>
                    <th className="py-3 px-4 cursor-pointer group hover:bg-gray-100 transition-colors" onClick={() => handleSort('productName')}>
                      <div className="flex items-center gap-1">Producto <SortIcon column="productName" /></div>
                    </th>
                    <th className="py-3 px-4 cursor-pointer group hover:bg-gray-100 transition-colors" onClick={() => handleSort('measurementQuantity')}>
                      <div className="flex items-center justify-end gap-1">Cant. Medida <SortIcon column="measurementQuantity" /></div>
                    </th>
                    <th className="py-3 px-4 cursor-pointer group hover:bg-gray-100 transition-colors" onClick={() => handleSort('unit')}>
                      <div className="flex items-center gap-1">Unidad <SortIcon column="unit" /></div>
                    </th>
                    <th className="py-3 px-4 cursor-pointer group hover:bg-gray-100 transition-colors" onClick={() => handleSort('basePrice')}>
                      <div className="flex items-center justify-end gap-1">Precio Base <SortIcon column="basePrice" /></div>
                    </th>
                    <th className="py-3 px-4 cursor-pointer group hover:bg-gray-100 transition-colors" onClick={() => handleSort('currentStock')}>
                      <div className="flex items-center justify-end gap-1">Stock <SortIcon column="currentStock" /></div>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {loadingTable ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-gray-400">
                        <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-2" />
                        Cargando productos...
                      </td>
                    </tr>
                  ) : tableData.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-gray-400">
                        <EmptyState />
                      </td>
                    </tr>
                  ) : (
                    tableData.map((item) => (
                      <tr key={item.productId} className="hover:bg-gray-50/80 transition-colors">
                        <td className="py-3 px-4 font-mono text-xs text-gray-500">{item.productCode}</td>
                        <td className="py-3 px-4 font-medium text-gray-800">{item.productName}</td>
                        <td className="py-3 px-4 text-right text-gray-700">
                          {item.measurementQuantity != null ? item.measurementQuantity : <span className="text-gray-400 text-xs italic">—</span>}
                        </td>
                        <td className="py-3 px-4 text-gray-600">
                          {item.unit ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-50 text-indigo-700">
                              {item.unit}
                            </span>
                          ) : (
                            <span className="text-gray-400 text-xs italic">—</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right text-gray-700">{formatCurrency(item.basePrice)}</td>
                        <td className="py-3 px-4 text-right">
                          <span className={`inline-flex items-center justify-center min-w-[40px] px-2.5 py-1 rounded-full text-xs font-bold ${
                            item.currentStock >= 50 ? 'bg-emerald-100 text-emerald-700' :
                            item.currentStock > 10 ? 'bg-blue-100 text-blue-700' :
                            item.currentStock > 0 ? 'bg-amber-100 text-amber-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {item.currentStock}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Paginación */}
            {!loadingTable && totalPages > 1 && (
              <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-4">
                <span className="text-sm text-gray-500">
                  Página <span className="font-semibold text-gray-700">{page}</span> de <span className="font-semibold text-gray-700">{totalPages}</span>
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    Anterior
                  </button>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    Siguiente
                  </button>
                </div>
              </div>
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
  const [activeTab, setActiveTab] = useState<'ventas' | 'compras' | 'inventario'>('ventas');

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
        <button
          onClick={() => setActiveTab('inventario')}
          className={`px-8 py-2.5 rounded-lg text-sm font-bold transition-all ${
            activeTab === 'inventario'
              ? 'bg-violet-600 text-white shadow-md'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100/80'
          }`}
        >
          Inventario
        </button>
      </div>

      {/* Content */}
      <div className="bg-white/40 p-6 rounded-3xl border border-white/60 shadow-sm">
        {activeTab === 'ventas' && <VentasSection />}
        {activeTab === 'compras' && <ComprasSection />}
        {activeTab === 'inventario' && <InventarioSection />}
      </div>
    </div>
  );
}
