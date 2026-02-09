
'use client';

import { useState, useEffect } from 'react';

interface Product {
  id: string;
  name: string;
  code: string;
  purchasePrice: number;
}

interface MovementItem {
  id?: string;
  productId: string; // This was incorrectly typed as product in a previous thought, fixing here
  quantity: number;
  product?: Product; // For display
  unitPrice?: number;
}

interface InternalMovement {
  id: string;
  date: string;
  type: string;
  description: string;
  total: number;
  items: MovementItem[];
}

const getTodayLocal = () => {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().split('T')[0];
};

export default function InternalMovementsPage() {
  const [movements, setMovements] = useState<InternalMovement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Form State
  const [formData, setFormData] = useState({
    date: getTodayLocal(),
    type: 'OWNER_WITHDRAWAL',
    description: '',
  });
  
  const [selectedItems, setSelectedItems] = useState<MovementItem[]>([]);
  
  // Item adding state
  const [itemProductId, setItemProductId] = useState('');
  const [itemQuantity, setItemQuantity] = useState(1);

  useEffect(() => {
    fetchMovements();
  }, []);

  // Fetch products when modal opens
  useEffect(() => {
    if (showModal && products.length === 0) {
      fetchProducts();
    }
  }, [showModal]);

  const fetchMovements = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/internal-movements`, {
        headers: { Authorization: `Bearer ${token}` },
      });
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

  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products?showAll=true`, {
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
    if (!itemProductId || itemQuantity <= 0) return;
    
    const product = products.find(p => p.id === itemProductId);
    if (!product) return;

    setSelectedItems(prev => [
      ...prev,
      {
        productId: itemProductId,
        quantity: itemQuantity,
        product: product,
      }
    ]);
    
    // Reset item inputs
    setItemProductId('');
    setItemQuantity(1);
    setSearchTerm('');
  };

  const removeItem = (index: number) => {
    setSelectedItems(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedItems.length === 0) {
      alert('Debes agregar al menos un producto');
      return;
    }

    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/internal-movements`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
            ...formData,
            items: selectedItems.map(item => ({
                productId: item.productId,
                quantity: item.quantity
            }))
        }),
      });

      if (response.ok) {
        setShowModal(false);
        setFormData({
            date: getTodayLocal(),
            type: 'OWNER_WITHDRAWAL',
            description: '',
        });
        setSelectedItems([]);
        fetchMovements();
      } else {
        alert('Error al guardar el movimiento');
      }
    } catch (error) {
      console.error('Error saving movement:', error);
    }
  };
  
  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8">
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Movimientos Internos</h1>
          <p className="text-gray-500">Control de retiros de dueño y consumo interno</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-lg shadow-blue-600/20 flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
          Registrar Movimiento
        </button>
      </header>

      {/* Movements Table */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
            <table className="w-full text-left">
                <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                        <th className="px-6 py-4 text-sm font-semibold text-gray-500">Fecha</th>
                        <th className="px-6 py-4 text-sm font-semibold text-gray-500">Tipo</th>
                        <th className="px-6 py-4 text-sm font-semibold text-gray-500">Descripción</th>
                        <th className="px-6 py-4 text-sm font-semibold text-gray-500 text-right">Costo Total</th>
                        <th className="px-6 py-4 text-sm font-semibold text-gray-500">Detalles</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                    {movements.length === 0 ? (
                         <tr>
                            <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                {loading ? 'Cargando...' : 'No hay movimientos registrados.'}
                            </td>
                         </tr>
                    ) : (
                        movements.map((m) => (
                            <tr key={m.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 text-sm">
                                    {new Date(m.date).toLocaleDateString('es-CO', { timeZone: 'UTC' })}
                                </td>
                                <td className="px-6 py-4 text-sm">
                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                        m.type === 'OWNER_WITHDRAWAL' 
                                        ? 'bg-purple-100 text-purple-700' 
                                        : 'bg-orange-100 text-orange-700'
                                    }`}>
                                        {m.type === 'OWNER_WITHDRAWAL' ? 'Retiro Dueño' : 'Uso Interno'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-600">{m.description || '-'}</td>
                                <td className="px-6 py-4 text-sm font-mono text-right font-medium">
                                    ${Number(m.total).toLocaleString()}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-500">
                                    {m.items.length} productos
                                    <div className="text-xs text-gray-400 mt-1">
                                        {m.items.slice(0, 2).map(i => i.product?.name).join(', ')}
                                        {m.items.length > 2 && '...'}
                                    </div>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-gray-200 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-gray-50">
              <h2 className="text-xl font-bold text-gray-900">Registrar Movimiento</h2>
              <button 
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gray-900"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-500 mb-1">Fecha</label>
                            <input
                                type="date"
                                required
                                value={formData.date}
                                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-500 mb-1">Tipo de Movimiento</label>
                            <select
                                value={formData.type}
                                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none"
                            >
                                <option value="OWNER_WITHDRAWAL">Retiro Dueño (No paga)</option>
                                <option value="INTERNAL_USE">Consumo Interno (Aseo/Uso)</option>
                            </select>
                        </div>
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">Descripción / Observaciones</label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Detalles adicionales..."
                            className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 text-gray-900 min-h-[80px] focus:ring-2 focus:ring-blue-500 outline-none"
                        ></textarea>
                    </div>

                    <div className="border-t border-gray-200 pt-4">
                        <h3 className="font-semibold text-gray-900 mb-3">Agregar Productos</h3>
                        <div className="flex gap-2 mb-4 items-end">
                            <div className="flex-1 relative">
                                <label className="block text-xs font-medium text-gray-500 mb-1">Buscar Producto</label>
                                <input 
                                    type="text"
                                    placeholder="Escribe para buscar..."
                                    value={searchTerm}
                                    onChange={(e) => {
                                        setSearchTerm(e.target.value);
                                        setItemProductId(''); // Reset selection if typing
                                    }}
                                    className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                                {searchTerm && !itemProductId && (
                                    <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 mt-1 max-h-48 overflow-y-auto rounded-lg shadow-xl z-20">
                                        {filteredProducts.length > 0 ? filteredProducts.map(p => (
                                            <div 
                                                key={p.id}
                                                className="px-4 py-2 hover:bg-blue-50 cursor-pointer text-sm"
                                                onClick={() => {
                                                    setItemProductId(p.id);
                                                    setSearchTerm(p.name);
                                                    // console.log("Selected", p.id);
                                                }}
                                            >
                                                <div className="font-medium text-gray-900">{p.name}</div>
                                                <div className="text-gray-500 text-xs flex justify-between">
                                                    <span>Code: {p.code}</span>
                                                    <span>Costo: ${Number(p.purchasePrice).toLocaleString()}</span>
                                                </div>
                                            </div>
                                        )) : (
                                            <div className="px-4 py-2 text-gray-500 text-sm">No encontrado</div>
                                        )}
                                    </div>
                                )}
                            </div>
                            <div className="w-24">
                                <label className="block text-xs font-medium text-gray-500 mb-1">Cantidad</label>
                                <input
                                    type="number"
                                    min="1"
                                    value={itemQuantity}
                                    onChange={(e) => setItemQuantity(parseInt(e.target.value) || 1)}
                                    className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>
                            <button
                                type="button"
                                onClick={addItem}
                                disabled={!itemProductId}
                                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg font-medium transition-colors"
                            >
                                Agregar
                            </button>
                        </div>

                        {/* Items List */}
                        {selectedItems.length > 0 && (
                            <div className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden">
                                <table className="w-full text-sm">
                                    <thead className="bg-gray-100 border-b border-gray-200">
                                        <tr>
                                            <th className="px-4 py-2 text-left">Producto</th>
                                            <th className="px-4 py-2 text-center w-20">Cant.</th>
                                            <th className="px-4 py-2 text-right w-20">Acción</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {selectedItems.map((item, index) => (
                                            <tr key={index}>
                                                <td className="px-4 py-2">
                                                    <div className="font-medium text-gray-900">{item.product?.name}</div>
                                                    <div className="text-xs text-gray-500">
                                                        Costo Unit: ${Number(item.product?.purchasePrice).toLocaleString()}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-2 text-center font-mono">
                                                    {item.quantity}
                                                </td>
                                                <td className="px-4 py-2 text-right">
                                                    <button 
                                                        type="button"
                                                        onClick={() => removeItem(index)}
                                                        className="text-red-500 hover:text-red-700"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </form>
            </div>
            
            <div className="p-6 border-t border-gray-200 flex gap-3 bg-gray-50">
                <button
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
                >
                    Cancelar
                </button>
                <button
                    onClick={handleSubmit}
                    className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors shadow-lg shadow-blue-600/20"
                >
                    Guardar Registro
                </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
