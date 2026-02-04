'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface InventoryItem {
  productId: string;
  productCode: string;
  productName: string;
  unit: string;
  basePrice: number;
  currentStock: number;
  category?: {
    id: string;
    name: string;
  };
}

export default function InventoryPage() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [lowStockOnly, setLowStockOnly] = useState(false);

  useEffect(() => {
    fetchInventory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, lowStockOnly]);

  const fetchInventory = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (lowStockOnly) params.append('lowStock', 'true');

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
        setInventory(data);
      }
    } catch (error) {
      console.error('Error fetching inventory:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStockStatus = (stock: number) => {
    if (stock === 0) {
      return {
        label: 'Agotado',
        class: 'bg-red-500/10 text-red-500 border-red-500/20',
      };
    } else if (stock < 10) {
      return {
        label: 'Stock Bajo',
        class: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
      };
    } else if (stock < 50) {
      return {
        label: 'Stock Medio',
        class: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
      };
    } else {
      return {
        label: 'Stock Alto',
        class: 'bg-green-500/10 text-green-500 border-green-500/20',
      };
    }
  };

  if (loading) return <div className="p-8 text-white">Cargando...</div>;

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Inventario
        </h1>
      </div>

      <div className="mb-6 flex gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Buscar por nombre o código..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 shadow-sm"
          />
        </div>
        <button
          onClick={() => setLowStockOnly(!lowStockOnly)}
          className={`px-4 py-2 rounded-lg transition-colors shadow-sm ${
            lowStockOnly
              ? 'bg-yellow-50 text-yellow-700 border border-yellow-200'
              : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
          }`}
        >
          {lowStockOnly ? 'Mostrar Todos' : 'Solo Stock Bajo'}
        </button>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Código
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Producto
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Categoría
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Unidad
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Precio Base
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Stock Actual
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
              {inventory.map((item) => {
                const status = getStockStatus(item.currentStock);
                // Dynamically mapping status classes for light theme
                let lightStatusClass = '';
                if (item.currentStock === 0) lightStatusClass = 'bg-red-50 text-red-700 border-red-200';
                else if (item.currentStock < 10) lightStatusClass = 'bg-yellow-50 text-yellow-700 border-yellow-200';
                else if (item.currentStock < 50) lightStatusClass = 'bg-blue-50 text-blue-700 border-blue-200';
                else lightStatusClass = 'bg-green-50 text-green-700 border-green-200';

                return (
                  <tr key={item.productId} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-500">
                      {item.productCode}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {item.productName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.category?.name || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.unit}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-green-600 font-medium">
                      ${item.basePrice.toLocaleString('es-CO')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-bold text-gray-900">
                      {item.currentStock.toLocaleString('es-CO')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full border ${lightStatusClass}`}
                      >
                        {status.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <Link
                        href={`/inventario/${item.productId}/movimientos`}
                        title="Ver Detalles"
                        className="p-2 inline-block text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0z"/><circle cx="12" cy="12" r="3"/></svg>
                      </Link>
                    </td>
                  </tr>
                );
              })}
              {inventory.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                    {search || lowStockOnly 
                      ? 'No se encontraron productos con los filtros aplicados'
                      : 'No hay productos en el inventario'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border border-green-200 rounded-2xl p-6 shadow-sm">
          <div className="text-green-600 text-sm font-medium mb-2">Stock Alto</div>
          <div className="text-3xl font-bold text-gray-900">
            {inventory.filter(i => i.currentStock >= 50).length}
          </div>
        </div>
        <div className="bg-white border border-blue-200 rounded-2xl p-6 shadow-sm">
          <div className="text-blue-600 text-sm font-medium mb-2">Stock Medio</div>
          <div className="text-3xl font-bold text-gray-900">
            {inventory.filter(i => i.currentStock >= 10 && i.currentStock < 50).length}
          </div>
        </div>
        <div className="bg-white border border-yellow-200 rounded-2xl p-6 shadow-sm">
          <div className="text-yellow-600 text-sm font-medium mb-2">Stock Bajo</div>
          <div className="text-3xl font-bold text-gray-900">
            {inventory.filter(i => i.currentStock > 0 && i.currentStock < 10).length}
          </div>
        </div>
        <div className="bg-white border border-red-200 rounded-2xl p-6 shadow-sm">
          <div className="text-red-600 text-sm font-medium mb-2">Agotado</div>
          <div className="text-3xl font-bold text-gray-900">
            {inventory.filter(i => i.currentStock === 0).length}
          </div>
        </div>
      </div>
    </div>
  );
}
