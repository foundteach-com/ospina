'use client';

import { useState } from 'react';
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

export default function AddToCart({ product }: { product: Product }) {
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const { addItem } = useQuotation();

  const handleAddToQuotation = () => {
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
    const phoneNumber = '573215555555';
    const message = `Hola, me interesa el producto: ${product.name} (Código: ${product.code}). Cantidad: ${quantity}. ¿Podrían darme más información?`;
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
    
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8">
      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Cantidad a cotizar
        </label>
        <div className="flex items-center gap-4">
          <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden w-32">
            <button
              onClick={() => setQuantity(q => Math.max(1, q - 1))}
              className="px-3 py-2 text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
              </svg>
            </button>
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-full text-center border-none focus:ring-0 text-gray-900 font-semibold p-0"
            />
            <button
              onClick={() => setQuantity(q => q + 1)}
              className="px-3 py-2 text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </button>
          </div>
          {product.measurementQuantity && product.measurementUnit && (
             <span className="text-sm text-gray-500">
               Total: {quantity * product.measurementQuantity} {product.measurementUnit}
             </span>
          )}
        </div>
      </div>
      
      <div className="flex flex-col gap-3">
        <button
          onClick={handleAddToQuotation}
          disabled={addedToCart}
          className={`w-full py-3.5 px-6 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
            addedToCart 
            ? 'bg-green-500 text-white shadow-lg shadow-green-500/30'
            : 'bg-gray-900 text-white hover:bg-black shadow-lg shadow-gray-900/20'
          }`}
        >
          {addedToCart ? (
            <>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
              ¡Agregado con éxito!
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Agregar a la lista
            </>
          )}
        </button>
        
        <button
          onClick={handleWhatsAppQuote}
          className="w-full py-3.5 px-6 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-[#25D366]/20"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
          Cotizar por WhatsApp
        </button>
      </div>
    </div>
  );
}
