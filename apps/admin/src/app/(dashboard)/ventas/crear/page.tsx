'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Client {
  id: string;
  name: string;
  taxId: string;
}

interface Product {
  id: string;
  name: string;
  code: string;
  basePrice: string;
  unit: string;
}

interface SaleItem {
  productId: string;
  quantity: number;
  salePrice: number;
  availableStock?: number;
}

export default function CreateSalePage() {
  const router = useRouter();
  const [clients, setClients] = useState<Client[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [inventory, setInventory] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    clientId: '',
    referenceNumber: '',
    date: new Date().toISOString().split('T')[0],
    notes: '',
  });

  const [items, setItems] = useState<SaleItem[]>([
    { productId: '', quantity: 1, salePrice: 0, availableStock: 0 },
  ]);

  useEffect(() => {
    fetchClients();
    fetchProducts();
    fetchInventory();
  }, []);

  const fetchClients = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/clients`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setClients(data);
      }
    } catch (error) {
      console.error('Error fetching clients:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const fetchInventory = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/inventory`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        const inv: Record<string, number> = {};
        data.forEach((item: { productId: string; currentStock: number }) => {
          inv[item.productId] = item.currentStock;
        });
        setInventory(inv);
      }
    } catch (error) {
      console.error('Error fetching inventory:', error);
    }
  };

  const addItem = () => {
    setItems([...items, { productId: '', quantity: 1, salePrice: 0, availableStock: 0 }]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: keyof SaleItem, value: string | number) => {
    setItems(prevItems => {
      const newItems = [...prevItems];
      newItems[index] = { ...newItems[index], [field]: value };
      return newItems;
    });
  };

  const handleProductChange = (index: number, productId: string) => {
    const product = products.find(p => p.id === productId);
    const stock = inventory[productId] || 0;
    
    setItems(prevItems => {
      const newItems = [...prevItems];
      newItems[index] = { 
        ...newItems[index], 
        productId,
        availableStock: stock,
        salePrice: product ? parseFloat(product.basePrice) : 0
      };
      return newItems;
    });
  };

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + (item.quantity * item.salePrice), 0);
  };

  const validateStock = () => {
    for (const item of items) {
      if (item.productId) {
        const stock = inventory[item.productId] || 0;
        if (item.quantity > stock) {
          const product = products.find(p => p.id === item.productId);
          alert(`Stock insuficiente para ${product?.name}. Disponible: ${stock}`);
          return false;
        }
      }
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateStock()) {
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/sales`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          items: items.filter(item => item.productId).map(({ availableStock: _, ...rest }) => rest),
        }),
      });

      if (response.ok) {
        router.push('/ventas');
      } else {
        const error = await response.json();
        alert(error.message || 'Error al crear la venta');
      }
    } catch (error) {
      console.error('Error creating sale:', error);
      alert('Error al crear la venta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
          Nueva Venta
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Información General</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Cliente *
              </label>
              <select
                value={formData.clientId}
                onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                required
              >
                <option value="">Seleccionar cliente</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.name} - {client.taxId}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Fecha *
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Número de Referencia
              </label>
              <input
                type="text"
                value={formData.referenceNumber}
                onChange={(e) => setFormData({ ...formData, referenceNumber: e.target.value })}
                placeholder="Opcional: Factura, recibo, etc."
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Notas
              </label>
              <input
                type="text"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Opcional"
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-white">Productos</h2>
            <button
              type="button"
              onClick={addItem}
              className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg transition-colors flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
              Agregar Producto
            </button>
          </div>

          <div className="space-y-4">
            {items.map((item, index) => (
              <div key={index} className="grid grid-cols-12 gap-4 items-end">
                <div className="col-span-4">
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Producto
                  </label>
                  <select
                    value={item.productId}
                    onChange={(e) => handleProductChange(index, e.target.value)}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                    required
                  >
                    <option value="">Seleccionar producto</option>
                    {products.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.name} ({product.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Stock Disp.
                  </label>
                  <div className={`px-4 py-2 bg-gray-800/50 border rounded-lg font-medium ${
                    item.availableStock && item.availableStock < 10 
                      ? 'border-red-500/20 text-red-400' 
                      : 'border-gray-700 text-gray-400'
                  }`}>
                    {item.productId ? (item.availableStock || 0) : '-'}
                  </div>
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Cantidad
                  </label>
                  <input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => updateItem(index, 'quantity', parseFloat(e.target.value))}
                    min="0.01"
                    step="0.01"
                    max={item.availableStock}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Precio Venta
                  </label>
                  <input
                    type="number"
                    value={item.salePrice}
                    onChange={(e) => updateItem(index, 'salePrice', parseFloat(e.target.value))}
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>

                <div className="col-span-1">
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Subtotal
                  </label>
                  <div className="px-2 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-green-400 font-medium text-sm">
                    ${(item.quantity * item.salePrice).toLocaleString('es-CO', { maximumFractionDigits: 0 })}
                  </div>
                </div>

                <div className="col-span-1 flex justify-end">
                  {items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-6 border-t border-gray-800">
            <div className="flex justify-end">
              <div className="text-right">
                <div className="text-sm text-gray-400 mb-1">Total</div>
                <div className="text-2xl font-bold text-green-400">
                  ${calculateTotal().toLocaleString('es-CO')}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-4 justify-end">
          <button
            type="button"
            onClick={() => router.push('/ventas')}
            className="px-6 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors disabled:opacity-50"
          >
            {loading ? 'Guardando...' : 'Crear Venta'}
          </button>
        </div>
      </form>
    </div>
  );
}
