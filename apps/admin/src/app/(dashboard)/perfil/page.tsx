'use client';

import { useEffect, useState } from 'react';
import ImageUpload from '@/components/common/ImageUpload';

export default function ProfilePage() {
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

        let apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
        if (typeof window !== 'undefined' && (apiUrl.includes('localhost') || !apiUrl)) {
          const hostname = window.location.hostname;
          if (hostname.includes('ospinacomercializadoraysuministros.com')) {
            apiUrl = 'https://api.ospinacomercializadoraysuministros.com';
          }
        }

        if (userData) {
          const user = JSON.parse(userData);
          setIsAdmin(user.role === 'ADMIN');
        }

        const userRes = await fetch(`${apiUrl}/users/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (userRes.ok) {
          const data = await userRes.json();
          setFormData({
            name: data.name || '',
            email: data.email || '',
            avatarUrl: data.avatarUrl || '',
            password: '',
          });
        }

        const settingsRes = await fetch(`${apiUrl}/settings`, {
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

      let apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
      if (typeof window !== 'undefined' && (apiUrl.includes('localhost') || !apiUrl)) {
        const hostname = window.location.hostname;
        if (hostname.includes('ospinacomercializadoraysuministros.com')) {
          apiUrl = 'https://api.ospinacomercializadoraysuministros.com';
        }
      }

      const response = await fetch(`${apiUrl}/users/profile`, {
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

      let apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
      if (typeof window !== 'undefined' && (apiUrl.includes('localhost') || !apiUrl)) {
        const hostname = window.location.hostname;
        if (hostname.includes('ospinacomercializadoraysuministros.com')) {
          apiUrl = 'https://api.ospinacomercializadoraysuministros.com';
        }
      }

      const response = await fetch(`${apiUrl}/settings`, {
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
    <div className="mx-auto max-w-6xl space-y-10 p-8">
      <section className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-blue-600">Mi cuenta</p>
            <h1 className="mt-2 text-3xl font-bold text-gray-900">Perfil del administrador</h1>
            <p className="mt-2 max-w-2xl text-gray-500">
              Administra tus datos personales, seguridad y la información institucional de la empresa.
            </p>
          </div>
          <div className="rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-700">
            <p className="font-semibold">{isAdmin ? 'Administrador' : 'Usuario'}</p>
            <p className="mt-1">Acceso completo al panel</p>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-8 lg:grid-cols-[320px_1fr]">
        <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <ImageUpload
            label="Foto de perfil"
            folder="avatars"
            currentImageUrl={formData.avatarUrl}
            onUploadSuccess={(url) => setFormData((prev) => ({ ...prev, avatarUrl: url }))}
          />

          <div className="mt-6 space-y-3 border-t border-gray-100 pt-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">Nombre</p>
              <p className="mt-1 font-semibold text-gray-900">{formData.name || 'Sin nombre'}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">Correo</p>
              <p className="mt-1 break-all text-sm text-gray-600">{formData.email || 'Sin correo'}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">Rol</p>
              <p className="mt-1 text-sm text-gray-600">{isAdmin ? 'Administrador' : 'Usuario'}</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleUserSubmit} className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Información personal</h2>
            <p className="mt-1 text-sm text-gray-500">Actualiza tus datos de contacto y la contraseña de acceso.</p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Nombre completo</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Correo electrónico</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
            </div>
          </div>

          <div className="mt-6">
            <label className="mb-2 block text-sm font-medium text-gray-700">Nueva contraseña</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              placeholder="Dejar en blanco para mantener la actual"
            />
          </div>

          <div className="mt-8 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-blue-600 px-8 py-3 font-semibold text-white shadow-lg shadow-blue-500/20 transition hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? 'Guardando...' : 'Actualizar perfil'}
            </button>
          </div>
        </form>
      </section>

      {isAdmin && (
        <section className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Información de la empresa</h2>
            <p className="mt-1 text-sm text-gray-500">Personaliza los datos institucionales que se mostrarán en el panel.</p>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[320px_1fr]">
            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
              <ImageUpload
                label="Logo de la empresa"
                folder="company"
                currentImageUrl={companyData.logoUrl}
                onUploadSuccess={(url) => setCompanyData((prev) => ({ ...prev, logoUrl: url }))}
              />
              <p className="mt-4 text-sm text-gray-500">
                Este logo aparecerá en la interfaz y en los reportes del sistema.
              </p>
            </div>

            <form onSubmit={handleCompanySubmit} className="space-y-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">Nombre de la empresa</label>
                  <input
                    type="text"
                    required
                    value={companyData.companyName}
                    onChange={(e) => setCompanyData({ ...companyData, companyName: e.target.value })}
                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">NIT / TAX ID</label>
                  <input
                    type="text"
                    value={companyData.taxId}
                    onChange={(e) => setCompanyData({ ...companyData, taxId: e.target.value })}
                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    placeholder="Ej: 900.123.456-7"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">Teléfono</label>
                  <input
                    type="text"
                    value={companyData.phone}
                    onChange={(e) => setCompanyData({ ...companyData, phone: e.target.value })}
                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">Correo corporativo</label>
                  <input
                    type="email"
                    value={companyData.email}
                    onChange={(e) => setCompanyData({ ...companyData, email: e.target.value })}
                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Dirección principal</label>
                <input
                  type="text"
                  value={companyData.address}
                  onChange={(e) => setCompanyData({ ...companyData, address: e.target.value })}
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={savingCompany}
                  className="rounded-xl bg-indigo-600 px-8 py-3 font-semibold text-white shadow-lg shadow-indigo-500/20 transition hover:bg-indigo-700 disabled:opacity-50"
                >
                  {savingCompany ? 'Guardando...' : 'Actualizar empresa'}
                </button>
              </div>
            </form>
          </div>
        </section>
      )}
    </div>
  );
}
