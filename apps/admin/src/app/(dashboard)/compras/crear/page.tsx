'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Provider {
  id: string;
  name: string;
}

interface Product {
  id: string;
  name: string;
  code: string;
  basePrice: string;
  purchaseIvaPercent: string;
  unit: string;
}

interface PurchaseItem {
  productId: string;
  code: string;
  quantity: number;
  basePrice: number;
  ivaPercent: number;
  purchasePrice: number; // This will be the Total Cost (Base + IVA)
}

export default function CreatePurchasePage() {
  const router = useRouter();
  const [providers, setProviders] = useState<Provider[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    providerId: '',
    referenceNumber: '',
    date: new Date().toISOString().split('T')[0],
    notes: '',
  });

  const [items, setItems] = useState<PurchaseItem[]>([
    { productId: '', code: '', quantity: 1, basePrice: 0, ivaPercent: 19, purchasePrice: 0 },
  ]);

  useEffect(() => {
    fetchProviders();
    fetchProducts();
  }, []);

  const fetchProviders = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/providers`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setProviders(data);
      }
    } catch (error) {
      console.error('Error fetching providers:', error);
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

  const addItem = () => {
    setItems([...items, { productId: '', code: '', quantity: 1, basePrice: 0, ivaPercent: 19, purchasePrice: 0 }]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: keyof PurchaseItem, value: string | number) => {
    setItems(prevItems => {
      const newItems = [...prevItems];
      const currentItem = { ...newItems[index], [field]: value };
      
      // Auto-calculation logic
      if (field === 'basePrice' || field === 'ivaPercent') {
        const base = field === 'basePrice' ? Number(value) : currentItem.basePrice;
        const iva = field === 'ivaPercent' ? Number(value) : currentItem.ivaPercent;
        currentItem.purchasePrice = base * (1 + (iva / 100));
      } else if (field === 'purchasePrice') {
         const total = Number(value);
         const iva = currentItem.ivaPercent;
         currentItem.basePrice = total / (1 + (iva / 100));
      }

      newItems[index] = currentItem;
      return newItems;
    });
  };

  const handleCodeChange = (index: number, code: string) => {
    const product = products.find(p => p.code.toLowerCase() === code.toLowerCase());
    
    if (product) {
      // If code matches a product, select it similar to handleProductChange
      setItems(prevItems => {
        const newItems = [...prevItems];
        const basePrice = parseFloat(product.basePrice);
        const ivaPercent = product.purchaseIvaPercent ? parseFloat(product.purchaseIvaPercent) : 19;
        
        newItems[index] = { 
          ...newItems[index], 
          productId: product.id,
          code: product.code, // Use the official code from product
          basePrice: basePrice,
          ivaPercent: ivaPercent,
          purchasePrice: basePrice * (1 + (ivaPercent / 100))
        };
        return newItems;
      });
    } else {
      // Just update the code field if no match (allow user to keep typing)
      setItems(prevItems => {
        const newItems = [...prevItems];
        newItems[index] = { ...newItems[index], code: code };
        return newItems;
      });
    }
  };

  const handleProductChange = (index: number, productId: string) => {
    const product = products.find(p => p.id === productId);
    setItems(prevItems => {
      const newItems = [...prevItems];
      const basePrice = product ? parseFloat(product.basePrice) : 0; 
      const ivaPercent = product && product.purchaseIvaPercent ? parseFloat(product.purchaseIvaPercent) : 19;
      
      newItems[index] = { 
        ...newItems[index], 
        productId,
        code: product ? product.code : '', // Update code field based on selection
        basePrice: basePrice,
        ivaPercent: ivaPercent,
        purchasePrice: basePrice * (1 + (ivaPercent / 100))
      };
      return newItems;
    });
  };

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + (item.quantity * item.purchasePrice), 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/purchases`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          items: items.filter(item => item.productId),
        }),
      });

      if (response.ok) {
        router.push('/compras');
      } else {
        alert('Error al crear la compra');
      }
    } catch (error) {
      console.error('Error creating purchase:', error);
      alert('Error al crear la compra');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Nueva Compra
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Información General</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Proveedor *
              </label>
              <select
                value={formData.providerId}
                onChange={(e) => setFormData({ ...formData, providerId: e.target.value })}
                className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:border-blue-500 transition-colors"
                required
              >
                <option value="">Seleccionar proveedor</option>
                {providers.map((provider) => (
                  <option key={provider.id} value={provider.id}>
                    {provider.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha *
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:border-blue-500 transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Número de Referencia *
              </label>
              <input
                type="text"
                value={formData.referenceNumber}
                onChange={(e) => setFormData({ ...formData, referenceNumber: e.target.value })}
                placeholder="Factura, orden de compra, etc."
                className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notas
              </label>
              <input
                type="text"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Opcional"
                className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Productos</h2>
            <button
              type="button"
              onClick={addItem}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center gap-2 shadow-sm"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
              Agregar Producto
            </button>
          </div>

          <div className="space-y-4">
            {items.map((item, index) => (
              <div key={index} className="grid grid-cols-12 gap-2 items-end bg-gray-50 p-4 rounded-xl border border-gray-100">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Código
                  </label>
                  <input
                    type="text"
                    value={item.code || ''}
                    onChange={(e) => handleCodeChange(index, e.target.value)}
                    className="w-full px-2 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:border-blue-500 transition-colors text-sm"
                    placeholder="Código"
                  />
                </div>

                <div className="col-span-3">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Producto
                  </label>
                  <select
                    value={item.productId}
                    onChange={(e) => handleProductChange(index, e.target.value)}
                    className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:border-blue-500 transition-colors text-sm"
                    required
                  >
                    <option value="">Seleccionar producto</option>
                    {products.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cant.
                  </label>
                  <input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => updateItem(index, 'quantity', parseFloat(e.target.value))}
                    min="0.01"
                    step="0.01"
                    className="w-full px-2 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:border-blue-500 transition-colors text-sm"
                    required
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Costo Base
                  </label>
                  <input
                    type="number"
                    value={item.basePrice || 0}
                    onChange={(e) => updateItem(index, 'basePrice', parseFloat(e.target.value))}
                    min="0"
                    step="0.01"
                    className="w-full px-2 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:border-blue-500 transition-colors text-sm"
                    required
                  />
                </div>

                <div className="col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    % IVA
                  </label>
                  <input
                    type="number"
                    value={item.ivaPercent || 0}
                    onChange={(e) => updateItem(index, 'ivaPercent', parseFloat(e.target.value))}
                    min="0"
                    step="0.01"
                    className="w-full px-2 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:border-blue-500 transition-colors text-sm"
                    required
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Total + IVA
                  </label>
                  <input
                    type="number"
                    value={item.purchasePrice || 0}
                    onChange={(e) => updateItem(index, 'purchasePrice', parseFloat(e.target.value))}
                    min="0"
                    step="0.01"
                    className="w-full px-2 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:border-blue-500 transition-colors text-sm"
                    required
                  />
                </div>

                <div className="col-span-1 flex justify-center items-end pb-2">
                    {items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeItem(index)}
                        className="text-red-500 hover:text-red-700 p-2"
                        title="Eliminar"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                      </button>
                    )}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex justify-end">
              <div className="text-right">
                <div className="text-sm text-gray-500 mb-1">Total</div>
                <div className="text-2xl font-bold text-green-600">
                  ${calculateTotal().toLocaleString('es-CO')}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-4 justify-end">
          <button
            type="button"
            onClick={() => router.push('/compras')}
            className="px-6 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg transition-colors shadow-sm"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 shadow-sm"
          >
            {loading ? 'Guardando...' : 'Crear Compra'}
          </button>
        </div>
      </form>
    </div>
  );
}
