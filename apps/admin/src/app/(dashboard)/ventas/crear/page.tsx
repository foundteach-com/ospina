'use client';

import { useState, useEffect, useRef } from 'react';
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
  basePrice: string | number;
  purchasePrice?: string | number;
  utilityPercent?: string | number;
  salesIvaPercent: string | number;
  measurementUnit?: string;
}

interface SaleItem {
  productId: string;
  searchStr: string;
  name: string;
  code: string;
  unit: string;
  quantity: number;
  unitPriceNet: number;
  discountPercent: number;
  ivaPercent: number;
  availableStock?: number;
  showDropdown?: boolean;
}

export default function CreateSalePage() {
  const router = useRouter();
  const [clients, setClients] = useState<Client[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [inventory, setInventory] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  const [formData, setFormData] = useState({
    clientId: '',
    referenceNumber: '',
    date: new Date().toISOString().split('T')[0],
    notes: '',
    paymentStatus: 'PENDING',
    paymentType: 'CONTADO',
    paymentMethod: 'EFECTIVO',
  });

  const [items, setItems] = useState<SaleItem[]>([
    { 
      productId: '', 
      searchStr: '', 
      name: '', 
      code: '', 
      unit: '',
      quantity: 1, 
      unitPriceNet: 0, 
      discountPercent: 0, 
      ivaPercent: 19, 
      availableStock: 0,
      showDropdown: false
    },
  ]);

  const dropdownRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    fetchClients();
    fetchProducts();
    fetchInventory();

    const handleClickOutside = (event: MouseEvent) => {
      setItems((prevItems) =>
        prevItems.map((item, index) => {
          if (item.showDropdown && dropdownRefs.current[index] && !dropdownRefs.current[index]?.contains(event.target as Node)) {
            return { ...item, showDropdown: false };
          }
          return item;
        })
      );
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
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

  const calculateNetSalePrice = (product: Product) => {
    const purchase = parseFloat(product.purchasePrice?.toString() || '0');
    const utility = parseFloat(product.utilityPercent?.toString() || '0');
    if (purchase > 0 && utility > 0) {
      return purchase * (1 + (utility / 100));
    }
    return parseFloat(product.basePrice?.toString() || '0');
  };

  const addItem = () => {
    setItems([
      ...items, 
      { 
        productId: '', 
        searchStr: '', 
        name: '', 
        code: '', 
        unit: '',
        quantity: 1, 
        unitPriceNet: 0, 
        discountPercent: 0, 
        ivaPercent: 19, 
        availableStock: 0,
        showDropdown: false
      }
    ]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: keyof SaleItem, value: any) => {
    setItems(prevItems => {
      const newItems = [...prevItems];
      newItems[index] = { ...newItems[index], [field]: value };
      return newItems;
    });
  };

  const handleSearchChange = (index: number, value: string) => {
    setItems(prevItems => {
      const newItems = [...prevItems];
      newItems[index] = { ...newItems[index], searchStr: value, showDropdown: true };
      
      // Auto-select if exactly one code or exact name match might be too aggressive,
      // User can click from dropdown.
      return newItems;
    });
  };

  const selectProduct = (index: number, product: Product) => {
    const stock = inventory[product.id] || 0;
    
    setItems(prevItems => {
      const newItems = [...prevItems];
      newItems[index] = { 
        ...newItems[index], 
        productId: product.id,
        searchStr: product.code, // Show code in search input box
        name: product.name,
        code: product.code,
        unit: product.measurementUnit || 'UND',
        availableStock: stock,
        unitPriceNet: calculateNetSalePrice(product),
        ivaPercent: parseFloat(product.salesIvaPercent?.toString() || '19'),
        showDropdown: false
      };
      return newItems;
    });
  };

  const calculateTotals = () => {
    return items.reduce((acc, item) => {
      const unitDiscounted = item.unitPriceNet * (1 - (item.discountPercent / 100));
      const netLine = item.quantity * unitDiscounted;
      const ivaLine = netLine * (item.ivaPercent / 100);
      const totalLine = netLine + ivaLine;
      
      acc.base += netLine;
      
      const ivaKey = item.ivaPercent.toString();
      if (!acc.ivaBreakdown[ivaKey]) {
        acc.ivaBreakdown[ivaKey] = 0;
      }
      acc.ivaBreakdown[ivaKey] += ivaLine;
      
      acc.total += totalLine;
      return acc;
    }, { base: 0, ivaBreakdown: {} as Record<string, number>, total: 0 });
  };

  const validateStock = () => {
    for (const item of items) {
      if (item.productId) {
        const stock = inventory[item.productId] || 0;
        if (item.quantity > stock) {
          alert(`Stock insuficiente para ${item.name}. Disponible: ${stock}`);
          return false;
        }
      }
    }
    return true;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const uploadFile = async (file: File): Promise<string> => {
    const fileFormData = new FormData();
    fileFormData.append('file', file);
    const token = localStorage.getItem('access_token');
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/storage/upload?folder=invoices`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: fileFormData,
    });
    if (!response.ok) throw new Error('Upload failed');
    const data = await response.json();
    return data.url;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateStock()) {
      return;
    }

    setLoading(true);

    let documentUrl: string | undefined = undefined;
    if (selectedFile) {
      try {
        documentUrl = await uploadFile(selectedFile);
      } catch {
        alert('Error al subir el documento. Por favor intente de nuevo.');
        setLoading(false);
        return;
      }
    }

    try {
      const token = localStorage.getItem('access_token');
      
      const validItems = items.filter(item => item.productId).map(item => {
        const unitDiscounted = item.unitPriceNet * (1 - (item.discountPercent / 100));
        const salePriceWithIva = unitDiscounted * (1 + (item.ivaPercent / 100));
        
        return {
          productId: item.productId,
          quantity: item.quantity,
          salePrice: Number(salePriceWithIva.toFixed(2)) // Sending Total Unit Price with IVA for backend consistency
        };
      });

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/sales`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          documentUrl,
          items: validItems,
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

  const totals = calculateTotals();

  return (
    <div className="p-8">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/ventas" className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-500 hover:text-gray-900">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">
          Nueva Venta
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Información General</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                Número de Referencia
              </label>
              <input
                type="text"
                value={formData.referenceNumber}
                onChange={(e) => setFormData({ ...formData, referenceNumber: e.target.value })}
                placeholder="Opcional: Factura, recibo, etc."
                className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estado de Pago *
              </label>
              <select
                value={formData.paymentStatus}
                onChange={(e) => setFormData({ ...formData, paymentStatus: e.target.value })}
                className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:border-blue-500 transition-colors"
                required
              >
                <option value="PENDING">Pendiente</option>
                <option value="PAID">Pagado</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Forma de Pago *
              </label>
              <select
                value={formData.paymentType}
                onChange={(e) => setFormData({ ...formData, paymentType: e.target.value })}
                className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:border-blue-500 transition-colors"
                required
              >
                <option value="CONTADO">Contado</option>
                <option value="CREDITO">Crédito</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Medio de Pago *
              </label>
              <select
                value={formData.paymentMethod}
                onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:border-blue-500 transition-colors"
                required
              >
                <option value="EFECTIVO">Efectivo</option>
                <option value="TRANSFERENCIA">Transferencia</option>
                <option value="CONSIGNACION">Consignación</option>
                <option value="DATAFONO">Datáfono</option>
                <option value="OTRO">Otro</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Observaciones
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Detalles adicionales de la venta..."
                rows={3}
                className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors resize-none"
              />
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm overflow-visible">
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

          {/* Table Header Wrapper for visual alignment (optional) */}
          <div className="hidden lg:grid grid-cols-12 gap-2 px-4 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            <div className="col-span-3">Buscar Prod. (Cód/Desc)</div>
            <div className="col-span-2">Descripción</div>
            <div className="col-span-1">IVA %</div>
            <div className="col-span-1">U.M.</div>
            <div className="col-span-1">Cant.</div>
            <div className="col-span-1">P. Unit. (Sin IVA)</div>
            <div className="col-span-1">Dcto %</div>
            <div className="col-span-1">V. Total (c/ IVA)</div>
            <div className="col-span-1 text-center">Acción</div>
          </div>

          <div className="space-y-4">
            {items.map((item, index) => (
              <div key={index} className="grid grid-cols-1 lg:grid-cols-12 gap-2 lg:gap-2 items-start bg-gray-50 p-4 rounded-xl border border-gray-100 relative">
                
                {/* 1. Buscar (Código / Descripción) */}
                <div className="col-span-1 lg:col-span-3">
                  <label className="block lg:hidden text-xs font-medium text-gray-700 mb-1">Buscar (Cód/Desc)</label>
                  <div className="relative" ref={(el) => { dropdownRefs.current[index] = el; }}>
                    <div className="relative">
                      <input
                        type="text"
                        value={item.searchStr}
                        onChange={(e) => handleSearchChange(index, e.target.value)}
                        placeholder="Escriba para buscar..."
                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:border-blue-500 transition-colors text-sm pl-8"
                      />
                      <svg className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                    </div>

                    {item.showDropdown && item.searchStr.trim().length > 0 && (
                      <div className="absolute z-50 w-[300px] mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                        {products
                          .filter(p => p.code.toLowerCase().includes(item.searchStr.toLowerCase()) || p.name.toLowerCase().includes(item.searchStr.toLowerCase()))
                          .map((p) => (
                            <div
                              key={p.id}
                              onClick={() => selectProduct(index, p)}
                              className="px-4 py-2 hover:bg-blue-50 cursor-pointer border-b border-gray-50 last:border-0"
                            >
                              <div className="text-sm font-medium text-gray-900">{p.name}</div>
                              <div className="text-xs text-gray-500 font-mono">Cód: {p.code} | Stock: {inventory[p.id] || 0}</div>
                            </div>
                        ))}
                        {products.filter(p => p.code.toLowerCase().includes(item.searchStr.toLowerCase()) || p.name.toLowerCase().includes(item.searchStr.toLowerCase())).length === 0 && (
                          <div className="px-4 py-3 text-sm text-gray-500 text-center">No hay coincidencias</div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* 2. Descripción */}
                <div className="col-span-1 lg:col-span-2">
                  <label className="block lg:hidden text-xs font-medium text-gray-700 mb-1">Descripción</label>
                  <input
                    type="text"
                    value={item.name}
                    readOnly
                    placeholder="Auto-relleno"
                    className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-lg text-gray-700 text-sm focus:outline-none"
                  />
                </div>

                {/* 3. IVA */}
                <div className="col-span-1">
                  <label className="block lg:hidden text-xs font-medium text-gray-700 mb-1">IVA %</label>
                  <input
                    type="number"
                    value={item.ivaPercent}
                    onChange={(e) => updateItem(index, 'ivaPercent', parseFloat(e.target.value))}
                    min="0"
                    step="0.1"
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:border-blue-500 transition-colors text-sm"
                  />
                </div>

                {/* 4. U.M. */}
                <div className="col-span-1">
                  <label className="block lg:hidden text-xs font-medium text-gray-700 mb-1">U.M.</label>
                  <input
                    type="text"
                    value={item.unit}
                    readOnly
                    placeholder="UND"
                    className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-lg text-gray-700 focus:outline-none text-sm"
                  />
                </div>

                {/* 5. Cantidad */}
                <div className="col-span-1">
                  <label className="block lg:hidden text-xs font-medium text-gray-700 mb-1">Cant. <span className="font-normal text-[10px] ml-1">(Stock: {item.availableStock || 0})</span></label>
                  <input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => updateItem(index, 'quantity', parseFloat(e.target.value))}
                    min="0.01"
                    step="0.01"
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:border-blue-500 transition-colors text-sm"
                  />
                  {/* Pequeño aviso de stock en desktop */}
                  <div className="hidden lg:block text-[9px] text-gray-400 mt-1 pl-1">Stock: {item.availableStock || 0}</div>
                </div>

                {/* 6. Precio Unitario (Sin IVA) */}
                <div className="col-span-1">
                  <label className="block lg:hidden text-xs font-medium text-gray-700 mb-1">P. Unitario (Sin IVA)</label>
                  <input
                    type="number"
                    value={item.unitPriceNet}
                    onChange={(e) => updateItem(index, 'unitPriceNet', parseFloat(e.target.value))}
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:border-blue-500 transition-colors text-sm"
                  />
                </div>

                {/* 7. Descuento (%) */}
                <div className="col-span-1">
                  <label className="block lg:hidden text-xs font-medium text-gray-700 mb-1">Dcto (%)</label>
                  <input
                    type="number"
                    value={item.discountPercent}
                    onChange={(e) => updateItem(index, 'discountPercent', parseFloat(e.target.value))}
                    min="0"
                    max="100"
                    step="0.1"
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:border-blue-500 transition-colors text-sm"
                  />
                </div>

                {/* 8. Valor Total (Con IVA) */}
                <div className="col-span-1">
                  <label className="block lg:hidden text-xs font-medium text-gray-700 mb-1">V. Total (c/ IVA)</label>
                  <div className="w-full px-2 py-2 bg-gray-100 border border-gray-200 rounded-lg text-gray-900 font-semibold text-sm h-[38px] flex items-center shadow-inner line-clamp-1 overflow-hidden" title={`SubTotal (Neto + IVA)`}>
                    {(() => {
                      const discounted = item.unitPriceNet * (1 - (item.discountPercent / 100));
                      const net = item.quantity * discounted;
                      const iva = net * (item.ivaPercent / 100);
                      const t = net + iva;
                      return `$${t.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
                    })()}
                  </div>
                </div>

                {/* 9. Acción Eliminar */}
                <div className="col-span-1 flex justify-center items-start lg:mt-1">
                  {items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      title="Eliminar línea"
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
            <div className="flex justify-between items-start">
              <button
                type="button"
                onClick={addItem}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center gap-2 shadow-sm"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
                Agregar Producto
              </button>

              <div className="text-right space-y-2 w-full md:w-1/3 min-w-[300px]">
                <div className="flex justify-between gap-8 text-sm text-gray-500 pb-1 border-b border-gray-100">
                  <span>Valor Neto (Sin IVA)</span>
                  <span>${totals.base.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                
                {/* Desglose de IVA */}
                {Object.entries(totals.ivaBreakdown).map(([percent, value]) => (
                  <div key={percent} className="flex justify-between gap-8 text-sm text-gray-500 pb-1 border-b border-gray-100">
                    <span>IVA ({percent}%)</span>
                    <span>${value.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                ))}

                <div className="pt-2">
                  <div className="flex justify-between items-end gap-8">
                    <span className="text-base font-bold text-gray-800">Total a Pagar</span>
                    <span className="text-3xl font-bold text-green-600">
                      ${totals.total.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sección PDF */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Documento / Soporte</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Adjuntar documento (PDF)
              </label>
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-full file:border-0
                  file:text-sm file:font-semibold
                  file:bg-blue-50 file:text-blue-700
                  hover:file:bg-blue-100"
              />
              <p className="mt-1 text-xs text-gray-400">Opcional. Adjunta la remisión, orden de pedido u otro soporte en PDF.</p>
            </div>
            {selectedFile && (
              <div className="flex items-center gap-3 px-4 py-3 bg-blue-50 border border-blue-100 rounded-xl">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600 shrink-0"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                <div className="text-sm text-blue-800 font-medium truncate">{selectedFile.name}</div>
                <button type="button" onClick={() => setSelectedFile(null)} className="ml-auto text-blue-400 hover:text-red-500 transition-colors shrink-0" title="Quitar archivo">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                </button>
              </div>
            )}
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
            disabled={loading}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 shadow-sm"
          >
            {loading ? 'Guardando...' : 'Crear Venta'}
          </button>
        </div>
      </form>
    </div>
  );
}
