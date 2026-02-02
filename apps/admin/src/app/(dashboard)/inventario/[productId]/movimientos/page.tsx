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
          className="mb-4 text-gray-400 hover:text-white transition-colors flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5"/><path d="m12 19-7-7 7-7"/></svg>
          Volver al Inventario
        </button>

        {product && (
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
              Movimientos de {product.name}
            </h1>
            <p className="text-gray-400 mt-2">
              Código: <span className="font-mono text-white">{product.code}</span> | Unidad: <span className="text-white">{product.unit}</span>
            </p>
          </div>
        )}
      </div>

      <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800 bg-gray-900/50">
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Fecha
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Tipo
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Referencia
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Proveedor / Cliente
                </th>
                <th className="px-6 py-4 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Cantidad
                </th>
                <th className="px-6 py-4 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Precio
                </th>
                <th className="px-6 py-4 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Balance
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {movements.map((movement, index) => (
                <tr key={movement.id} className="hover:bg-gray-800/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                    {new Date(movement.date).toLocaleDateString('es-CO')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {movement.type === 'PURCHASE' ? (
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-500/10 text-green-500 border border-green-500/20">
                        Compra
                      </span>
                    ) : (
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-500/10 text-blue-500 border border-blue-500/20">
                        Venta
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400 font-mono">
                    {movement.referenceNumber || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                    {movement.partner || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {movement.type === 'PURCHASE' ? (
                      <span className="text-green-400">+{movement.quantity}</span>
                    ) : (
                      <span className="text-red-400">-{movement.quantity}</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-400">
                    ${movement.price.toLocaleString('es-CO')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-bold text-white">
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
          <div className="bg-gradient-to-br from-green-500/10 to-green-600/10 border border-green-500/20 rounded-2xl p-6">
            <div className="text-green-400 text-sm font-medium mb-2">Total Comprado</div>
            <div className="text-3xl font-bold text-white">
              {movements
                .filter(m => m.type === 'PURCHASE')
                .reduce((sum, m) => sum + m.quantity, 0)
                .toLocaleString('es-CO')}
            </div>
          </div>
          <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-blue-500/20 rounded-2xl p-6">
            <div className="text-blue-400 text-sm font-medium mb-2">Total Vendido</div>
            <div className="text-3xl font-bold text-white">
              {movements
                .filter(m => m.type === 'SALE')
                .reduce((sum, m) => sum + m.quantity, 0)
                .toLocaleString('es-CO')}
            </div>
          </div>
          <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 border border-purple-500/20 rounded-2xl p-6">
            <div className="text-purple-400 text-sm font-medium mb-2">Stock Actual</div>
            <div className="text-3xl font-bold text-white">
              {balances[0]?.toLocaleString('es-CO') || 0}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
