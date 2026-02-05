'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

interface Product {
  id: string;
  code: string;
  name: string;
  description?: string;
  brand?: string;
  measurementQuantity?: number;
  measurementUnit?: string;
  purchasePrice: number;
  purchaseIvaPercent: number;
  utilityPercent: number;
  salesIvaPercent: number;
  category?: { name: string };
  currentStock?: number;
}

export default function ProductDetailPage() {
  const params = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  const [userRole, setUserRole] = useState<string>('');

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const user = JSON.parse(userData);
      setUserRole(user.role);
    }
  }, []);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const token = localStorage.getItem('access_token');
        const [prodRes, invRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/${params.id}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/inventory`, {
            headers: { Authorization: `Bearer ${token}` },
          })
        ]);

        if (prodRes.ok && invRes.ok) {
          const data = await prodRes.json();
          const invData = await invRes.json();
          const invItem = invData.find((i: { productId: string; currentStock: number }) => i.productId === data.id);
          
          setProduct({
            ...data,
            currentStock: invItem ? invItem.currentStock : 0
          });
        }
      } catch (error) {
        console.error('Error fetching product details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [params.id]);

  if (loading) return <div className="p-8 text-white">Cargando detalles...</div>;
  if (!product) return <div className="p-8 text-white">Producto no encontrado.</div>;

  // Calculations
  const purchasePrice = Number(product.purchasePrice || 0);
  const purchaseIvaPercent = Number(product.purchaseIvaPercent || 0);
  const purchaseIvaValue = purchasePrice * (purchaseIvaPercent / 100);
  const purchasePriceWithIva = purchasePrice + purchaseIvaValue;
  
  const utilityPercent = Number(product.utilityPercent || 0);
  const utilityValue = purchasePriceWithIva * (utilityPercent / 100);
  const sellingPrice = purchasePriceWithIva + utilityValue;
  
  const salesIvaPercent = Number(product.salesIvaPercent || 0);
  const salesIvaValue = sellingPrice * (salesIvaPercent / 100);
  const sellingPriceWithIva = sellingPrice + salesIvaValue;

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <Link href="/productos" className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-500 hover:text-gray-900">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
            <p className="text-gray-500 font-mono text-sm">{product.code} • {product.brand || 'Sin Marca'}</p>
          </div>
        </div>
        <div className="flex gap-3">
          {userRole !== 'VIEWER' && (
            <Link
              href={`/productos/editar/${product.id}`}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all flex items-center gap-2 shadow-sm"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
              Editar
            </Link>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Details Card */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><line x1="3" x2="21" y1="9" y2="9"/><line x1="3" x2="21" y1="15" y2="15"/><line x1="9" x2="9" y1="3" y2="21"/><line x1="15" x2="15" y1="3" y2="21"/></svg>
              Especificaciones
            </h3>
            <div className="grid grid-cols-2 gap-y-4 gap-x-8">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Código</p>
                <p className="text-lg text-gray-900 font-mono">{product.code}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Categoría</p>
                <p className="text-lg text-gray-900">{product.category?.name || 'S/C'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Marca</p>
                <p className="text-lg text-gray-900">{product.brand || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Medida</p>
                <p className="text-lg text-gray-900">
                  {product.measurementQuantity || '0'} {product.measurementUnit || ''}
                </p>
              </div>
            </div>
            {product.description && (
              <div className="mt-6 pt-6 border-t border-gray-100">
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Descripción</p>
                <p className="text-gray-600 leading-relaxed">{product.description}</p>
              </div>
            )}
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600"><path d="M12 2v20"/><path d="m17 5-5-3-5 3"/><path d="m17 19-5 3-5-3"/><path d="M22 12H2"/><path d="m5 17-3-5 3-5"/><path d="m19 17 3-5-3-5"/></svg>
              Estructura de Precios
            </h3>
            
            <div className="space-y-6">
              {/* Purchase Section */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                <div className="col-span-4 mb-2">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Fase de Compra</span>
                </div>
                <div>
                  <p className="text-[10px] text-gray-500 uppercase mb-1">Precio Compra</p>
                  <p className="text-base text-gray-900 font-semibold">${purchasePrice.toLocaleString('es-CO')}</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-500 uppercase mb-1">% IVA</p>
                  <p className="text-base text-gray-900 font-semibold">{purchaseIvaPercent}%</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-500 uppercase mb-1">Valor IVA</p>
                  <p className="text-base text-gray-900 font-semibold">${purchaseIvaValue.toLocaleString('es-CO')}</p>
                </div>
                <div>
                  <p className="text-[10px] text-blue-600 uppercase mb-1 font-bold">Compra + IVA</p>
                  <p className="text-base text-blue-600 font-bold">${purchasePriceWithIva.toLocaleString('es-CO')}</p>
                </div>
              </div>

              {/* Utility Section */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-indigo-50 rounded-xl border border-indigo-100">
                <div className="col-span-4 mb-2">
                  <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">Margen de Utilidad</span>
                </div>
                <div>
                  <p className="text-[10px] text-gray-500 uppercase mb-1">% Utilidad</p>
                  <p className="text-base text-gray-900 font-semibold">{utilityPercent}%</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-500 uppercase mb-1">Valor Utilidad</p>
                  <p className="text-base text-gray-900 font-semibold">${utilityValue.toLocaleString('es-CO')}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-[10px] text-indigo-600 uppercase mb-1 font-bold">Precio de Venta (Neto)</p>
                  <p className="text-base text-indigo-600 font-bold">${sellingPrice.toLocaleString('es-CO')}</p>
                </div>
              </div>

              {/* Sales Section */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-green-50 rounded-xl border border-green-100">
                <div className="col-span-4 mb-2">
                  <span className="text-xs font-bold text-green-600 uppercase tracking-widest">Fase de Venta Final</span>
                </div>
                <div>
                  <p className="text-[10px] text-gray-500 uppercase mb-1">% IVA Venta</p>
                  <p className="text-base text-gray-900 font-semibold">{salesIvaPercent}%</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-500 uppercase mb-1">Valor IVA Venta</p>
                  <p className="text-base text-gray-900 font-semibold">${salesIvaValue.toLocaleString('es-CO')}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-[10px] text-green-600 uppercase mb-1 font-bold">Precio de Venta Final (+IVA)</p>
                  <p className="text-2xl text-green-600 font-bold">${sellingPriceWithIva.toLocaleString('es-CO')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          {/* Stock Card */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-lg shadow-gray-100 text-center">
            <h4 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4">Stock Disponible</h4>
            <div className={`text-5xl font-black mb-2 ${
              (product.currentStock || 0) <= 0 ? 'text-red-500' : 
              (product.currentStock || 0) < 10 ? 'text-yellow-500' : 
              'text-blue-600'
            }`}>
              {(product.currentStock || 0).toLocaleString('es-CO')}
            </div>
            <p className="text-gray-500 text-sm">unidades en inventario</p>
            <div className="mt-6 pt-6 border-t border-gray-100">
              <Link 
                href={`/inventario/${product.id}/movimientos`}
                className="text-xs text-blue-600 hover:text-blue-500 transition-colors flex items-center justify-center gap-1"
              >
                Ver historial de movimientos
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
              </Link>
            </div>
          </div>

          {/* Quick Actions */}
          {userRole !== 'VIEWER' && (
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Acciones Rápidas</h4>
              <div className="space-y-3">
                <Link 
                  href={`/productos/crear?from=${product.id}`}
                  className="w-full py-2 px-4 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-lg text-sm transition-all flex items-center gap-3 border border-gray-200"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
                  Duplicar Producto
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
