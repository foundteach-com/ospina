'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useQuotation } from '../../context/QuotationContext';

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
}

export default function ProductDetailPage() {
  const params = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const { addItem } = useQuotation();

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

  const handleAddToQuotation = () => {
    if (!product) return;
    
    addItem({
      productId: product.id,
      name: product.name,
      code: product.code,
      brand: product.brand,
      imageUrl: product.imageUrl,
      measurementQuantity: product.measurementQuantity,
      measurementUnit: product.measurementUnit,
    }, quantity);

    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const handleWhatsAppQuote = () => {
    if (!product) return;
    
    const phoneNumber = '573215555555';
    const message = `Hola, me interesa el producto: ${product.name} (Código: ${product.code}). Cantidad: ${quantity}. ¿Podrían darme más información?`;
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
        <div className="bg-white p-8 rounded-2xl shadow-sm">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Producto no encontrado</h2>
          <p className="text-gray-500 mb-6">Lo sentimos, no pudimos encontrar el producto que buscas.</p>
          <Link href="/" className="inline-flex items-center justify-center w-full py-3 px-6 bg-gray-900 text-white rounded-xl font-semibold hover:bg-black transition-all">
            Volver al catálogo
          </Link>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="mb-8">
          <Link href="/" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-blue-600 transition-colors">
            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Volver al catálogo
          </Link>
        </nav>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          {/* Image Section */}
          <div className="lg:sticky lg:top-28 lg:self-start">
            <div className="aspect-square rounded-3xl bg-white overflow-hidden border border-gray-100 shadow-sm">
              {product.imageUrl ? (
                <img 
                  src={product.imageUrl} 
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-50 text-gray-200">
                  <svg className="w-32 h-32" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={0.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              )}
            </div>
          </div>
          
          {/* Content Section */}
          <div className="flex flex-col">
            {/* Category Badge */}
            <span className="inline-block self-start px-3 py-1 rounded-full bg-blue-100 text-blue-600 text-xs font-bold uppercase tracking-wider mb-4">
              {product.category?.name || 'General'}
            </span>

            {/* Title */}
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 leading-tight mb-4">
              {product.name}
            </h1>

            {/* Meta Info */}
            <div className="flex flex-wrap items-center gap-4 text-sm mb-6">
              <span className="flex items-center text-gray-500">
                <span className="text-gray-400 mr-2 uppercase text-xs tracking-wider">Código:</span>
                <span className="font-mono text-gray-900">{product.code}</span>
              </span>
              {product.brand && (
                <span className="flex items-center text-gray-500">
                  <span className="text-gray-400 mr-2 uppercase text-xs tracking-wider">Marca:</span>
                  <span className="text-gray-900 font-medium">{product.brand}</span>
                </span>
              )}
            </div>

            <hr className="border-gray-100 mb-6" />

            {/* Description */}
            <div className="mb-8">
              <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3">Descripción</h2>
              <p className="text-gray-600 leading-relaxed">
                {product.description || 'No hay una descripción detallada para este producto todavía. Por favor, contáctanos para más información.'}
              </p>
            </div>

            {/* Specifications Card */}
            <div className="bg-gray-50 rounded-2xl p-6 mb-8">
              <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">Especificaciones</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Presentación</p>
                  <p className="text-lg font-bold text-gray-900">
                    {product.measurementQuantity && product.measurementUnit 
                      ? `${product.measurementQuantity} ${product.measurementUnit}`
                      : 'Unidad'
                    }
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Estado</p>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full" />
                    <span className="text-lg font-bold text-gray-900">Disponible</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quantity Selector */}
            <div className="mb-6">
              <label className="text-sm font-bold text-gray-900 uppercase tracking-wider block mb-3">
                Cantidad
              </label>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="w-12 h-12 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                  </svg>
                </button>
                <span className="w-16 text-center text-xl font-bold text-gray-900">{quantity}</span>
                <button
                  onClick={() => setQuantity(q => q + 1)}
                  className="w-12 h-12 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button 
                className={`w-full py-4 px-6 rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition-all ${
                  addedToCart 
                    ? 'bg-green-600 text-white'
                    : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30'
                }`}
                onClick={handleAddToQuotation}
              >
                {addedToCart ? (
                  <>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    ¡Agregado!
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Agregar a Cotización
                  </>
                )}
              </button>

              <button 
                className="w-full py-4 px-6 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition-all"
                onClick={handleWhatsAppQuote}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                </svg>
                Cotizar vía WhatsApp
              </button>
            </div>

            <p className="text-center text-xs text-gray-400 mt-4">
              * Un asesor confirmará disponibilidad y precios finales.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
