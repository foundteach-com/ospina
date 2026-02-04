'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Product {
  id: string;
  name: string;
  code: string;
  brand?: string;
  category?: { name: string };
  images?: string[];
  description?: string;
  currentStock?: number;
}

export default function TiendaPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products`);
        if (res.ok) {
          const data = await res.json();
          setProducts(data);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Tienda Virtual
          </h1>
          <p className="mt-1 text-sm text-gray-500">Catálogo de productos disponibles</p>
        </div>
      </header>

      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Cargando catálogo...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12 border-4 border-dashed border-gray-200 rounded-lg">
            <p className="text-gray-500">No hay productos disponibles.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <div key={product.id} className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col">
                <div className="aspect-square bg-gray-100 flex items-center justify-center text-gray-400">
                  {/* Placeholder for now since we don't have images yet */}
                  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
                </div>
                
                <div className="p-4 flex-1 flex flex-col">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 line-clamp-2 mb-1">{product.name}</h3>
                    <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                       <span className="bg-gray-100 px-2 py-0.5 rounded-full">{product.brand || 'Genérico'}</span>
                       {product.category?.name && (
                         <span className="bg-gray-100 px-2 py-0.5 rounded-full">{product.category.name}</span>
                       )}
                    </div>
                  </div>
                  
                  <div className="mt-auto pt-4 flex gap-2">
                    <Link 
                      href={`/productos/${product.id}`}
                      className="flex-1 block text-center py-2.5 px-4 bg-gray-900 hover:bg-black text-white rounded-xl text-sm font-medium transition-colors"
                    >
                      Ver Detalles
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
