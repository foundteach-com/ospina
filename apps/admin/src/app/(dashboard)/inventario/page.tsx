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
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
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
            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
          />
        </div>
        <button
          onClick={() => setLowStockOnly(!lowStockOnly)}
          className={`px-4 py-2 rounded-lg transition-colors ${
            lowStockOnly
              ? 'bg-yellow-600 text-white'
              : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
          }`}
        >
          {lowStockOnly ? 'Mostrar Todos' : 'Solo Stock Bajo'}
        </button>
      </div>

      <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800 bg-gray-900/50">
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Código
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Producto
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Categoría
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Unidad
                </th>
                <th className="px-6 py-4 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Precio Base
                </th>
                <th className="px-6 py-4 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Stock Actual
                </th>
                <th className="px-6 py-4 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-4 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {inventory.map((item) => {
                const status = getStockStatus(item.currentStock);
                return (
                  <tr key={item.productId} className="hover:bg-gray-800/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-400">
                      {item.productCode}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                      {item.productName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                      {item.category?.name || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                      {item.unit}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-green-400 font-medium">
                      ${item.basePrice.toLocaleString('es-CO')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-bold text-white">
                      {item.currentStock.toLocaleString('es-CO')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full border ${status.class}`}
                      >
                        {status.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <Link
                        href={`/inventario/${item.productId}/movimientos`}
                        title="Ver Detalles"
                        className="p-2 inline-block text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-all"
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
        <div className="bg-gradient-to-br from-green-500/10 to-green-600/10 border border-green-500/20 rounded-2xl p-6">
          <div className="text-green-400 text-sm font-medium mb-2">Stock Alto</div>
          <div className="text-3xl font-bold text-white">
            {inventory.filter(i => i.currentStock >= 50).length}
          </div>
        </div>
        <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-blue-500/20 rounded-2xl p-6">
          <div className="text-blue-400 text-sm font-medium mb-2">Stock Medio</div>
          <div className="text-3xl font-bold text-white">
            {inventory.filter(i => i.currentStock >= 10 && i.currentStock < 50).length}
          </div>
        </div>
        <div className="bg-gradient-to-br from-yellow-500/10 to-yellow-600/10 border border-yellow-500/20 rounded-2xl p-6">
          <div className="text-yellow-400 text-sm font-medium mb-2">Stock Bajo</div>
          <div className="text-3xl font-bold text-white">
            {inventory.filter(i => i.currentStock > 0 && i.currentStock < 10).length}
          </div>
        </div>
        <div className="bg-gradient-to-br from-red-500/10 to-red-600/10 border border-red-500/20 rounded-2xl p-6">
          <div className="text-red-400 text-sm font-medium mb-2">Agotado</div>
          <div className="text-3xl font-bold text-white">
            {inventory.filter(i => i.currentStock === 0).length}
          </div>
        </div>
      </div>
    </div>
  );
}
