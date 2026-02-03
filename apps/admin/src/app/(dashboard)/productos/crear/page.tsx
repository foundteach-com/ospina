'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

function CreateProductForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [fetchingTemplate, setFetchingTemplate] = useState(false);
  const [categories, setCategories] = useState<{id: string, name: string}[]>([]);
  
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    brand: '',
    measurementQuantity: '',
    measurementUnit: 'unidad',
    purchasePrice: '0',
    purchaseIvaPercent: '19',
    utilityPercent: '0',
    salesIvaPercent: '19',
    categoryId: '',
    stock: '0'
  });

  useEffect(() => {
    fetchCategories();
    const fromId = searchParams.get('from');
    if (fromId) {
      fetchTemplate(fromId);
    }
  }, [searchParams]);

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/categories`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchTemplate = async (id: string) => {
    setFetchingTemplate(true);
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setFormData({
          code: `${data.code}-COPY`,
          name: `${data.name} (Copia)`,
          description: data.description || '',
          brand: data.brand || '',
          measurementQuantity: data.measurementQuantity?.toString() || '',
          measurementUnit: data.measurementUnit || 'unidad',
          purchasePrice: data.purchasePrice?.toString() || '0',
          purchaseIvaPercent: data.purchaseIvaPercent?.toString() || '19',
          utilityPercent: data.utilityPercent?.toString() || '0',
          salesIvaPercent: data.salesIvaPercent?.toString() || '19',
          categoryId: data.categoryId || '',
          stock: '0'
        });
      }
    } catch (error) {
      console.error('Error fetching product template:', error);
    } finally {
      setFetchingTemplate(false);
    }
  };

  // Calculations
  const pPrice = parseFloat(formData.purchasePrice || '0');
  const pIvaP = parseFloat(formData.purchaseIvaPercent || '0');
  const uP = parseFloat(formData.utilityPercent || '0');
  const sIvaP = parseFloat(formData.salesIvaPercent || '0');

  const pIvaValue = pPrice * (pIvaP / 100);
  const pPriceWithIva = pPrice + pIvaValue;
  const utilityValue = pPriceWithIva * (uP / 100);
  const sellingPrice = pPriceWithIva + utilityValue;
  const sIvaValue = sellingPrice * (sIvaP / 100);
  const sPriceWithIva = sellingPrice + sIvaValue;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('access_token');
      
      if (!token) {
        alert('Error: No se encontró el token de autenticación. Por favor, inicia sesión nuevamente.');
        router.push('/login');
        return;
      }
      
      const payload = {
        code: formData.code,
        name: formData.name,
        description: formData.description,
        brand: formData.brand,
        measurementQuantity: formData.measurementQuantity ? parseFloat(formData.measurementQuantity) : null,
        measurementUnit: formData.measurementUnit,
        purchasePrice: parseFloat(formData.purchasePrice),
        purchaseIvaPercent: parseFloat(formData.purchaseIvaPercent),
        utilityPercent: parseFloat(formData.utilityPercent),
        salesIvaPercent: parseFloat(formData.salesIvaPercent),
        categoryId: formData.categoryId || null,
        basePrice: sPriceWithIva, // For compatibility
      };

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        router.push('/productos');
        router.refresh();
      } else {
        const errorData = await response.json().catch(() => ({}));
        alert(`Error: ${errorData.message || 'Error desconocido'}`);
      }
    } catch (error) {
      console.error('Error creating product:', error);
      alert('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  if (fetchingTemplate) return <div className="p-8 text-white">Cargando plantilla...</div>;

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/productos" className="p-2 hover:bg-gray-800 rounded-lg transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        </Link>
        <h1 className="text-3xl font-bold text-white">Nuevo Producto</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-8">
          <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center text-sm font-bold">1</span>
            Información General
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-gray-400 mb-2">Código Interno *</label>
              <input
                type="text"
                name="code"
                required
                value={formData.code}
                onChange={handleChange}
                className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-mono"
                placeholder="Ej: ART-001"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-400 mb-2">Nombre del Producto *</label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                placeholder="Ej: Cemento Portland"
              />
            </div>
            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-gray-400 mb-2">Categoría</label>
              <select
                name="categoryId"
                value={formData.categoryId}
                onChange={handleChange}
                className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
              >
                <option value="">Seleccionar Categoría</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-gray-400 mb-2">Marca</label>
              <input
                type="text"
                name="brand"
                value={formData.brand}
                onChange={handleChange}
                className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                placeholder="Ej: Holcim"
              />
            </div>
            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-gray-400 mb-2">Stock Inicial</label>
              <input
                type="number"
                name="stock"
                value={formData.stock}
                onChange={handleChange}
                className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                placeholder="0"
              />
            </div>
          </div>
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-400 mb-2">Descripción</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={2}
              className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all resize-none"
              placeholder="Descripción breve..."
            />
          </div>
        </div>

        {/* Measurement Info */}
        <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-8">
          <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-sm font-bold">2</span>
            Medidas
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Cantidad de Medida (Ej: 1000)</label>
              <input
                type="number"
                name="measurementQuantity"
                value={formData.measurementQuantity}
                onChange={handleChange}
                className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                placeholder="Ej: 1000"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Unidad de Medida (Ej: ml)</label>
              <input
                type="text"
                name="measurementUnit"
                value={formData.measurementUnit}
                onChange={handleChange}
                className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                placeholder="Ej: ml, kg, und"
              />
            </div>
          </div>
        </div>

        {/* Pricing Info */}
        <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-8">
          <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-green-500/20 text-green-400 flex items-center justify-center text-sm font-bold">3</span>
            Estructura de Precios
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Purchase Column */}
            <div className="space-y-4 p-4 border border-gray-800 rounded-xl bg-gray-950/30">
              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Compra</h3>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Precio de Compra (sin IVA)</label>
                <input
                  type="number"
                  name="purchasePrice"
                  value={formData.purchasePrice}
                  onChange={handleChange}
                  className="w-full bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500/50 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">% de IVA Compra</label>
                <div className="relative">
                  <input
                    type="number"
                    name="purchaseIvaPercent"
                    value={formData.purchaseIvaPercent}
                    onChange={handleChange}
                    className="w-full bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-white outline-none"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">%</span>
                </div>
              </div>
              <div className="pt-2 border-t border-gray-800 space-y-2">
                <div className="flex justify-between text-xs text-gray-400">
                  <span>Valor IVA Compra:</span>
                  <span>${pIvaValue.toLocaleString('es-CO')}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-white">
                  <span>Subtotal + IVA:</span>
                  <span className="text-blue-400">${pPriceWithIva.toLocaleString('es-CO')}</span>
                </div>
              </div>
            </div>

            {/* Utility Column */}
            <div className="space-y-4 p-4 border border-gray-800 rounded-xl bg-gray-950/30">
              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Utilidad</h3>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">% de Utilidad</label>
                <div className="relative">
                  <input
                    type="number"
                    name="utilityPercent"
                    value={formData.utilityPercent}
                    onChange={handleChange}
                    className="w-full bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-white outline-none"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">%</span>
                </div>
              </div>
              <div className="pt-2 border-t border-gray-800 space-y-2">
                <div className="flex justify-between text-xs text-gray-400">
                  <span>Margen Utilidad:</span>
                  <span>${utilityValue.toLocaleString('es-CO')}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-white">
                  <span>Precio de Venta:</span>
                  <span className="text-indigo-400">${sellingPrice.toLocaleString('es-CO')}</span>
                </div>
                <p className="text-[10px] text-gray-500 italic mt-1">(Precio sin IVA de venta)</p>
              </div>
            </div>

            {/* Sales Column */}
            <div className="space-y-4 p-4 border border-gray-800 rounded-xl bg-gray-950/30">
              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Venta Final</h3>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">% de IVA Venta</label>
                <div className="relative">
                  <input
                    type="number"
                    name="salesIvaPercent"
                    value={formData.salesIvaPercent}
                    onChange={handleChange}
                    className="w-full bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-white outline-none"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">%</span>
                </div>
              </div>
              <div className="pt-2 border-t border-gray-800 space-y-2">
                <div className="flex justify-between text-xs text-gray-400">
                  <span>Valor IVA Venta:</span>
                  <span>${sIvaValue.toLocaleString('es-CO')}</span>
                </div>
                <div className="flex justify-between text-lg font-bold text-white">
                  <span>Venta + IVA:</span>
                  <span className="text-green-400">${sPriceWithIva.toLocaleString('es-CO')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-4 flex justify-end gap-4">
          <Link
            href="/productos"
            className="px-6 py-3 rounded-xl font-medium text-gray-400 hover:text-white hover:bg-gray-800 transition-all"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl font-medium transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Guardando...' : 'Guardar Producto'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function CreateProductPage() {
  return (
    <Suspense fallback={<div className="p-8 text-white">Cargando formulario...</div>}>
      <CreateProductForm />
    </Suspense>
  );
}
