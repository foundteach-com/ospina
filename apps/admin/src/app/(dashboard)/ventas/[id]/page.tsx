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
    salesIvaPercent: string;
  };
}

interface Sale {
  id: string;
  date: string;
  referenceNumber?: string;
  total: string;
  status: string;
  notes?: string;
  documentUrl?: string;
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

  if (loading) return <div className="p-8 text-gray-900 text-center">Cargando detalles de la venta...</div>;
  if (!sale) return <div className="p-8 text-gray-900 text-center">Venta no encontrada</div>;

  const calculateBreakdown = () => {
    return sale.items.reduce((acc, item) => {
      const quantity = parseFloat(item.quantity.toString());
      const totalLine = quantity * parseFloat(item.salePrice);
      const ivaPerc = parseFloat(item.product.salesIvaPercent || '19');
      
      const baseLine = totalLine / (1 + (ivaPerc / 100));
      const ivaLine = totalLine - baseLine;
      
      acc.subtotalBase += baseLine;
      acc.ivaTotal += ivaLine;
      acc.totalGross += totalLine;
      
      return acc;
    }, { subtotalBase: 0, ivaTotal: 0, totalGross: 0 });
  };

  const breakdown = calculateBreakdown();

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link href="/ventas" className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-500 hover:text-gray-900">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Detalle de Venta</h1>
            <p className="text-gray-500">Ref: {sale.referenceNumber || sale.id}</p>
          </div>
        </div>
        <div className="flex gap-3">
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
          <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4">Información del Cliente</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-xs text-gray-500 mb-1">Nombre / Razón Social</div>
              <div className="text-gray-900 font-medium">{sale.client.name}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-1">NIT / Cédula</div>
              <div className="text-gray-900 font-mono">{sale.client.taxId}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-1">Email</div>
              <div className="text-gray-900">{sale.client.email || '-'}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-1">Teléfono</div>
              <div className="text-gray-900">{sale.client.phone || '-'}</div>
            </div>
            <div className="col-span-2">
              <div className="text-xs text-gray-500 mb-1">Dirección</div>
              <div className="text-gray-900">{sale.client.address || '-'}</div>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4">Resumen</h2>
          <div className="space-y-4">
            <div>
              <div className="text-xs text-gray-500 mb-1">Fecha</div>
              <div className="text-gray-900">
                {new Date(sale.date).toLocaleDateString('es-CO', { timeZone: 'UTC' })}
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-1">Estado</div>
              <span className={`px-2 py-1 text-xs font-medium rounded-full border ${
                sale.status === 'COMPLETED' ? 'bg-green-100 text-green-700 border-green-200' :
                sale.status === 'CANCELLED' ? 'bg-red-100 text-red-700 border-red-200' :
                'bg-yellow-100 text-yellow-700 border-yellow-200'
              }`}>
                {sale.status === 'COMPLETED' ? 'Completada' :
                 sale.status === 'CANCELLED' ? 'Cancelada' : 'Pendiente'}
              </span>
            </div>
            <div className="pt-4 border-t border-gray-200 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Subtotal (Base)</span>
                <span className="text-gray-900 font-medium">${breakdown.subtotalBase.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">IVA</span>
                <span className="text-gray-900 font-medium">${breakdown.ivaTotal.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              <div className="pt-2 border-t border-gray-100">
                <div className="text-xs text-gray-500 mb-1">Total de la Venta</div>
                <div className="text-3xl font-bold text-green-600">${breakdown.totalGross.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden mb-8 shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
          <h2 className="text-lg font-bold text-gray-900">Productos / Servicios</h2>
          <span className="text-gray-500 text-sm">{sale.items.length} items</span>
        </div>
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 text-xs font-medium text-gray-500 uppercase tracking-wider">
              <th className="px-6 py-3 text-left">Código</th>
              <th className="px-6 py-3 text-left">Producto</th>
              <th className="px-6 py-3 text-right">Cantidad</th>
              <th className="px-6 py-3 text-right">Precio Unit.</th>
              <th className="px-6 py-3 text-right">Subtotal</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {sale.items.map((item) => (
              <tr key={item.id} className="text-sm">
                <td className="px-6 py-4 text-gray-500 font-mono">{item.product.code}</td>
                <td className="px-6 py-4">
                  <div className="text-gray-900 font-medium">{item.product.name}</div>
                  <div className="text-xs text-gray-500 capitalize">{item.product.unit}</div>
                </td>
                <td className="px-6 py-4 text-right text-gray-900">{parseFloat(item.quantity.toString()).toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                <td className="px-6 py-4 text-right text-gray-900">${parseFloat(item.salePrice).toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                <td className="px-6 py-4 text-right text-green-600 font-medium">
                  ${(parseFloat(item.quantity.toString()) * parseFloat(item.salePrice)).toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-gray-50 border-t border-gray-200">
            <tr>
              <td colSpan={4} className="px-6 py-2 text-right text-xs font-medium text-gray-500 uppercase">Subtotal (Base)</td>
              <td className="px-6 py-2 text-right text-sm font-semibold text-gray-900">
                ${breakdown.subtotalBase.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </td>
            </tr>
            <tr>
              <td colSpan={4} className="px-6 py-2 text-right text-xs font-medium text-gray-500 uppercase">IVA</td>
              <td className="px-6 py-2 text-right text-sm font-semibold text-gray-900">
                ${breakdown.ivaTotal.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </td>
            </tr>
            <tr className="bg-green-50/50">
              <td colSpan={4} className="px-6 py-4 text-right text-sm font-bold text-gray-900 uppercase">Total Final</td>
              <td className="px-6 py-4 text-right text-xl font-bold text-green-600">
                ${breakdown.totalGross.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {sale.notes && (
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Notas / Observaciones</h2>
          <p className="text-gray-700 italic">{sale.notes}</p>
        </div>
      )}

      {sale.documentUrl && (
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Documento / Soporte</h2>
            <a
              href={sale.documentUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-1.5 bg-gray-800 hover:bg-gray-900 text-white rounded-lg text-xs font-medium transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" x2="21" y1="14" y2="3"/></svg>
              Abrir en nueva pestaña
            </a>
          </div>
          <div className="border border-gray-200 rounded-xl overflow-hidden h-[600px] bg-gray-50">
            <iframe
              src={sale.documentUrl}
              className="w-full h-full"
              title="Documento de soporte de venta"
            />
          </div>
        </div>
      )}
    </div>
  );
}
