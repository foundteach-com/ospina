'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Provider {
  id: string;
  name: string;
}

interface Product {
  id: string;
  name: string;
  code: string;
  basePrice: string;
  purchaseIvaPercent?: string;
}

interface PurchaseItem {
  id?: string;
  productId: string;
  code: string;
  quantity: number;
  basePrice: number;
  ivaPercent: number;
  purchasePrice: number;
}

export default function EditPurchasePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [providers, setProviders] = useState<Provider[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    providerId: '',
    referenceNumber: '',
    date: '',
    notes: '',
  });

  const [items, setItems] = useState<PurchaseItem[]>([]);

  useEffect(() => {
    const loadData = async () => {
      // Need to load products first to match codes when loading purchase data
      const [providersData, productsData] = await Promise.all([fetchProviders(), fetchProducts()]);
      await fetchPurchaseData(productsData); // Pass products to helper
      setLoading(false);
    };
    loadData();
  }, [id]);

  const fetchProviders = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/providers`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setProviders(data);
        return data;
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
        return data; // Return for immediate use
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      return [];
    }
  };

  const fetchPurchaseData = async (loadedProducts?: Product[]) => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/purchases/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setFormData({
          providerId: data.providerId,
          referenceNumber: data.referenceNumber,
          date: new Date(data.date).toISOString().split('T')[0],
          notes: data.notes || '',
        });
        
        // Use provided products or state
        const availableProducts = loadedProducts || products;

        // Post-process items to calculate basePrice and ivaPercent if missing
        const itemsWithCalculatedData = data.items.map((item: any) => {
           const purchasePrice = parseFloat(item.purchasePrice);
           const iva = 19; // Default assumption for existing records
           
           // Find product code
           const product = availableProducts.find(p => p.id === item.productId);
           const code = product ? product.code : '';

           return {
             id: item.id,
             productId: item.productId,
             code: code,
             quantity: parseFloat(item.quantity),
             purchasePrice: purchasePrice,
             ivaPercent: iva,
             basePrice: purchasePrice / (1 + (iva / 100))
           };
        });

        setItems(itemsWithCalculatedData);
      }
    } catch (error) {
      console.error('Error fetching purchase:', error);
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
        const base = field === 'basePrice' ? Number(value) : (currentItem.basePrice || 0);
        const iva = field === 'ivaPercent' ? Number(value) : (currentItem.ivaPercent || 0);
        currentItem.purchasePrice = base * (1 + (iva / 100));
      } else if (field === 'purchasePrice') {
         const total = Number(value);
         const iva = currentItem.ivaPercent || 0;
         currentItem.basePrice = total / (1 + (iva / 100));
      }

      newItems[index] = currentItem;
      return newItems;
    });
  };

  const handleCodeChange = (index: number, code: string) => {
    const product = products.find(p => p.code.toLowerCase() === code.toLowerCase());
    
    if (product) {
      setItems(prevItems => {
        const newItems = [...prevItems];
        const basePrice = parseFloat(product.basePrice);
        const ivaPercent = product.purchaseIvaPercent ? parseFloat(product.purchaseIvaPercent) : 19;
        
        newItems[index] = { 
          ...newItems[index], 
          productId: product.id,
          code: product.code,
          basePrice: basePrice,
          ivaPercent: ivaPercent,
          purchasePrice: basePrice * (1 + (ivaPercent / 100))
        };
        return newItems;
      });
    } else {
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
    
      // Map product defaults
      const basePrice = product ? parseFloat(product.basePrice) : 0;
      const ivaPercent = product && product.purchaseIvaPercent ? parseFloat(product.purchaseIvaPercent) : 19;
      
      newItems[index] = { 
        ...newItems[index], 
        productId,
        code: product ? product.code : '',
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
    setSaving(true);

    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/purchases/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          items: items.filter(item => item.productId).map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            purchasePrice: item.purchasePrice,
          })),
        }),
      });

      if (response.ok) {
        router.push('/compras');
      } else {
        alert('Error al actualizar la compra');
      }
    } catch (error) {
      console.error('Error updating purchase:', error);
      alert('Error al actualizar la compra');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-white text-center">Cargando...</div>;

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/compras" className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-500 hover:text-gray-900">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Editar Compra</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Información General</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Proveedor *</label>
              <select
                value={formData.providerId}
                onChange={(e) => setFormData({ ...formData, providerId: e.target.value })}
                className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:border-blue-500 transition-colors"
                required
              >
                <option value="">Seleccionar proveedor</option>
                {providers.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Fecha *</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:border-blue-500 transition-colors"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Número de Referencia *</label>
              <input
                type="text"
                value={formData.referenceNumber}
                onChange={(e) => setFormData({ ...formData, referenceNumber: e.target.value })}
                className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:border-blue-500 transition-colors"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Notas</label>
              <input
                type="text"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:border-blue-500 transition-colors"
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
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-all flex items-center gap-2"
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">Producto</label>
                  <select
                    value={item.productId}
                    onChange={(e) => handleProductChange(index, e.target.value)}
                    className="w-full px-2 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 text-sm"
                    required
                  >
                    <option value="">Seleccionar</option>
                    {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
                <div className="col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Cant.</label>
                  <input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => updateItem(index, 'quantity', parseFloat(e.target.value))}
                    className="w-full px-2 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 text-sm"
                    required
                    step="0.01"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Costo Base</label>
                  <input
                    type="number"
                    value={item.basePrice || 0}
                    onChange={(e) => updateItem(index, 'basePrice', parseFloat(e.target.value))}
                    className="w-full px-2 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 text-sm"
                    required
                    step="0.01"
                  />
                </div>
                <div className="col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">% IVA</label>
                  <input
                    type="number"
                    value={item.ivaPercent || 0}
                    onChange={(e) => updateItem(index, 'ivaPercent', parseFloat(e.target.value))}
                    className="w-full px-2 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 text-sm"
                    required
                    step="0.01"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Total + IVA</label>
                  <input
                    type="number"
                    value={item.purchasePrice || 0}
                    onChange={(e) => updateItem(index, 'purchasePrice', parseFloat(e.target.value))}
                    className="w-full px-2 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 text-sm"
                    required
                    step="0.01"
                  />
                </div>
                <div className="col-span-1 flex justify-center items-end pb-2">
                  {items.length > 1 && (
                    <button type="button" onClick={() => removeItem(index)} className="text-red-500 hover:text-red-700 p-2" title="Eliminar">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 pt-6 border-t border-gray-200 text-right">
            <div className="text-sm text-gray-500 mb-1">Total Actualizado</div>
            <div className="text-3xl font-bold text-green-600">${calculateTotal().toLocaleString('es-CO')}</div>
          </div>
        </div>

        <div className="flex gap-4 justify-end">
          <button
            type="button"
            onClick={() => router.push('/compras')}
            className="px-6 py-2 border border-gray-300 rounded-xl hover:bg-gray-50 transition-all font-medium"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all font-medium disabled:opacity-50"
          >
            {saving ? 'Guardando...' : 'Actualizar Compra'}
          </button>
        </div>
      </form>
    </div>
  );
}
