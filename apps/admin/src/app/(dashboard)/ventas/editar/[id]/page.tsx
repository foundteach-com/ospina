'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

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
  id?: string;
  productId: string;
  quantity: number;
  salePrice: number;
  availableStock?: number;
}

export default function EditSalePage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const [clients, setClients] = useState<Client[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [inventory, setInventory] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    clientId: '',
    referenceNumber: '',
    date: '',
    notes: '',
    status: 'PENDING',
  });

  const [items, setItems] = useState<SaleItem[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('access_token');
        const headers = { Authorization: `Bearer ${token}` };
        
        const [saleRes, clientsRes, productsRes, invRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/sales/${id}`, { headers }),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/clients`, { headers }),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/products`, { headers }),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/inventory`, { headers }),
        ]);

        if (saleRes.ok && clientsRes.ok && productsRes.ok && invRes.ok) {
          const saleData = await saleRes.json();
          const clientsData = await clientsRes.json();
          const productsData = await productsRes.json();
          const invData = await invRes.json();

          setClients(clientsData);
          setProducts(productsData);
          
          const inv: Record<string, number> = {};
          invData.forEach((item: { productId: string; currentStock: number }) => {
            inv[item.productId] = item.currentStock;
          });
          setInventory(inv);

          setFormData({
            clientId: saleData.clientId,
            referenceNumber: saleData.referenceNumber || '',
            date: new Date(saleData.date).toISOString().split('T')[0],
            notes: saleData.notes || '',
            status: saleData.status,
          });

          setItems(saleData.items.map((item: { 
            id: string; 
            productId: string; 
            quantity: string; 
            salePrice: string; 
          }) => ({
            id: item.id,
            productId: item.productId,
            quantity: parseFloat(item.quantity),
            salePrice: parseFloat(item.salePrice),
            availableStock: (inv[item.productId] || 0) + parseFloat(item.quantity) // Current stock + what was already sold in this sale
          })));
        } else {
          alert('Error al cargar datos de la venta');
          router.push('/ventas');
        }
      } catch (error) {
        console.error('Error fetching sale data:', error);
        alert('Error de conexión');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, router]);

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
    
    // If selecting the same product that was already in the sale, we need to account for its quantity
    // Actually, it's easier to just use the calculated availableStock if it was already there
    
    setItems(prevItems => {
      const newItems = [...prevItems];
      newItems[index] = { 
        ...newItems[index], 
        productId,
        availableStock: stock, // Reset to real current stock if changing product
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
        // Find existing item quantity if any
        // This is a bit complex for a simple validateStock, but let's just use the availableStock we stored
        if (item.availableStock !== undefined && item.quantity > item.availableStock) {
          const product = products.find(p => p.id === item.productId);
          alert(`Stock insuficiente para ${product?.name}. Disponible máximo: ${item.availableStock}`);
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

    setSaving(true);

    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/sales/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          items: items.filter(item => item.productId).map(({ availableStock: _, id: __, ...rest }) => rest),
        }),
      });

      if (response.ok) {
        router.push('/ventas');
      } else {
        const error = await response.json();
        alert(error.message || 'Error al actualizar la venta');
      }
    } catch (error) {
      console.error('Error updating sale:', error);
      alert('Error al actualizar la venta');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-gray-600">Cargando venta...</div>;

  return (
    <div className="p-8">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/ventas" className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-500">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">
          Editar Venta
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Información General</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cliente *
              </label>
              <select
                value={formData.clientId}
                onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:border-blue-500 transition-colors"
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
                Estado *
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:border-blue-500 transition-colors"
                required
              >
                <option value="PENDING">Pendiente</option>
                <option value="PROCESSING">Procesando</option>
                <option value="COMPLETED">Completada</option>
                <option value="CANCELLED">Cancelada</option>
              </select>
            </div>

            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Número de Referencia
              </label>
              <input
                type="text"
                value={formData.referenceNumber}
                onChange={(e) => setFormData({ ...formData, referenceNumber: e.target.value })}
                placeholder="Factura, recibo, etc."
                className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            <div className="md:col-span-2">
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
              <div key={index} className="grid grid-cols-12 gap-4 items-end bg-gray-50 p-4 rounded-xl border border-gray-100">
                <div className="col-span-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Producto
                  </label>
                  <select
                    value={item.productId}
                    onChange={(e) => handleProductChange(index, e.target.value)}
                    className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:border-blue-500 transition-colors"
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Stock Disp.
                  </label>
                  <div className={`px-4 py-2 bg-white border rounded-lg font-medium ${
                    item.productId && item.availableStock !== undefined && item.availableStock < 10 
                      ? 'border-red-200 text-red-600 bg-red-50' 
                      : 'border-gray-200 text-gray-700'
                  }`}>
                    {item.productId ? (item.availableStock ?? '-') : '-'}
                  </div>
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cantidad
                  </label>
                  <input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => updateItem(index, 'quantity', parseFloat(e.target.value))}
                    min="0.01"
                    step="0.01"
                    className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:border-blue-500 transition-colors"
                    required
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Precio Venta
                  </label>
                  <input
                    type="number"
                    value={item.salePrice}
                    onChange={(e) => updateItem(index, 'salePrice', parseFloat(e.target.value))}
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:border-blue-500 transition-colors"
                    required
                  />
                </div>

                <div className="col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subtotal
                  </label>
                  <div className="px-2 py-2 bg-white border border-gray-200 rounded-lg text-green-600 font-bold text-sm">
                    ${(item.quantity * item.salePrice).toLocaleString('es-CO', { maximumFractionDigits: 0 })}
                  </div>
                </div>

                <div className="col-span-1 flex justify-end">
                  {items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
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
            onClick={() => router.push('/ventas')}
            className="px-6 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg transition-colors shadow-sm"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 shadow-sm"
          >
            {saving ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>
      </form>
    </div>
  );
}
