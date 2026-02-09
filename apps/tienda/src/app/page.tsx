'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useQuotation } from './context/QuotationContext';

interface Product {
  id: string;
  name: string;
  code: string;
  brand?: string;
  category?: { id: string; name: string };
  imageUrl?: string;
  description?: string;
  measurementQuantity?: number;
  measurementUnit?: string;
}

interface Category {
  id: string;
  name: string;
}

export default function TiendaPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const { addItem } = useQuotation();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodRes, catRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/products`, { cache: 'no-store' }),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/categories`, { cache: 'no-store' })
        ]);

        if (prodRes.ok) {
          const data = await prodRes.json();
          console.log('Productos cargados:', data);
          setProducts(data);
        }
        if (catRes.ok) {
          const data = await catRes.json();
          setCategories(data);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         product.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (product.brand?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || product.category?.id === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const handleAddToQuotation = (e: React.MouseEvent, product: Product) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      productId: product.id,
      name: product.name,
      code: product.code,
      brand: product.brand,
      imageUrl: product.imageUrl,
      measurementQuantity: product.measurementQuantity,
      measurementUnit: product.measurementUnit,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-20 sm:py-28 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%239C92AC%22%20fill-opacity%3D%220.05%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-30" />
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl" />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="inline-block px-4 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 text-sm font-medium mb-6 animate-slideUp">
            Catálogo de Productos
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white mb-6 animate-slideUp" style={{ animationDelay: '100ms' }}>
            Soluciones integrales para
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
              su negocio
            </span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto animate-slideUp" style={{ animationDelay: '200ms' }}>
            Explore nuestro catálogo y solicite cotización de los productos que necesita. Sin compromiso.
          </p>
        </div>
      </section>

      {/* Search and Filters */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
        <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 p-4 sm:p-6 flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Buscar por nombre, código o marca..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>
          
          {/* Category Pills */}
          <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-5 py-3 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${
                selectedCategory === 'all' 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Todos
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-5 py-3 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === cat.id 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm">
                <div className="aspect-square bg-gray-100 animate-pulse" />
                <div className="p-5 space-y-3">
                  <div className="h-4 bg-gray-100 rounded animate-pulse" />
                  <div className="h-4 bg-gray-100 rounded w-2/3 animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No se encontraron productos</h3>
            <p className="text-gray-500">Prueba con otros términos de búsqueda o categorías.</p>
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-500 mb-6">
              Mostrando <span className="font-semibold text-gray-900">{filteredProducts.length}</span> producto{filteredProducts.length !== 1 ? 's' : ''}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <article 
                  key={product.id} 
                  className="group bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-gray-200 shadow-sm hover:shadow-xl transition-all duration-300"
                >
                  <Link href={`/productos/${product.id}`} className="block">
                    {/* Image */}
                    <div className="relative aspect-square bg-gray-50 overflow-hidden">
                      {product.imageUrl ? (
                        <img 
                          src={product.imageUrl} 
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-200">
                          <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={0.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                      {product.brand && (
                        <div className="absolute top-3 left-3">
                          <span className="bg-white/95 backdrop-blur-sm text-xs font-bold uppercase tracking-wider text-gray-800 px-2.5 py-1 rounded-lg shadow-sm">
                            {product.brand}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    {/* Content */}
                    <div className="p-5">
                      <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">
                        {product.category?.name || 'General'}
                      </p>
                      <h3 className="font-bold text-gray-900 line-clamp-2 leading-snug group-hover:text-blue-600 transition-colors">
                        {product.name}
                      </h3>
                      <p className="text-xs text-gray-400 font-mono mt-2">#{product.code}</p>
                    </div>
                  </Link>
                  
                  {/* Actions */}
                  <div className="px-5 pb-5">
                    <button
                      onClick={(e) => handleAddToQuotation(e, product)}
                      className="w-full py-3 px-4 bg-gray-900 hover:bg-gray-800 text-white text-sm font-semibold rounded-xl transition-all flex items-center justify-center gap-2 group/btn"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Agregar a Cotización
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </>
        )}
      </section>
    </div>
  );
}
