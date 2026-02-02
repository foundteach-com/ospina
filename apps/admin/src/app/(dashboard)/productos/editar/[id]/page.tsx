'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    code: '',
    sku: '',
    unit: 'unidad',
    basePrice: '',
    categoryId: '',
    images: [] as string[],
  });

  useEffect(() => {
    fetchProduct();
  }, []);

  const fetchProduct = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/${params.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setFormData({
          name: data.name,
          description: data.description,
          code: data.code,
          sku: data.sku,
          unit: data.unit,
          basePrice: data.basePrice.toString(),
          categoryId: data.categoryId || '',
          images: data.images || [],
        });
      } else {
        alert('Error al cargar el producto');
        router.push('/productos');
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      alert('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const token = localStorage.getItem('access_token');
      
      const payload = {
        ...formData,
        basePrice: parseFloat(formData.basePrice),
        categoryId: formData.categoryId || undefined,
      };

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/${params.id}`, {
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
        alert(`Error al actualizar: ${errorData.message || 'Error desconocido'}`);
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
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/productos" className="p-2 hover:bg-gray-800 rounded-lg transition-colors text-white">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        </Link>
        <h1 className="text-3xl font-bold text-white">Editar Producto</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-8 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">Nombre del Producto *</label>
          <input
            type="text"
            name="name"
            required
            value={formData.name}
            onChange={handleChange}
            className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">Descripción *</label>
          <textarea
            name="description"
            required
            value={formData.description}
            onChange={handleChange}
            rows={3}
            className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all resize-none"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Código Interno *</label>
            <input
              type="text"
              name="code"
              required
              value={formData.code}
              onChange={handleChange}
              className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">SKU *</label>
            <input
              type="text"
              name="sku"
              required
              value={formData.sku}
              onChange={handleChange}
              className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Unidad de Medida *</label>
            <select
              name="unit"
              required
              value={formData.unit}
              onChange={handleChange}
              className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
            >
              <option value="unidad">Unidad</option>
              <option value="kg">Kilogramo (kg)</option>
              <option value="g">Gramo (g)</option>
              <option value="ton">Tonelada (ton)</option>
              <option value="litro">Litro (L)</option>
              <option value="ml">Mililitro (ml)</option>
              <option value="galon">Galón</option>
              <option value="m">Metro (m)</option>
              <option value="m2">Metro Cuadrado (m²)</option>
              <option value="m3">Metro Cúbico (m³)</option>
              <option value="caja">Caja</option>
              <option value="paquete">Paquete</option>
              <option value="bulto">Bulto</option>
              <option value="saco">Saco</option>
              <option value="rollo">Rollo</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Precio Base ($) *</label>
            <input
              type="number"
              name="basePrice"
              required
              min="0"
              step="0.01"
              value={formData.basePrice}
              onChange={handleChange}
              className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
            />
          </div>
        </div>

        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 flex items-start gap-3">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-400 mt-0.5"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
          <p className="text-sm text-blue-200">
            El stock de este producto se gestionará automáticamente a través del módulo de <Link href="/compras" className="font-bold underline">Compras</Link> e <Link href="/inventario" className="font-bold underline">Inventario</Link>.
          </p>
        </div>

        <div className="pt-4 flex justify-end gap-4">
          <Link
            href="/productos"
            className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-xl transition-colors"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>
      </form>
    </div>
  );
}
