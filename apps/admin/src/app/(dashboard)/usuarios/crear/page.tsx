'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function CreateUserPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'USER',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/register`, { // Using register endpoint or users create if available
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        router.push('/usuarios');
        router.refresh();
      } else {
        const error = await response.json();
        alert(error.message || 'Error creating user');
      }
    } catch (error) {
      console.error('Error creating user:', error);
      alert('Error creating user');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/usuarios" className="p-2 hover:bg-gray-800 rounded-lg transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        </Link>
        <h1 className="text-3xl font-bold text-white">Nuevo Usuario</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-8 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">Nombre</label>
          <input
            type="text"
            name="name"
            required
            value={formData.name}
            onChange={handleChange}
            className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
            placeholder="Nombre completo"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">Email</label>
          <input
            type="email"
            name="email"
            required
            value={formData.email}
            onChange={handleChange}
            className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
            placeholder="ejemplo@correo.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">Contraseña</label>
          <input
            type="password"
            name="password"
            required
            minLength={6}
            value={formData.password}
            onChange={handleChange}
            className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
            placeholder="******"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">Rol</label>
          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
          >
            <option value="USER">Cliente (User)</option>
            <option value="ADMIN">Administrador</option>
            <option value="EMPLOYEE">Empleado</option>
          </select>
        </div>

        <div className="pt-4 flex justify-end gap-4">
          <Link
            href="/usuarios"
            className="px-6 py-3 rounded-xl font-medium text-gray-400 hover:text-white hover:bg-gray-800 transition-all"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl font-medium transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Guardando...' : 'Guardar Usuario'}
          </button>
        </div>
      </form>
    </div>
  );
}
