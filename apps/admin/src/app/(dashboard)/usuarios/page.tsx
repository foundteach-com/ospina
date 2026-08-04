'use client';

import { useState, useEffect } from 'react';
import { useDialog } from '@/context/DialogContext';
import { Plus, Search, Edit3, Trash2, Key, ShieldOff, ShieldCheck, X, Save } from 'lucide-react';

interface User {
  id: string;
  name: string | null;
  email: string;
  role: string;
  isActive: boolean;
  accessRoleId: string | null;
  moduleAccess: string[];
  permissions: string[];
  createdAt: string;
  accessRole?: { name: string };
}

interface AccessRole {
  id: string;
  name: string;
}

const AVAILABLE_MODULES = [
  'operaciones', 'inventario', 'compras', 'ventas', 'proveedores', 'clientes', 'flujo-caja', 'usuarios', 'roles'
];

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<AccessRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<'datos' | 'rol' | 'modulos'>('datos');
  
  const { confirm, showAlert } = useDialog();

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    isActive: true,
    accessRoleId: '',
    moduleAccess: [] as string[],
    permissions: [] as string[]
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const headers = { Authorization: `Bearer ${token}` };
      
      const [usersRes, rolesRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/users`, { headers }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/roles`, { headers })
      ]);
      
      if (usersRes.ok && rolesRes.ok) {
        setUsers(await usersRes.json());
        setRoles(await rolesRes.json());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditingUser(null);
    setForm({ name: '', email: '', password: '', isActive: true, accessRoleId: '', moduleAccess: [], permissions: [] });
    setActiveTab('datos');
    setIsModalOpen(true);
  };

  const openEdit = (user: User) => {
    setEditingUser(user);
    setForm({
      name: user.name || '',
      email: user.email,
      password: '',
      isActive: user.isActive,
      accessRoleId: user.accessRoleId || '',
      moduleAccess: user.moduleAccess || [],
      permissions: user.permissions || []
    });
    setActiveTab('datos');
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('access_token');
      const isEdit = !!editingUser;
      const url = isEdit ? `${process.env.NEXT_PUBLIC_API_URL}/users/${editingUser.id}` : `${process.env.NEXT_PUBLIC_API_URL}/auth/register`;
      const method = isEdit ? 'PATCH' : 'POST';

      const payload = { ...form };
      if (isEdit && !payload.password) {
        delete (payload as any).password;
      }
      if (!payload.accessRoleId) delete (payload as any).accessRoleId;

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        showAlert({ title: 'Éxito', message: `Usuario ${isEdit ? 'actualizado' : 'creado'} con éxito`, type: 'success' });
        setIsModalOpen(false);
        fetchData();
      } else {
        showAlert({ title: 'Error', message: 'Error al guardar el usuario', type: 'danger' });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const toggleStatus = async (user: User) => {
    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${user.id}/toggle-status`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const resetPassword = async (user: User) => {
    const confirmed = await confirm({ title: '¿Restablecer contraseña?', message: `Se generará una contraseña temporal para ${user.email}` });
    if (!confirmed) return;
    
    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${user.id}/reset-password`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({})
      });
      if (res.ok) {
        const data = await res.json();
        showAlert({ title: 'Contraseña Temporal', message: `Contraseña temporal: ${data.tempPassword} (Cópiala, no se volverá a mostrar)`, type: 'success' });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    const confirmed = await confirm({ title: '¿Eliminar usuario?', message: 'Esta acción no se puede deshacer.', type: 'danger' });
    if (!confirmed) return;
    
    try {
      const token = localStorage.getItem('access_token');
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchData();
    } catch (err) {
      console.error(err);
    }
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

  const filteredUsers = users.filter(u => 
    (u.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="p-8 text-center text-gray-500">Cargando usuarios...</div>;

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Usuarios del Sistema</h1>
          <p className="text-gray-500 text-sm mt-1">Gestiona los accesos y roles</p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Buscar..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>
          <button onClick={openCreate} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2">
            <Plus size={16} /> Nuevo Usuario
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Usuario</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Perfil / Rol</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Estado</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredUsers.map(user => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="font-medium text-gray-900">{user.name || 'Sin nombre'}</div>
                  <div className="text-sm text-gray-500">{user.email}</div>
                </td>
                <td className="px-6 py-4">
                  {user.accessRole ? (
                    <span className="px-2 py-1 bg-purple-50 text-purple-700 text-xs rounded-md font-medium">{user.accessRole.name}</span>
                  ) : (
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md font-medium">{user.role} (Legacy)</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <button 
                    onClick={() => toggleStatus(user)}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${user.isActive ? 'bg-green-50 text-green-700 hover:bg-red-50 hover:text-red-700' : 'bg-red-50 text-red-700 hover:bg-green-50 hover:text-green-700'}`}
                  >
                    {user.isActive ? <ShieldCheck size={14} /> : <ShieldOff size={14} />}
                    {user.isActive ? 'Activo' : 'Inactivo'}
                  </button>
                </td>
                <td className="px-6 py-4 text-right">
                  <button onClick={() => resetPassword(user)} className="text-gray-400 hover:text-orange-500 p-2" title="Restablecer Contraseña">
                    <Key size={18} />
                  </button>
                  <button onClick={() => openEdit(user)} className="text-gray-400 hover:text-blue-600 p-2" title="Editar">
                    <Edit3 size={18} />
                  </button>
                  <button onClick={() => handleDelete(user.id)} className="text-gray-400 hover:text-red-600 p-2 ml-1" title="Eliminar">
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
            {filteredUsers.length === 0 && (
              <tr><td colSpan={4} className="p-8 text-center text-gray-500">No hay usuarios</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">{editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-500"><X size={20} /></button>
            </div>
            
            <div className="flex border-b border-gray-200 px-5 pt-3">
              <button onClick={() => setActiveTab('datos')} className={`px-4 py-2 text-sm font-medium border-b-2 ${activeTab === 'datos' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500'}`}>Datos Básicos</button>
              <button onClick={() => setActiveTab('rol')} className={`px-4 py-2 text-sm font-medium border-b-2 ${activeTab === 'rol' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500'}`}>Rol de Acceso</button>
              <button onClick={() => setActiveTab('modulos')} className={`px-4 py-2 text-sm font-medium border-b-2 ${activeTab === 'modulos' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500'}`}>Módulos Excepcionales</button>
            </div>
            
            <form onSubmit={handleSave} className="flex flex-col flex-1 overflow-hidden">
              <div className="p-6 overflow-y-auto flex-1">
                
                {activeTab === 'datos' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo</label>
                      <input type="text" required value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico</label>
                      <input type="email" required value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                    </div>
                    {!editingUser && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
                        <input type="password" required value={form.password} onChange={e => setForm({...form, password: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'rol' && (
                  <div className="space-y-4">
                    <p className="text-sm text-gray-500">Asigna un perfil predefinido para aplicar automáticamente los permisos de ese perfil.</p>
                    <select 
                      value={form.accessRoleId} 
                      onChange={e => setForm({...form, accessRoleId: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    >
                      <option value="">-- Sin Rol (Personalizado) --</option>
                      {roles.map(r => (
                        <option key={r.id} value={r.id}>{r.name}</option>
                      ))}
                    </select>
                  </div>
                )}

                {activeTab === 'modulos' && (
                  <div className="space-y-4">
                    <p className="text-sm text-gray-500 mb-4">Activa los módulos a los que este usuario tendrá acceso directamente y sus permisos (sobreescribe los del rol).</p>
                    <div className="overflow-x-auto border border-gray-200 rounded-lg">
                      <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 border-b border-gray-200">
                          <tr>
                            <th className="px-4 py-3 font-medium text-gray-700">Módulo</th>
                            <th className="px-4 py-3 font-medium text-gray-700 text-center">Acceso (Menú)</th>
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
                )}

              </div>
              <div className="p-5 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">Cancelar</button>
                <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 flex items-center gap-2"><Save size={16} /> Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
