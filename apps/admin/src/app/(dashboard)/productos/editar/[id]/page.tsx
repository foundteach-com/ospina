'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import ImageUpload from '@/components/common/ImageUpload';

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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
    stock: '0',
    imageUrl: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('access_token');
        
        // Robust API URL detection for production
        let apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
        if (typeof window !== 'undefined' && (apiUrl.includes('localhost') || !apiUrl)) {
          const hostname = window.location.hostname;
          if (hostname.includes('ospinacomercializadoraysuministros.com')) {
            apiUrl = 'https://api.ospinacomercializadoraysuministros.com';
          }
        }

        // Fetch product and categories
        const [prodRes, catRes] = await Promise.all([
          fetch(`${apiUrl}/products/${params.id}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${apiUrl}/products/categories`, {
            headers: { Authorization: `Bearer ${token}` },
          })
        ]);
        
        if (prodRes.ok && catRes.ok) {
          const data = await prodRes.json();
          const cats = await catRes.json();
          setCategories(cats);
          
          setFormData({
            code: data.code || '',
            name: data.name || '',
            description: data.description || '',
            brand: data.brand || '',
            measurementQuantity: data.measurementQuantity?.toString() || '',
            measurementUnit: data.measurementUnit || 'unidad',
            purchasePrice: data.purchasePrice?.toString() || '0',
            purchaseIvaPercent: data.purchaseIvaPercent?.toString() || '19',
            utilityPercent: data.utilityPercent?.toString() || '0',
            salesIvaPercent: data.salesIvaPercent?.toString() || '19',
            categoryId: data.categoryId || '',
            stock: data.stock?.toString() || '0',
            imageUrl: data.imageUrl || ''
          });
        } else {
          alert('Error al cargar datos');
          router.push('/productos');
        }
      } catch (error) {
        console.error('Error fetching:', error);
        alert('Error de conexión');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [params.id, router]);

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
    setSaving(true);

    try {
      const token = localStorage.getItem('access_token');
      
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
        imageUrl: formData.imageUrl || null,
        basePrice: sPriceWithIva, // For compatibility
      };

      // Robust API URL detection for production
      let apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
      if (typeof window !== 'undefined' && (apiUrl.includes('localhost') || !apiUrl)) {
        const hostname = window.location.hostname;
        if (hostname.includes('ospinacomercializadoraysuministros.com')) {
          apiUrl = 'https://api.ospinacomercializadoraysuministros.com';
        }
      }

      const response = await fetch(`${apiUrl}/products/${params.id}`, {
        method: 'PATCH',
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
      console.error('Error updating product:', error);
      alert('Error al actualizar el producto');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  if (loading) return <div className="p-8 text-white">Cargando...</div>;

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/productos" className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-500 hover:text-gray-900">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Editar Producto</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center text-sm font-bold border border-blue-100">1</span>
            Información General
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">Código Interno *</label>
              <input
                type="text"
                name="code"
                required
                value={formData.code}
                onChange={handleChange}
                className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-mono"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Nombre del Producto *</label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
              />
            </div>
            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">Categoría</label>
              <select
                name="categoryId"
                value={formData.categoryId}
                onChange={handleChange}
                className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
              >
                <option value="">Seleccionar Categoría</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">Marca</label>
              <input
                type="text"
                name="brand"
                value={formData.brand}
                onChange={handleChange}
                className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
              />
            </div>
            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">Stock Actual</label>
              <input
                type="number"
                name="stock"
                value={formData.stock}
                readOnly
                className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 text-gray-500 cursor-not-allowed opacity-70"
              />
            </div>
          </div>
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Descripción</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={2}
              className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
              />
          </div>
          <div className="mt-6">
            <ImageUpload 
              label="Imagen del Producto"
              folder="products"
              currentImageUrl={formData.imageUrl}
              onUploadSuccess={(url) => setFormData({ ...formData, imageUrl: url })}
            />
          </div>
        </div>

        {/* Measurement Info */}
        <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center text-sm font-bold border border-indigo-100">2</span>
            Medidas
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Cantidad de Medida (Ej: 1000)</label>
              <input
                type="number"
                name="measurementQuantity"
                value={formData.measurementQuantity}
                onChange={handleChange}
                className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                placeholder="Ej: 1000"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Unidad de Medida (Ej: ml)</label>
              <input
                type="text"
                name="measurementUnit"
                value={formData.measurementUnit}
                onChange={handleChange}
                className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                placeholder="Ej: ml, kg, und"
              />
            </div>
          </div>
        </div>

        {/* Pricing Info */}
        <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-green-50 text-green-600 flex items-center justify-center text-sm font-bold border border-green-100">3</span>
            Estructura de Precios
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Purchase Column */}
            <div className="space-y-4 p-4 border border-gray-200 rounded-xl bg-gray-50">
              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Compra</h3>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Precio de Compra (sin IVA)</label>
                <input
                  type="number"
                  name="purchasePrice"
                  value={formData.purchasePrice}
                  onChange={handleChange}
                  className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500/50 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">% de IVA Compra</label>
                <div className="relative">
                  <input
                    type="number"
                    name="purchaseIvaPercent"
                    value={formData.purchaseIvaPercent}
                    onChange={handleChange}
                    className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 outline-none"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">%</span>
                </div>
              </div>
              <div className="pt-2 border-t border-gray-200 space-y-2">
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Valor IVA Compra:</span>
                  <span>${pIvaValue.toLocaleString('es-CO')}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-gray-900">
                  <span>Subtotal + IVA:</span>
                  <span className="text-blue-600">${pPriceWithIva.toLocaleString('es-CO')}</span>
                </div>
              </div>
            </div>

            {/* Utility Column */}
            <div className="space-y-4 p-4 border border-gray-200 rounded-xl bg-gray-50">
              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Utilidad</h3>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">% de Utilidad</label>
                <div className="relative">
                  <input
                    type="number"
                    name="utilityPercent"
                    value={formData.utilityPercent}
                    onChange={handleChange}
                    className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 outline-none"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">%</span>
                </div>
              </div>
              <div className="pt-2 border-t border-gray-200 space-y-2">
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Margen Utilidad:</span>
                  <span>${utilityValue.toLocaleString('es-CO')}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-gray-900">
                  <span>Precio de Venta:</span>
                  <span className="text-indigo-600">${sellingPrice.toLocaleString('es-CO')}</span>
                </div>
                <p className="text-[10px] text-gray-500 italic mt-1">(Precio sin IVA de venta)</p>
              </div>
            </div>

            {/* Sales Column */}
            <div className="space-y-4 p-4 border border-gray-200 rounded-xl bg-gray-50">
              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Venta Final</h3>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">% de IVA Venta</label>
                <div className="relative">
                  <input
                    type="number"
                    name="salesIvaPercent"
                    value={formData.salesIvaPercent}
                    onChange={handleChange}
                    className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 outline-none"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">%</span>
                </div>
              </div>
              <div className="pt-2 border-t border-gray-200 space-y-2">
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Valor IVA Venta:</span>
                  <span>${sIvaValue.toLocaleString('es-CO')}</span>
                </div>
                <div className="flex justify-between text-lg font-bold text-gray-900">
                  <span>Venta + IVA:</span>
                  <span className="text-green-600">${sPriceWithIva.toLocaleString('es-CO')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-4 flex justify-end gap-4">
          <Link
            href="/productos"
            className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-900 rounded-xl transition-colors"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl font-medium transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>
      </form>
    </div>
  );
}
