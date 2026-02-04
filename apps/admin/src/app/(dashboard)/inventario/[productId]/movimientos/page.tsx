'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

interface StockMovement {
  id: string;
  date: string;
  type: 'PURCHASE' | 'SALE';
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

  const calculateRunningBalance = () => {
    let balance = 0;
    return movements.map((movement) => {
      if (movement.type === 'PURCHASE') {
        balance += movement.quantity;
      } else {
        balance -= movement.quantity;
      }
      return balance;
    });
  };

  if (loading) return <div className="p-8 text-white">Cargando...</div>;

  const balances = calculateRunningBalance();

  return (
    <div className="p-8">
      <div className="mb-8">
        <button
          onClick={() => router.push('/inventario')}
          className="mb-4 text-gray-500 hover:text-gray-900 transition-colors flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5"/><path d="m12 19-7-7 7-7"/></svg>
          Volver al Inventario
        </button>

        {product && (
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Movimientos de {product.name}
            </h1>
            <p className="text-gray-500 mt-2">
              Código: <span className="font-mono text-gray-700">{product.code}</span> | Unidad: <span className="text-gray-700">{product.unit}</span>
            </p>
          </div>
        )}
      </div>

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
            <tbody className="divide-y divide-gray-200">
              {movements.map((movement, index) => (
                <tr key={movement.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(movement.date).toLocaleDateString('es-CO')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {movement.type === 'PURCHASE' ? (
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-50 text-green-700 border border-green-200">
                        Compra
                      </span>
                    ) : (
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                        Venta
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                    {movement.referenceNumber || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {movement.partner || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {movement.type === 'PURCHASE' ? (
                      <span className="text-green-600">+{movement.quantity}</span>
                    ) : (
                      <span className="text-red-600">-{movement.quantity}</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                    ${movement.price.toLocaleString('es-CO')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-bold text-gray-900">
                    {balances[index]}
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

      {movements.length > 0 && (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white border border-green-200 rounded-2xl p-6 shadow-sm">
            <div className="text-green-600 text-sm font-medium mb-2">Total Comprado</div>
            <div className="text-3xl font-bold text-gray-900">
              {movements
                .filter(m => m.type === 'PURCHASE')
                .reduce((sum, m) => sum + m.quantity, 0)
                .toLocaleString('es-CO')}
            </div>
          </div>
          <div className="bg-white border border-blue-200 rounded-2xl p-6 shadow-sm">
            <div className="text-blue-600 text-sm font-medium mb-2">Total Vendido</div>
            <div className="text-3xl font-bold text-gray-900">
              {movements
                .filter(m => m.type === 'SALE')
                .reduce((sum, m) => sum + m.quantity, 0)
                .toLocaleString('es-CO')}
            </div>
          </div>
          <div className="bg-white border border-purple-200 rounded-2xl p-6 shadow-sm">
            <div className="text-purple-600 text-sm font-medium mb-2">Stock Actual</div>
            <div className="text-3xl font-bold text-gray-900">
              {balances[0]?.toLocaleString('es-CO') || 0}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
