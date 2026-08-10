import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import AddToCart from './AddToCart';

export const dynamic = 'force-dynamic';

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

// Generate metadata for SEO dynamically based on the product
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) return { title: 'Ospina Comercializadora' };
  try {
    const res = await fetch(`${apiUrl}/products/${resolvedParams.id}`);
    if (res.ok) {
      const product: Product = await res.json();
      return {
        title: `${product.name} | Ospina Comercializadora`,
        description: product.description || `Solicite cotización para ${product.name} (${product.code}).`,
      };
    }
  } catch (e) {
    console.error('Error generating metadata:', e);
  }
  return {
    title: 'Producto no encontrado | Ospina Comercializadora',
  };
}

async function getProduct(id: string): Promise<Product | null> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) return null;
  try {
    const res = await fetch(`${apiUrl}/products/${id}`);

    if (!res.ok) {
      if (res.status === 404) return null;
      throw new Error('Failed to fetch product');
    }
    
    return res.json();
  } catch (error) {
    console.error('Error fetching product details:', error);
    return null;
  }
}

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const product = await getProduct(resolvedParams.id);

  if (!product) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="flex mb-8 text-sm" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-1 md:space-x-3">
            <li className="inline-flex items-center">
              <Link href="/" className="text-gray-500 hover:text-blue-600 transition-colors">
                Inicio
              </Link>
            </li>
            <li>
              <div className="flex items-center">
                <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
                <Link href="/" className="ml-1 text-gray-500 hover:text-blue-600 transition-colors md:ml-2">
                  Catálogo
                </Link>
              </div>
            </li>
            <li aria-current="page">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
                <span className="ml-1 text-gray-900 font-medium md:ml-2 line-clamp-1">{product.name}</span>
              </div>
            </li>
          </ol>
        </nav>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            {/* Image Section */}
            <div className="relative aspect-square lg:aspect-auto lg:h-full bg-white p-8 flex items-center justify-center border-b lg:border-b-0 lg:border-r border-gray-100">
              {product.imageUrl ? (
                <div className="relative w-full h-full max-w-lg mx-auto aspect-square">
                  <Image 
                    src={product.imageUrl} 
                    alt={product.name}
                    fill
                    className="object-contain"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    priority
                  />
                </div>
              ) : (
                <div className="w-full aspect-square flex items-center justify-center text-gray-200">
                  <svg className="w-32 h-32" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={0.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              )}
            </div>

            {/* Content Section */}
            <div className="p-8 lg:p-12 flex flex-col">
              <div className="mb-2">
                <span className="inline-block px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-bold tracking-wider uppercase">
                  {product.category?.name || 'General'}
                </span>
              </div>
              
              <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight mb-4">
                {product.name}
              </h1>
              
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-8">
                <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                  <span className="font-medium text-gray-700">Código:</span>
                  <span className="font-mono text-gray-900">{product.code}</span>
                </div>
                {product.brand && (
                  <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                    <span className="font-medium text-gray-700">Marca:</span>
                    <span className="font-semibold text-gray-900">{product.brand}</span>
                  </div>
                )}
              </div>

              {/* Add to Cart Component (Client Side) */}
              <AddToCart product={product} />

              {/* Specs & Description */}
              <div className="border-t border-gray-100 pt-8 mt-auto">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Descripción y Especificaciones</h3>
                
                {product.description && (
                  <p className="text-gray-600 leading-relaxed mb-6">
                    {product.description}
                  </p>
                )}

                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-6">
                  {product.measurementQuantity && product.measurementUnit && (
                    <div className="bg-gray-50 p-4 rounded-xl">
                      <dt className="text-sm font-medium text-gray-500 mb-1">Unidad de Medida</dt>
                      <dd className="text-base font-semibold text-gray-900">
                        {product.measurementQuantity} {product.measurementUnit}
                      </dd>
                    </div>
                  )}
                  {product.brand && (
                    <div className="bg-gray-50 p-4 rounded-xl">
                      <dt className="text-sm font-medium text-gray-500 mb-1">Fabricante / Marca</dt>
                      <dd className="text-base font-semibold text-gray-900">
                        {product.brand}
                      </dd>
                    </div>
                  )}
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <dt className="text-sm font-medium text-gray-500 mb-1">Categoría</dt>
                    <dd className="text-base font-semibold text-gray-900">
                      {product.category?.name || 'N/A'}
                    </dd>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <dt className="text-sm font-medium text-gray-500 mb-1">Código de Referencia</dt>
                    <dd className="text-base font-semibold text-gray-900 font-mono">
                      {product.code}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
