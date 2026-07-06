'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Search, 
  FileSpreadsheet, 
  TrendingUp, 
  Activity, 
  AlertTriangle, 
  XOctagon, 
  Eye, 
  ChevronLeft, 
  ChevronRight,
  PackagePlus,
  Box,
  Filter,
  Pencil,
  Trash
} from 'lucide-react';
import * as XLSX from 'xlsx';

interface InventoryItem {
  productId: string;
  productCode: string;
  productName: string;
  unit: string;
  basePrice: number;
  salesIvaPercent: number;
  purchasePrice: number;
  purchaseIvaPercent: number;
  brand: string | null;
  providerName: string | null;
  currentStock: number;
  imageUrl?: string;
  category?: {
    id: string;
    name: string;
  };
}

export default function InventoryPage() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<{id: string, name: string}[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>({ key: 'productName', direction: 'asc' });

  // Pagination and Stats
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [stats, setStats] = useState({ high: 0, medium: 0, low: 0, outOfStock: 0 });

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, statusFilter, selectedCategory]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => clearTimeout(handler);
  }, [search]);

  useEffect(() => {
    fetchCategories();
    fetchStats();
  }, []);

  useEffect(() => {
    fetchInventory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, statusFilter, selectedCategory, currentPage, sortConfig]);

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

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/categories`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('access_token');
      const params = new URLSearchParams();
      if (debouncedSearch) params.append('search', debouncedSearch);
      if (statusFilter) params.append('status', statusFilter);
      if (selectedCategory) params.append('categoryId', selectedCategory);
      params.append('page', currentPage.toString());
      params.append('limit', '10');

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/inventory?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.ok) {
        const data = await response.json();
        if (data.data) {
          setInventory(data.data);
          setTotalPages(data.totalPages || 1);
          setTotalItems(data.total || 0);
        } else {
          setInventory(data);
        }
      }
    } catch (error) {
      console.error('Error fetching inventory:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este producto? Esta acción no se puede deshacer.')) return;
    
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        // Actualizar estadísticas y tabla
        fetchStats();
        fetchInventory();
      } else {
        alert('No se pudo eliminar el producto.');
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Ocurrió un error al eliminar el producto.');
    }
  };

  const exportToExcel = () => {
    const dataToExport = sortedInventory.map(item => ({
      'Código': item.productCode,
      'Producto': item.productName,
      'Marca': item.brand || '-',
      'Categoría': item.category?.name || '-',
      'Proveedor': item.providerName || '-',
      'Unidad': item.unit,
      'P. Compra (Sin IVA)': item.purchasePrice,
      'P. Compra (+ IVA)': item.purchasePrice * (1 + (item.purchaseIvaPercent / 100)),
      'P. Venta (Sin IVA)': item.basePrice,
      'P. Venta (+ IVA)': item.basePrice * (1 + (item.salesIvaPercent / 100)),
      'Stock Actual': item.currentStock,
      'Estado': getStockStatus(item.currentStock).label
    }));

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Inventario');
    XLSX.writeFile(wb, `Inventario_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const getStockStatus = (stock: number) => {
    if (stock <= 0) {
      return {
        label: 'Agotado',
        class: 'bg-rose-50 text-rose-700 border-rose-200',
      };
    } else if (stock <= 10) {
      return {
        label: 'Stock Bajo',
        class: 'bg-amber-50 text-amber-700 border-amber-200',
      };
    } else if (stock < 50) {
      return {
        label: 'Stock Medio',
        class: 'bg-blue-50 text-blue-700 border-blue-200',
      };
    } else {
      return {
        label: 'Stock Alto',
        class: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      };
    }
  };

  const requestSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key: string) => {
    if (!sortConfig || sortConfig.key !== key) {
      return (
        <svg className="w-3 h-3 ml-1 text-gray-400 group-hover:text-gray-600 transition-colors" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      );
    }
    return sortConfig.direction === 'asc' ? (
      <svg className="w-3 h-3 ml-1 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
      </svg>
    ) : (
      <svg className="w-3 h-3 ml-1 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    );
  };

  const sortedInventory = [...inventory].sort((a, b) => {
    if (!sortConfig) return 0;

    let aValue: any;
    let bValue: any;

    if (sortConfig.key === 'category') {
      aValue = a.category?.name || '';
      bValue = b.category?.name || '';
    } else {
      aValue = a[sortConfig.key as keyof InventoryItem];
      bValue = b[sortConfig.key as keyof InventoryItem];
    }

    if (aValue < bValue) {
      return sortConfig.direction === 'asc' ? -1 : 1;
    }
    if (aValue > bValue) {
      return sortConfig.direction === 'asc' ? 1 : -1;
    }
    return 0;
  });

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header Premium */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
            Inventario
          </h1>
          <p className="text-gray-500 mt-1">
            Gestiona tus productos, categorías y controla el stock
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={exportToExcel}
            className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm font-medium"
          >
            <FileSpreadsheet className="w-4 h-4 text-green-600" />
            <span>Exportar</span>
          </button>
          <Link
            href="/productos/crear"
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 hover:shadow-lg hover:-translate-y-0.5 transition-all font-medium"
          >
            <PackagePlus className="w-4 h-4" />
            <span>Nuevo Producto</span>
          </Link>
        </div>
      </div>

      {/* KPIs Premium */}
      <div className="mb-8 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="relative overflow-hidden bg-gradient-to-br from-emerald-50 to-teal-100/50 border border-emerald-100 rounded-2xl p-6 shadow-sm hover:-translate-y-1 hover:shadow-md transition-all duration-300 group">
          <div className="absolute -right-4 -bottom-4 text-emerald-500/10 group-hover:scale-110 transition-transform duration-500">
            <TrendingUp className="w-32 h-32" />
          </div>
          <div className="relative z-10">
            <div className="text-emerald-700 text-sm font-semibold mb-1 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
              Stock Alto
            </div>
            <div className="text-4xl font-bold text-gray-900 tracking-tight">
              {stats.high}
            </div>
          </div>
        </div>

        <div className="relative overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-100/50 border border-blue-100 rounded-2xl p-6 shadow-sm hover:-translate-y-1 hover:shadow-md transition-all duration-300 group">
          <div className="absolute -right-4 -bottom-4 text-blue-500/10 group-hover:scale-110 transition-transform duration-500">
            <Activity className="w-32 h-32" />
          </div>
          <div className="relative z-10">
            <div className="text-blue-700 text-sm font-semibold mb-1 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-500"></div>
              Stock Medio
            </div>
            <div className="text-4xl font-bold text-gray-900 tracking-tight">
              {stats.medium}
            </div>
          </div>
        </div>

        <div className="relative overflow-hidden bg-gradient-to-br from-amber-50 to-orange-100/50 border border-amber-100 rounded-2xl p-6 shadow-sm hover:-translate-y-1 hover:shadow-md transition-all duration-300 group">
          <div className="absolute -right-4 -bottom-4 text-amber-500/10 group-hover:scale-110 transition-transform duration-500">
            <AlertTriangle className="w-32 h-32" />
          </div>
          <div className="relative z-10">
            <div className="text-amber-700 text-sm font-semibold mb-1 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></div>
              Stock Bajo
            </div>
            <div className="text-4xl font-bold text-gray-900 tracking-tight">
              {stats.low}
            </div>
          </div>
        </div>

        <div className="relative overflow-hidden bg-gradient-to-br from-rose-50 to-red-100/50 border border-rose-100 rounded-2xl p-6 shadow-sm hover:-translate-y-1 hover:shadow-md transition-all duration-300 group">
          <div className="absolute -right-4 -bottom-4 text-rose-500/10 group-hover:scale-110 transition-transform duration-500">
            <XOctagon className="w-32 h-32" />
          </div>
          <div className="relative z-10">
            <div className="text-rose-700 text-sm font-semibold mb-1 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-rose-500"></div>
              Agotado
            </div>
            <div className="text-4xl font-bold text-gray-900 tracking-tight">
              {stats.outOfStock}
            </div>
          </div>
        </div>
      </div>

      <div className="mb-6 flex flex-col md:flex-row gap-4 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por nombre o código..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          />
        </div>
        <div className="w-full md:w-1/3 relative">
          <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all appearance-none"
          >
            <option value="">Todas las Categorías</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>
        <div className="w-full md:w-1/3 relative">
          <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all appearance-none"
          >
            <option value="">Todos los Estados</option>
            <option value="ALTO">Stock Alto</option>
            <option value="MEDIO">Stock Medio</option>
            <option value="BAJO">Stock Bajo</option>
            <option value="AGOTADO">Agotado</option>
          </select>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th 
                  className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer group hover:bg-gray-100 transition-colors"
                  onClick={() => requestSort('productCode')}
                >
                  <div className="flex items-center">
                    Código {getSortIcon('productCode')}
                  </div>
                </th>
                <th 
                  className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer group hover:bg-gray-100 transition-colors"
                  onClick={() => requestSort('productName')}
                >
                  <div className="flex items-center">
                    Producto {getSortIcon('productName')}
                  </div>
                </th>
                <th 
                  className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer group hover:bg-gray-100 transition-colors"
                  onClick={() => requestSort('category')}
                >
                  <div className="flex items-center">
                    Categoría {getSortIcon('category')}
                  </div>
                </th>
                <th 
                  className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer group hover:bg-gray-100 transition-colors"
                  onClick={() => requestSort('brand')}
                >
                  <div className="flex items-center">
                    Marca {getSortIcon('brand')}
                  </div>
                </th>
                <th 
                  className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer group hover:bg-gray-100 transition-colors"
                  onClick={() => requestSort('providerName')}
                >
                  <div className="flex items-center">
                    Proveedor {getSortIcon('providerName')}
                  </div>
                </th>
                <th 
                  className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer group hover:bg-gray-100 transition-colors"
                  onClick={() => requestSort('unit')}
                >
                  <div className="flex items-center">
                    Unidad {getSortIcon('unit')}
                  </div>
                </th>
                <th 
                  className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer group hover:bg-gray-100 transition-colors"
                  onClick={() => requestSort('purchasePrice')}
                >
                  <div className="flex items-center justify-end">
                    P. Compra (Sin IVA) {getSortIcon('purchasePrice')}
                  </div>
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  P. Compra (+ IVA)
                </th>
                <th 
                  className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer group hover:bg-gray-100 transition-colors"
                  onClick={() => requestSort('basePrice')}
                >
                  <div className="flex items-center justify-end">
                    P. Venta (Sin IVA) {getSortIcon('basePrice')}
                  </div>
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  P. Venta (+ IVA)
                </th>
                <th 
                  className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer group hover:bg-gray-100 transition-colors"
                  onClick={() => requestSort('currentStock')}
                >
                  <div className="flex items-center justify-end">
                    Stock Actual {getSortIcon('currentStock')}
                  </div>
                </th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={13} className="px-6 py-12 text-center text-gray-500">
                    <div className="flex items-center justify-center gap-3">
                      <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                      Cargando inventario...
                    </div>
                  </td>
                </tr>
              ) : sortedInventory.length === 0 ? (
                <tr>
                  <td colSpan={13} className="px-6 py-12 text-center text-gray-500">
                    {search || statusFilter || selectedCategory 
                      ? 'No se encontraron productos con los filtros aplicados'
                      : 'No hay productos en el inventario'}
                  </td>
                </tr>
              ) : (
                sortedInventory.map((item) => {
                  const status = getStockStatus(item.currentStock);
                  return (
                    <tr key={item.productId} className="group border-b border-gray-50 hover:bg-gray-50/80 transition-all duration-200">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-700">
                        {item.productCode}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          {item.imageUrl ? (
                            <img src={item.imageUrl} alt={item.productName} className="w-10 h-10 rounded-xl object-cover border border-gray-100 shadow-sm" />
                          ) : (
                            <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center border border-gray-100 shadow-sm">
                              <Box className="w-5 h-5 text-gray-400" />
                            </div>
                          )}
                          <span className="text-sm text-gray-900 font-medium">{item.productName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span className="px-2.5 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs font-medium">
                          {item.category?.name || 'Sin Categoría'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-medium">
                        {item.brand || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {item.providerName || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-medium">
                        {item.unit}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right font-mono">
                        ${item.purchasePrice.toLocaleString('es-CO')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right font-mono font-medium">
                        ${(item.purchasePrice * (1 + (item.purchaseIvaPercent / 100))).toLocaleString('es-CO')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right font-mono">
                        ${item.basePrice.toLocaleString('es-CO')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right font-mono font-medium">
                        ${(item.basePrice * (1 + (item.salesIvaPercent / 100))).toLocaleString('es-CO')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right font-mono font-bold">
                        {item.currentStock.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${status.class} shadow-sm`}>
                          {status.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-200">
                          <Link 
                            href={`/inventario/${item.productId}/movimientos`}
                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200"
                            title="Ver Movimientos"
                          >
                            <Eye className="w-5 h-5" />
                          </Link>
                          <Link 
                            href={`/productos/editar/${item.productId}`}
                            className="p-2 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-all duration-200"
                            title="Editar Producto"
                          >
                            <Pencil className="w-5 h-5" />
                          </Link>
                          <button
                            onClick={() => handleDeleteProduct(item.productId)}
                            className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all duration-200"
                            title="Eliminar Producto"
                          >
                            <Trash className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Mostrando página <span className="font-medium text-gray-900">{currentPage}</span> de <span className="font-medium text-gray-900">{totalPages}</span> ({totalItems} productos en total)
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Anterior
            </button>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages || totalPages === 0}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
