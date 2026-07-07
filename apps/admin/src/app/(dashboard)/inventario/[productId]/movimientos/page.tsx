'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import ImageUpload from '@/components/common/ImageUpload';
import { 
  ArrowLeft, 
  Pencil, 
  TrendingUp, 
  TrendingDown, 
  Package, 
  Activity, 
  Box,
  Tag
} from 'lucide-react';

interface StockMovement {
  id: string;
  date: string;
  type: 'PURCHASE' | 'SALE' | 'INTERNAL_USE' | 'OWNER_WITHDRAWAL' | 'INITIAL_BALANCE';
  quantity: number;
  price: number;
  referenceNumber?: string;
  partner?: string;
}

interface Product {
  id: string;
  name: string;
  code: string;
  unit: string;
  basePrice: number;
  salesIvaPercent: number;
  imageUrl?: string;
  category?: {
    name: string;
  };
  brand?: string;
  description?: string;
  measurementUnit?: string;
}

export default function ProductMovementsPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params.productId as string;
  
  const [product, setProduct] = useState<Product | null>(null);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (productId) {
      fetchProduct();
      fetchMovements();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);

  const fetchProduct = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/products/${productId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.ok) {
        const data = await response.json();
        setProduct(data);
      }
    } catch (error) {
      console.error('Error fetching product:', error);
    }
  };

  const fetchMovements = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/inventory/${productId}/movements`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.ok) {
        const data = await response.json();
        setMovements(data);
      }
    } catch (error) {
      console.error('Error fetching movements:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpdate = async (url: string) => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/${productId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ imageUrl: url }),
      });
      if (response.ok) {
        setProduct((prev) => prev ? { ...prev, imageUrl: url } : null);
      } else {
        alert('Error al guardar la imagen en el producto.');
      }
    } catch (error) {
      console.error('Error updating product image:', error);
      alert('Error de conexión al actualizar la imagen.');
    }
  };

  const calculateRunningBalance = () => {
    const reversedMovements = [...movements].reverse();
    let balance = 0;
    const reversedBalances = reversedMovements.map((movement) => {
      if (movement.type === 'PURCHASE' || movement.type === 'INITIAL_BALANCE') {
        balance += movement.quantity;
      } else {
        balance -= movement.quantity;
      }
      return balance;
    });
    return reversedBalances.reverse();
  };

  if (loading) return <div className="p-8 text-white">Cargando...</div>;

  const balances = calculateRunningBalance();
  const currentStock = balances[0] || 0;
  const priceWithIva = product ? product.basePrice * (1 + (product.salesIvaPercent / 100)) : 0;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header and Back Button */}
      <div className="flex justify-between items-center">
        <button
          onClick={() => router.push('/inventario')}
          className="text-gray-500 hover:text-gray-900 transition-colors flex items-center gap-2 font-medium bg-white px-4 py-2 rounded-xl border border-gray-200 shadow-sm"
        >
          <ArrowLeft className="w-5 h-5" />
          Volver al Inventario
        </button>
        {product && (
          <Link
            href={`/productos/editar/${product.id}`}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 hover:shadow-lg hover:-translate-y-0.5 transition-all font-medium"
          >
            <Pencil className="w-4 h-4" />
            <span>Editar Producto</span>
          </Link>
        )}
      </div>

      {/* Product Details Card */}
      {product && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col md:flex-row">
          {/* Image Upload Area */}
          <div className="md:w-1/3 bg-gray-50/50 p-6 border-b md:border-b-0 md:border-r border-gray-100 flex flex-col justify-center items-center">
            <div className="w-full max-w-sm">
              <ImageUpload 
                onUploadSuccess={handleImageUpdate}
                currentImageUrl={product.imageUrl}
                folder="products"
                label="Imagen del Producto"
              />
            </div>
          </div>
          
          {/* Details Area */}
          <div className="flex-1 p-8">
            <div className="flex items-start justify-between mb-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                    {product.name}
                  </h1>
                  <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-lg text-sm font-medium flex items-center gap-1">
                    <Tag className="w-4 h-4" />
                    {product.category?.name || 'Sin Categoría'}
                  </span>
                </div>
                <p className="text-gray-500 flex items-center gap-2 mb-3">
                  <Box className="w-4 h-4" />
                  Código: <span className="font-mono font-medium text-gray-700">{product.code}</span>
                  <span className="text-gray-300">|</span>
                  Unidad: <span className="font-medium text-gray-700">{product.unit || product.measurementUnit}</span>
                  {product.brand && (
                    <>
                      <span className="text-gray-300">|</span>
                      Marca: <span className="font-medium text-gray-700">{product.brand}</span>
                    </>
                  )}
                </p>
                {product.description && (
                  <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-xl border border-gray-100">
                    {product.description}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                <div className="text-sm text-gray-500 font-medium mb-1">Precio (Sin IVA)</div>
                <div className="text-xl font-bold text-gray-900 font-mono">
                  ${product.basePrice.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </div>
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                <div className="text-sm text-gray-500 font-medium mb-1">IVA Aplicado</div>
                <div className="text-xl font-bold text-gray-900">
                  {product.salesIvaPercent}%
                </div>
              </div>
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                <div className="text-sm text-gray-500 font-medium mb-1">Precio (+ IVA)</div>
                <div className="text-xl font-bold text-gray-900 font-mono">
                  ${priceWithIva.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </div>
              <div className="bg-blue-50/50 rounded-xl p-4 border border-blue-100 relative overflow-hidden group">
                <div className="absolute -right-2 -bottom-2 text-blue-500/10 group-hover:scale-110 transition-transform duration-500">
                  <Package className="w-16 h-16" />
                </div>
                <div className="relative z-10">
                  <div className="text-sm text-blue-700 font-medium mb-1">Stock Actual</div>
                  <div className="text-xl font-bold text-blue-900 font-mono">
                    {currentStock.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Movements Table */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Activity className="w-5 h-5 text-gray-400" />
          Historial de Movimientos
        </h2>
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Referencia
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Proveedor / Cliente
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Cantidad
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Precio
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Balance
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {movements.map((movement, index) => (
                  <tr key={movement.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                      {new Date(movement.date).toLocaleDateString('es-CO')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {movement.type === 'PURCHASE' ? (
                        <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Compra
                        </span>
                      ) : movement.type === 'SALE' ? (
                        <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                          Venta
                        </span>
                      ) : movement.type === 'INTERNAL_USE' ? (
                        <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                          Uso Interno
                        </span>
                      ) : movement.type === 'INITIAL_BALANCE' ? (
                        <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                          Saldo Inicial
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-gray-50 text-gray-700 border border-gray-200">
                          Retiro Socio
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                      {movement.referenceNumber || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {movement.partner || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-semibold font-mono">
                      {(movement.type === 'PURCHASE' || movement.type === 'INITIAL_BALANCE') ? (
                        <span className="text-emerald-600 flex items-center justify-end gap-1">
                          <TrendingUp className="w-3 h-3" />
                          +{movement.quantity}
                        </span>
                      ) : (
                        <span className="text-rose-600 flex items-center justify-end gap-1">
                          <TrendingDown className="w-3 h-3" />
                          -{movement.quantity}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500 font-mono">
                      ${movement.price.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-bold text-gray-900 font-mono bg-gray-50/50">
                      {balances[index]?.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || 0}
                    </td>
                  </tr>
                ))}
                {movements.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                      No hay movimientos registrados para este producto
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
