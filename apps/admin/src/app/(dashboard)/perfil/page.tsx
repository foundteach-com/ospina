'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ImageUpload from '@/components/common/ImageUpload';

export default function ProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savingCompany, setSavingCompany] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    avatarUrl: '',
    password: '',
  });

  const [companyData, setCompanyData] = useState({
    companyName: '',
    logoUrl: '',
    taxId: '',
    address: '',
    phone: '',
    email: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('access_token');
        const userData = localStorage.getItem('user');
        
        if (userData) {
          const user = JSON.parse(userData);
          setIsAdmin(user.role === 'ADMIN');
        }

        // Fetch User Profile
        const userRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        if (userRes.ok) {
          const data = await userRes.json();
          setFormData({
            name: data.name || '',
            email: data.email,
            avatarUrl: data.avatarUrl || '',
            password: '',
          });
        }

        // Fetch Company Settings if Admin
        const settingsRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/settings`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        if (settingsRes.ok) {
          const data = await settingsRes.json();
          setCompanyData({
            companyName: data.companyName || '',
            logoUrl: data.logoUrl || '',
            taxId: data.taxId || '',
            address: data.address || '',
            phone: data.phone || '',
            email: data.email || '',
          });
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const token = localStorage.getItem('access_token');
      const payload: { name: string; email: string; avatarUrl: string; password?: string } = { ...formData };
      if (!payload.password) delete payload.password;

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/profile`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const updatedUser = await response.json();
        localStorage.setItem('user', JSON.stringify(updatedUser));
        alert('Perfil actualizado con éxito');
        window.location.reload();
      } else {
        const error = await response.json();
        alert(error.message || 'Error al actualizar perfil');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Error de conexión');
    } finally {
      setSaving(false);
    }
  };

  const handleCompanySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingCompany(true);
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/settings`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(companyData),
      });

      if (response.ok) {
        alert('Configuración de empresa actualizada');
        window.location.reload();
      } else {
        const error = await response.json();
        alert(error.message || 'Error al actualizar configuración');
      }
    } catch (error) {
      console.error('Error updating settings:', error);
      alert('Error de conexión');
    } finally {
      setSavingCompany(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Cargando...</div>;

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-12">
      {/* User Section */}
      <section>
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 font-outfit">Mi Perfil</h1>
          <p className="text-gray-500 mt-2">Gestiona tu información personal y seguridad.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-1">
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
              <ImageUpload 
                label="Foto de Perfil"
                folder="avatars"
                currentImageUrl={formData.avatarUrl}
                onUploadSuccess={(url) => setFormData(prev => ({ ...prev, avatarUrl: url }))}
              />
            </div>
          </div>

          <div className="md:col-span-2">
            <form onSubmit={handleUserSubmit} className="bg-white border border-gray-200 rounded-2xl p-8 space-y-6 shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nombre Completo</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nueva Contraseña (opcional)</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  placeholder="Dejar en blanco para mantener"
                />
              </div>
              <div className="pt-4 flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-500/20 disabled:opacity-50"
                >
                  {saving ? 'Guardando...' : 'Actualizar Perfil'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Company Section (Admin Only) */}
      {isAdmin && (
        <section className="pt-12 border-t border-gray-200">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 font-outfit">Configuración de Empresa</h1>
            <p className="text-gray-500 mt-2">Personaliza el panel con la identidad de tu negocio.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-1">
              <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                <ImageUpload 
                  label="Logo de la Empresa"
                  folder="company"
                  currentImageUrl={companyData.logoUrl}
                  onUploadSuccess={(url) => setCompanyData(prev => ({ ...prev, logoUrl: url }))}
                />
                <p className="mt-4 text-xs text-gray-500 leading-relaxed italic">
                  Este logo aparecerá en la barra lateral y en los reportes generados.
                </p>
              </div>
            </div>

            <div className="md:col-span-2">
              <form onSubmit={handleCompanySubmit} className="bg-white border border-gray-200 rounded-2xl p-8 space-y-6 shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nombre de la Empresa</label>
                    <input
                      type="text"
                      required
                      value={companyData.companyName}
                      onChange={(e) => setCompanyData({...companyData, companyName: e.target.value})}
                      className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">NIT / TAX ID</label>
                    <input
                      type="text"
                      value={companyData.taxId}
                      onChange={(e) => setCompanyData({...companyData, taxId: e.target.value})}
                      className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                      placeholder="Ej: 900.123.456-7"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Teléfono de Contacto</label>
                    <input
                      type="text"
                      value={companyData.phone}
                      onChange={(e) => setCompanyData({...companyData, phone: e.target.value})}
                      className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Correo Corporativo</label>
                    <input
                      type="email"
                      value={companyData.email}
                      onChange={(e) => setCompanyData({...companyData, email: e.target.value})}
                      className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Dirección Principal</label>
                  <input
                    type="text"
                    value={companyData.address}
                    onChange={(e) => setCompanyData({...companyData, address: e.target.value})}
                    className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  />
                </div>
                <div className="pt-4 flex justify-end">
                  <button
                    type="submit"
                    disabled={savingCompany}
                    className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-500/20 disabled:opacity-50"
                  >
                    {savingCompany ? 'Guardando...' : 'Actualizar Empresa'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
