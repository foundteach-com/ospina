'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

  interface Purchase {
  id: string;
  date: string;
  referenceNumber: string;
  total: string;
  provider: {
    id: string;
    name: string;
    taxId: string;
    email?: string;
    phone?: string;
  };
  items: {
    id: string;
    quantity: string;
    purchasePrice: string;
    product: {
      name: string;
    };
  }[];
}

export default function PurchasesPage() {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [filteredPurchases, setFilteredPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const [userRole, setUserRole] = useState<string>('');

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const user = JSON.parse(userData);
      setUserRole(user.role);
    }
  }, []);

  useEffect(() => {
    fetchPurchases();
  }, []);

  useEffect(() => {
    const filtered = purchases.filter(purchase => {
      const search = searchTerm.toLowerCase();
      return (
        purchase.provider.name.toLowerCase().includes(search) ||
        (purchase.provider.taxId || '').toLowerCase().includes(search) ||
        (purchase.provider.email || '').toLowerCase().includes(search) ||
        (purchase.provider.phone || '').toLowerCase().includes(search)
      );
    });
    setFilteredPurchases(filtered);
  }, [searchTerm, purchases]);

  const fetchPurchases = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/purchases`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setPurchases(data);
        setFilteredPurchases(data);
      }
    } catch (error) {
      console.error('Error fetching purchases:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    const headers = ['NIT', 'Marca Comercial', 'Correo', 'Celular', 'Productos', 'Total'];
    const csvContent = [
      headers.join(','),
      ...filteredPurchases.map(p => [
        p.provider.taxId || 'N/A',
        p.provider.name,
        p.provider.email || 'N/A',
        p.provider.phone || 'N/A',
        p.items.length,
        parseFloat(p.total)
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `movimientos_compras_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Está seguro de eliminar esta compra?')) return;
    
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/purchases/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        fetchPurchases();
      }
    } catch (error) {
      console.error('Error deleting purchase:', error);
    }
  };

  if (loading) return <div className="p-8 text-white">Cargando...</div>;

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Movimientos de Compras
          </h1>
          <p className="text-gray-500 mt-1">Gestión avanzada de registros de proveedores</p>
        </div>
        <div className="flex gap-4">
          <button
            onClick={handleExport}
            className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors flex items-center gap-2 shadow-sm font-medium"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
            Exportar CSV
          </button>
          {userRole !== 'VIEWER' && (
            <Link
              href="/compras/crear"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors flex items-center gap-2 shadow-sm font-medium"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
              Nueva Compra
            </Link>
          )}
        </div>
      </div>

      <div className="mb-6">
        <div className="relative max-w-md">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          </span>
          <input
            type="text"
            placeholder="Buscar por Marca, NIT, correo o celular..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
          />
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">NIT</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Marca Comercial</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Correo</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Celular</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Productos</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Total</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredPurchases.map((purchase) => (
                <tr key={purchase.id} className="hover:bg-gray-50 transition-colors group">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                    {purchase.provider.taxId || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-bold uppercase">
                    {purchase.provider.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <a href={`mailto:${purchase.provider.email}`} className="hover:text-blue-600 transition-colors">
                      {purchase.provider.email || 'N/A'}
                    </a>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {purchase.provider.phone || 'N/A'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    <span className="px-2 py-1 bg-gray-100 rounded-md text-xs font-medium">
                      {purchase.items.length} ítem(s)
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-green-600 font-bold">
                    ${parseFloat(purchase.total).toLocaleString('es-CO')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end gap-1">
                      <Link 
                        href={`/compras/${purchase.id}`} 
                        title="Ver Detalles"
                        className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0z"/><circle cx="12" cy="12" r="3"/></svg>
                      </Link>
                      {userRole !== 'VIEWER' && (
                        <>
                          <Link 
                            href={`/compras/editar/${purchase.id}`} 
                            title="Editar"
                            className="p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-all"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
                          </Link>
                          <button 
                            onClick={() => handleDelete(purchase.id)} 
                            title="Eliminar"
                            className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {purchases.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    No hay compras registradas
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
