'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

interface Product {
  id: string;
  code: string;
  name: string;
  description?: string;
  brand?: string;
  measurementQuantity?: number;
  measurementUnit?: string;
  category?: { name: string };
  currentStock?: number;
}

export default function ProductDetailPage() {
  const params = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const [prodRes, invRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/${params.id}`),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/inventory?search=${params.id}`) // Simple check, ideally endpoint supports by ID
        ]);

        if (prodRes.ok) {
          const data = await prodRes.json();
          // Fetch inventory separately to get stock
          // Note: Ideally, the public product endpoint should return stock if we want to show it.
          // For now, we'll try to get it from the inventory list or default to available.
          
          let stock = 0;
          try {
             if (invRes.ok) {
               const invData = await invRes.json();
               const item = invData.find((i: { productId: string; currentStock: number }) => i.productId === data.id);
               if (item) stock = item.currentStock;
             }
          } catch(e) {
             console.error('Inventory check failed', e);
          }

          setProduct({
            ...data,
            currentStock: stock
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

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <p className="text-gray-500">Cargando detalles...</p>
    </div>
  );

  if (!product) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Producto no encontrado</h2>
        <Link href="/" className="text-blue-600 hover:underline">Volver al catálogo</Link>
      </div>
    </div>
  );

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <Link href="/" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-900 mb-8">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><path d="m15 18-6-6 6-6"/></svg>
          Volver al catálogo
        </Link>
        
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden grid grid-cols-1 md:grid-cols-2 lg:gap-12">
          {/* Image Section */}
          <div className="aspect-square bg-gray-100 flex items-center justify-center text-gray-300">
             <svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
          </div>
          
          {/* Details Section */}
          <div className="p-8 md:py-12 flex flex-col justify-center">
            <div className="mb-2">
              <span className="text-sm font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                {product.category?.name || 'General'}
              </span>
            </div>
            
            <h1 className="text-4xl font-extrabold text-gray-900 mb-2">{product.name}</h1>
            <div className="flex items-center gap-4 text-sm text-gray-500 mb-6">
              <p>Código: <span className="font-mono">{product.code}</span></p>
              {product.brand && (
                 <>
                   <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                   <p>Marca: <span className="font-medium text-gray-700">{product.brand}</span></p>
                 </>
              )}
            </div>

            <div className="prose prose-blue text-gray-600 mb-8">
              <p>{product.description || 'Sin descripción disponible.'}</p>
            </div>

            <div className="grid grid-cols-2 gap-6 mb-8 p-6 bg-gray-50 rounded-xl border border-gray-100">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Presentación</p>
                <p className="text-lg font-semibold text-gray-900">
                  {product.measurementQuantity} {product.measurementUnit}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Disponibilidad</p>
                {(product.currentStock || 0) > 0 ? (
                  <div className="flex items-center text-green-600 font-medium">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    En Stock
                  </div>
                ) : (
                   <div className="flex items-center text-red-500 font-medium">
                    <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                    Agotado
                  </div>
                )}
              </div>
            </div>

            <div className="mt-auto">
              {(product.currentStock || 0) > 0 ? (
                <button 
                  className="w-full py-4 px-6 bg-gray-900 hover:bg-black text-white text-lg font-bold rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
                  onClick={() => alert('Próximamente: Funcionalidad de cotización')}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                  Solicitar Cotización
                </button>
              ) : (
                 <button disabled className="w-full py-4 px-6 bg-gray-200 text-gray-400 text-lg font-bold rounded-xl cursor-not-allowed">
                  No disponible temporalmente
                </button>
              )}
              <p className="text-center text-xs text-gray-400 mt-4">
                * Los precios y condiciones finales serán confirmados en la cotización.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
