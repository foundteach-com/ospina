'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';

interface PurchaseItem {
  id: string;
  quantity: number;
  purchasePrice: string;
  product: {
    name: string;
    code: string;
    unit: string;
  };
}

interface Purchase {
  id: string;
  date: string;
  referenceNumber: string;
  total: string;
  notes?: string;
  invoiceUrl?: string; // Added field
  provider: {
    name: string;
    taxId?: string;
    email?: string;
    phone?: string;
    address?: string;
  };
  items: PurchaseItem[];
}

export default function PurchaseDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [purchase, setPurchase] = useState<Purchase | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPurchaseDetails = async () => {
      try {
        const token = localStorage.getItem('access_token');
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/purchases/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.ok) {
          const data = await response.json();
          setPurchase(data);
        }
      } catch (error) {
        console.error('Error fetching purchase details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPurchaseDetails();
  }, [id]);

  if (loading) return <div className="p-8 text-white text-center">Cargando detalles de la compra...</div>;
  if (!purchase) return <div className="p-8 text-white text-center">Compra no encontrada</div>;

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link href="/compras" className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-500 hover:text-gray-900">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Detalle de Compra</h1>
            <p className="text-gray-500">Ref: {purchase.referenceNumber}</p>
          </div>
        </div>
        <div className="flex gap-3">
          {purchase.invoiceUrl && (
            <a 
              href={purchase.invoiceUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="px-4 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 rounded-lg transition-all flex items-center gap-2 shadow-sm font-medium"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
              Ver Factura PDF
            </a>
          )}
          <button 
            onClick={() => window.print()} 
            className="px-4 py-2 bg-gray-800 hover:bg-gray-900 text-white rounded-lg transition-all flex items-center gap-2 shadow-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9V2h12v7"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect width="12" height="8" x="6" y="14"/></svg>
            Imprimir
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white border border-gray-200 rounded-2xl p-6 md:col-span-2 shadow-sm">
          <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4">Información del Proveedor</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-xs text-gray-500 mb-1">Empresa / Proveedor</div>
              <div className="text-gray-900 font-medium">{purchase.provider.name}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-1">RUC / NIT</div>
              <div className="text-gray-900 font-mono">{purchase.provider.taxId || '-'}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-1">Email</div>
              <div className="text-gray-900">{purchase.provider.email || '-'}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-1">Teléfono</div>
              <div className="text-gray-900">{purchase.provider.phone || '-'}</div>
            </div>
            <div className="col-span-2">
              <div className="text-xs text-gray-500 mb-1">Dirección</div>
              <div className="text-gray-900">{purchase.provider.address || '-'}</div>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4">Resumen</h2>
          <div className="space-y-4">
            <div>
              <div className="text-xs text-gray-500 mb-1">Fecha de Compra</div>
              <div className="text-gray-900">{new Date(purchase.date).toLocaleDateString('es-CO')}</div>
            </div>
            <div className="pt-4 border-t border-gray-200">
              <div className="text-xs text-gray-500 mb-1">Total Pagado</div>
              <div className="text-3xl font-bold text-blue-600">${parseFloat(purchase.total).toLocaleString('es-CO')}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden mb-8 shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h2 className="text-lg font-bold text-gray-900">Productos Adquiridos</h2>
        </div>
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 text-xs font-medium text-gray-500 uppercase tracking-wider">
              <th className="px-6 py-3 text-left">Código</th>
              <th className="px-6 py-3 text-left">Producto</th>
              <th className="px-6 py-3 text-right">Cantidad</th>
              <th className="px-6 py-3 text-right">Costo Unit.</th>
              <th className="px-6 py-3 text-right">Subtotal</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {purchase.items.map((item) => (
              <tr key={item.id} className="text-sm">
                <td className="px-6 py-4 text-gray-500 font-mono">{item.product.code}</td>
                <td className="px-6 py-4">
                  <div className="text-gray-900 font-medium">{item.product.name}</div>
                  <div className="text-xs text-gray-500 capitalize">{item.product.unit}</div>
                </td>
                <td className="px-6 py-4 text-right text-gray-900">{parseFloat(item.quantity.toString()).toLocaleString('es-CO')}</td>
                <td className="px-6 py-4 text-right text-gray-900">${parseFloat(item.purchasePrice).toLocaleString('es-CO')}</td>
                <td className="px-6 py-4 text-right text-blue-600 font-medium">
                  ${(parseFloat(item.quantity.toString()) * parseFloat(item.purchasePrice)).toLocaleString('es-CO')}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-gray-50">
              <td colSpan={4} className="px-6 py-4 text-right text-sm font-medium text-gray-500">Total de la Factura</td>
              <td className="px-6 py-4 text-right text-xl font-bold text-blue-600">
                ${parseFloat(purchase.total).toLocaleString('es-CO')}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {purchase.notes && (
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Notas / Observaciones</h2>
          <p className="text-gray-700 italic">{purchase.notes}</p>
        </div>
      )}
    </div>
  );
}
