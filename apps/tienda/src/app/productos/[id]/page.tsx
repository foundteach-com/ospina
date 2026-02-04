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
  imageUrl?: string;
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
        const prodRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/${params.id}`);

        if (prodRes.ok) {
          const data = await prodRes.json();
          setProduct(data);
        }
      } catch (error) {
        console.error('Error fetching product details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [params.id]);

  const handleWhatsAppQuote = () => {
    if (!product) return;
    
    const phoneNumber = '573215555555'; // TODO: Get actual WhatsApp number from config
    const message = `Hola, me interesa el producto: ${product.name} (Código: ${product.code}). ¿Podrían darme más información?`;
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
    
    window.open(whatsappUrl, '_blank');
  };

  if (loading) return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="flex flex-col items-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-gray-500 font-medium">Cargando producto...</p>
      </div>
    </div>
  );

  if (!product) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="bg-white p-8 rounded-3xl shadow-sm">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Producto no encontrado</h2>
          <p className="text-gray-500 mb-8">Lo sentimos, no pudimos encontrar el producto que buscas.</p>
          <Link href="/" className="inline-flex items-center justify-center w-full py-4 px-6 bg-gray-900 text-white rounded-2xl font-bold hover:bg-black transition-all">
            Volver al catálogo
          </Link>
        </div>
      </div>
    </div>
  );

  return (
    <main className="min-h-screen bg-white pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link href="/" className="inline-flex items-center text-sm font-semibold text-gray-500 hover:text-blue-600 transition-colors mb-12">
          <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Volver al catálogo
        </Link>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          {/* Image Section */}
          <div className="sticky top-8">
            <div className="aspect-square rounded-[2.5rem] bg-gray-50 overflow-hidden border border-gray-100 shadow-inner group">
              {product.imageUrl ? (
                <img 
                  src={product.imageUrl} 
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-200">
                   <svg xmlns="http://www.w3.org/2000/svg" width="160" height="160" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.5" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
                </div>
              )}
            </div>
          </div>
          
          {/* Content Section */}
          <div className="flex flex-col h-full pt-4">
            <div className="space-y-6">
              <div>
                <span className="inline-block px-4 py-1.5 rounded-full bg-blue-50 text-blue-600 text-xs font-bold uppercase tracking-widest mb-4">
                  {product.category?.name || 'General'}
                </span>
                <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 leading-tight mb-4">
                  {product.name}
                </h1>
                <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500 font-medium">
                  <p className="flex items-center">
                    <span className="text-gray-400 mr-2 uppercase text-[10px] tracking-widest">Código:</span>
                    <span className="text-gray-900 font-mono">{product.code}</span>
                  </p>
                  {product.brand && (
                    <p className="flex items-center">
                      <span className="text-gray-400 mr-2 uppercase text-[10px] tracking-widest">Marca:</span>
                      <span className="text-gray-900">{product.brand}</span>
                    </p>
                  )}
                </div>
              </div>

              <div className="h-px bg-gray-100 w-full" />

              <div className="prose prose-gray max-w-none">
                <h3 className="text-sm font-bold text-gray-950 uppercase tracking-widest mb-3">Descripción</h3>
                <p className="text-gray-600 leading-relaxed text-lg">
                  {product.description || 'No hay una descripción detallada para este producto todavía. Por favor, contáctanos para más información.'}
                </p>
              </div>

              <div className="bg-gray-50 rounded-[2rem] p-8 grid grid-cols-2 gap-8 border border-gray-100">
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Presentación</p>
                  <p className="text-xl font-bold text-gray-900">
                    {product.measurementQuantity} {product.measurementUnit}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Estado</p>
                  <div className="flex items-center">
                    <span className="w-2.5 h-2.5 bg-green-500 rounded-full mr-2 shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                    <span className="text-xl font-bold text-gray-900">Pedido bajo cotización</span>
                  </div>
                </div>
              </div>

              <div className="pt-8 space-y-4">
                <button 
                  className="w-full py-6 px-8 bg-blue-600 hover:bg-blue-700 text-white text-xl font-bold rounded-2xl shadow-xl shadow-blue-500/20 hover:shadow-2xl hover:shadow-blue-500/30 transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
                  onClick={handleWhatsAppQuote}
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                  </svg>
                  Solicitar Cotización vía WhatsApp
                </button>
                <p className="text-center text-xs text-gray-400 font-medium">
                  * Un asesor confirmará disponibilidad y precios finales.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
