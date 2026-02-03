'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';

interface SaleItem {
  id: string;
  quantity: number;
  salePrice: string;
  product: {
    name: string;
    code: string;
    unit: string;
  };
}

interface Sale {
  id: string;
  date: string;
  referenceNumber?: string;
  total: string;
  status: string;
  notes?: string;
  client: {
    name: string;
    taxId: string;
    email?: string;
    phone?: string;
    address?: string;
  };
  items: SaleItem[];
}

export default function SaleDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [sale, setSale] = useState<Sale | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSaleDetails = async () => {
      try {
        const token = localStorage.getItem('access_token');
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/sales/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.ok) {
          const data = await response.json();
          setSale(data);
        }
      } catch (error) {
        console.error('Error fetching sale details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSaleDetails();
  }, [id]);

  if (loading) return <div className="p-8 text-white text-center">Cargando detalles de la venta...</div>;
  if (!sale) return <div className="p-8 text-white text-center">Venta no encontrada</div>;

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link href="/ventas" className="p-2 hover:bg-gray-800 rounded-lg transition-colors text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-white">Detalle de Venta</h1>
            <p className="text-gray-400">Ref: {sale.referenceNumber || sale.id}</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => window.print()} 
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-all flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9V2h12v7"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect width="12" height="8" x="6" y="14"/></svg>
            Imprimir
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-6 md:col-span-2">
          <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-4">Información del Cliente</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-xs text-gray-500 mb-1">Nombre / Razón Social</div>
              <div className="text-white font-medium">{sale.client.name}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-1">NIT / Cédula</div>
              <div className="text-white font-mono">{sale.client.taxId}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-1">Email</div>
              <div className="text-white">{sale.client.email || '-'}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-1">Teléfono</div>
              <div className="text-white">{sale.client.phone || '-'}</div>
            </div>
            <div className="col-span-2">
              <div className="text-xs text-gray-500 mb-1">Dirección</div>
              <div className="text-white">{sale.client.address || '-'}</div>
            </div>
          </div>
        </div>

        <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-6">
          <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-4">Resumen</h2>
          <div className="space-y-4">
            <div>
              <div className="text-xs text-gray-500 mb-1">Fecha</div>
              <div className="text-white">{new Date(sale.date).toLocaleString('es-CO')}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-1">Estado</div>
              <span className={`px-2 py-1 text-xs font-medium rounded-full border ${
                sale.status === 'COMPLETED' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                sale.status === 'CANCELLED' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
              }`}>
                {sale.status === 'COMPLETED' ? 'Completada' :
                 sale.status === 'CANCELLED' ? 'Cancelada' : 'Pendiente'}
              </span>
            </div>
            <div className="pt-4 border-t border-gray-800">
              <div className="text-xs text-gray-500 mb-1">Total de la Venta</div>
              <div className="text-3xl font-bold text-green-400">${parseFloat(sale.total).toLocaleString('es-CO')}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl overflow-hidden mb-8">
        <div className="px-6 py-4 border-b border-gray-800 flex justify-between items-center">
          <h2 className="text-lg font-bold text-white">Productos / Servicios</h2>
          <span className="text-gray-400 text-sm">{sale.items.length} items</span>
        </div>
        <table className="w-full">
          <thead>
            <tr className="bg-gray-900/50 text-xs font-medium text-gray-400 uppercase tracking-wider">
              <th className="px-6 py-3 text-left">Código</th>
              <th className="px-6 py-3 text-left">Producto</th>
              <th className="px-6 py-3 text-right">Cantidad</th>
              <th className="px-6 py-3 text-right">Precio Unit.</th>
              <th className="px-6 py-3 text-right">Subtotal</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {sale.items.map((item) => (
              <tr key={item.id} className="text-sm">
                <td className="px-6 py-4 text-gray-500 font-mono">{item.product.code}</td>
                <td className="px-6 py-4">
                  <div className="text-white font-medium">{item.product.name}</div>
                  <div className="text-xs text-gray-500 capitalize">{item.product.unit}</div>
                </td>
                <td className="px-6 py-4 text-right text-white">{parseFloat(item.quantity.toString()).toLocaleString('es-CO')}</td>
                <td className="px-6 py-4 text-right text-white">${parseFloat(item.salePrice).toLocaleString('es-CO')}</td>
                <td className="px-6 py-4 text-right text-green-400 font-medium">
                  ${(parseFloat(item.quantity.toString()) * parseFloat(item.salePrice)).toLocaleString('es-CO')}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-gray-900/50">
              <td colSpan={4} className="px-6 py-4 text-right text-sm font-medium text-gray-400">Total Final</td>
              <td className="px-6 py-4 text-right text-xl font-bold text-green-400">
                ${parseFloat(sale.total).toLocaleString('es-CO')}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {sale.notes && (
        <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-6">
          <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-2">Notas / Observaciones</h2>
          <p className="text-gray-300 italic">{sale.notes}</p>
        </div>
      )}
    </div>
  );
}
