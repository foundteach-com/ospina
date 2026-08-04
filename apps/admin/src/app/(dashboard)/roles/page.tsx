'use client';

import { useState, useEffect } from 'react';
import { useDialog } from '@/context/DialogContext';
import { Plus, Edit3, Trash2, X, Save } from 'lucide-react';

interface AccessRole {
  id: string;
  name: string;
  description: string;
  moduleAccess: string[];
  permissions: string[];
}

const AVAILABLE_MODULES = [
  'operaciones', 'inventario', 'compras', 'ventas', 'proveedores', 'clientes', 'flujo-caja', 'usuarios', 'roles'
];

export default function RolesPage() {
  const [roles, setRoles] = useState<AccessRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<AccessRole | null>(null);
  const { confirm, showAlert } = useDialog();

  const [form, setForm] = useState<{name: string, description: string, moduleAccess: string[], permissions: string[]}>({
    name: '',
    description: '',
    moduleAccess: [],
    permissions: []
  });

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/roles`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setRoles(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingRole(null);
    setForm({ name: '', description: '', moduleAccess: [], permissions: [] });
    setIsModalOpen(true);
  };

  const openEditModal = (role: AccessRole) => {
    setEditingRole(role);
    setForm({
      name: role.name,
      description: role.description || '',
      moduleAccess: role.moduleAccess || [],
      permissions: role.permissions || []
    });
    setIsModalOpen(true);
  };

  const toggleModule = (mod: string) => {
    setForm(prev => {
      const isSelected = prev.moduleAccess.includes(mod);
      if (isSelected) {
        return { 
          ...prev, 
          moduleAccess: prev.moduleAccess.filter(m => m !== mod),
          permissions: prev.permissions.filter(p => !p.startsWith(`${mod}:`))
        };
      } else {
        return { 
          ...prev, 
          moduleAccess: [...prev.moduleAccess, mod],
          permissions: [...prev.permissions, `${mod}:read`]
        };
      }
    });
  };

  const togglePermission = (mod: string, action: string) => {
    const perm = `${mod}:${action}`;
    setForm(prev => {
      if (prev.permissions.includes(perm)) {
        return { ...prev, permissions: prev.permissions.filter(p => p !== perm) };
      }
      return { ...prev, permissions: [...prev.permissions, perm] };
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name) return;

    try {
      const token = localStorage.getItem('access_token');
      const isEdit = !!editingRole;
      const url = isEdit ? `${process.env.NEXT_PUBLIC_API_URL}/roles/${editingRole.id}` : `${process.env.NEXT_PUBLIC_API_URL}/roles`;
      const method = isEdit ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(form)
      });

      if (res.ok) {
        showAlert({ title: 'Éxito', message: `Rol ${isEdit ? 'actualizado' : 'creado'} correctamente`, type: 'success' });
        setIsModalOpen(false);
        fetchRoles();
      } else {
        showAlert({ title: 'Error', message: 'Error al guardar el rol', type: 'danger' });
      }
    } catch (err) {
      console.error(err);
      showAlert({ title: 'Error', message: 'Error de conexión', type: 'danger' });
    }
  };

  const handleDelete = async (id: string) => {
    const confirmed = await confirm({ title: '¿Eliminar rol?', message: '¿Estás seguro de que deseas eliminar este rol? Se desasignará de los usuarios que lo tengan.' });
    if (!confirmed) return;

    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/roles/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        showAlert({ title: 'Éxito', message: 'Rol eliminado', type: 'success' });
        fetchRoles();
      } else {
        showAlert({ title: 'Error', message: 'Error al eliminar el rol', type: 'danger' });
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Cargando roles...</div>;

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Roles y Perfiles</h1>
          <p className="text-gray-500 text-sm mt-1">Administra los roles de acceso del sistema</p>
        </div>
        <button
          onClick={openCreateModal}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
        >
          <Plus size={16} /> Nuevo Rol
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Nombre del Rol</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Descripción</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Módulos Acceso</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {roles.map(role => (
              <tr key={role.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <span className="font-medium text-gray-900">{role.name}</span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">{role.description}</td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-1">
                    {(role.moduleAccess || []).map(m => (
                      <span key={m} className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-md">
                        {m}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <button onClick={() => openEditModal(role)} className="text-gray-400 hover:text-blue-600 p-2">
                    <Edit3 size={18} />
                  </button>
                  <button onClick={() => handleDelete(role.id)} className="text-gray-400 hover:text-red-600 p-2 ml-2">
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
            {roles.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-gray-500">No hay roles configurados</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">
                {editingRole ? 'Editar Rol' : 'Nuevo Rol'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-500 p-1">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="flex flex-col flex-1 overflow-hidden">
              <div className="p-6 overflow-y-auto flex-1 space-y-6">
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                    <input
                      type="text"
                      required
                      value={form.name}
                      onChange={e => setForm({...form, name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                    <input
                      type="text"
                      value={form.description}
                      onChange={e => setForm({...form, description: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-3 border-b pb-2">Configuración de Accesos y Permisos</h3>
                  <div className="overflow-x-auto border border-gray-200 rounded-lg">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-4 py-3 font-medium text-gray-700">Módulo</th>
                          <th className="px-4 py-3 font-medium text-gray-700 text-center">Acceso (Ver menú)</th>
                          <th className="px-4 py-3 font-medium text-gray-700 text-center">Leer</th>
                          <th className="px-4 py-3 font-medium text-gray-700 text-center">Crear</th>
                          <th className="px-4 py-3 font-medium text-gray-700 text-center">Actualizar</th>
                          <th className="px-4 py-3 font-medium text-gray-700 text-center">Eliminar</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {AVAILABLE_MODULES.map(mod => {
                          const hasModule = form.moduleAccess.includes(mod);
                          const hasRead = form.permissions.includes(`${mod}:read`);
                          const hasCreate = form.permissions.includes(`${mod}:create`);
                          const hasUpdate = form.permissions.includes(`${mod}:update`);
                          const hasDelete = form.permissions.includes(`${mod}:delete`);
                          
                          return (
                            <tr key={mod} className="hover:bg-gray-50">
                              <td className="px-4 py-3 capitalize font-medium text-gray-800">{mod.replace('-', ' ')}</td>
                              <td className="px-4 py-3 text-center">
                                <input type="checkbox" checked={hasModule} onChange={() => toggleModule(mod)} className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer"/>
                              </td>
                              <td className="px-4 py-3 text-center">
                                <input type="checkbox" disabled={!hasModule} checked={hasRead} onChange={() => togglePermission(mod, 'read')} className="w-4 h-4 text-blue-600 rounded border-gray-300 disabled:opacity-40 cursor-pointer"/>
                              </td>
                              <td className="px-4 py-3 text-center">
                                <input type="checkbox" disabled={!hasModule} checked={hasCreate} onChange={() => togglePermission(mod, 'create')} className="w-4 h-4 text-blue-600 rounded border-gray-300 disabled:opacity-40 cursor-pointer"/>
                              </td>
                              <td className="px-4 py-3 text-center">
                                <input type="checkbox" disabled={!hasModule} checked={hasUpdate} onChange={() => togglePermission(mod, 'update')} className="w-4 h-4 text-blue-600 rounded border-gray-300 disabled:opacity-40 cursor-pointer"/>
                              </td>
                              <td className="px-4 py-3 text-center">
                                <input type="checkbox" disabled={!hasModule} checked={hasDelete} onChange={() => togglePermission(mod, 'delete')} className="w-4 h-4 text-blue-600 rounded border-gray-300 disabled:opacity-40 cursor-pointer"/>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>
              <div className="p-5 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                  Cancelar
                </button>
                <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 flex items-center gap-2">
                  <Save size={16} /> Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
