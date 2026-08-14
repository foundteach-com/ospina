'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Search, Activity, MoreVertical, X, Save, Edit3, Trash2 } from 'lucide-react';

interface OpProcess {
  id: string;
  name: string;
  description: string | null;
  objective: string | null;
  status: string;
  color: string;
  icon: string;
}

export default function ProcessesCatalogPage() {
  const [processes, setProcesses] = useState<OpProcess[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Create / Edit Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProcess, setEditingProcess] = useState<OpProcess | null>(null);
  const [saving, setSaving] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: '',
    description: '',
    objective: '',
    color: '#3b82f6',
    status: 'ACTIVE'
  });

  useEffect(() => {
    fetchProcesses();
  }, []);

  const fetchProcesses = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/operations/processes`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setProcesses(data.processes || []);
      }
    } catch (err) {
      console.error('Error fetching processes:', err);
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingProcess(null);
    setForm({ name: '', description: '', objective: '', color: '#3b82f6', status: 'ACTIVE' });
    setIsModalOpen(true);
  };

  const openEditModal = (processItem: OpProcess) => {
    setEditingProcess(processItem);
    setForm({
      name: processItem.name || '',
      description: processItem.description || '',
      objective: processItem.objective || '',
      color: processItem.color || '#3b82f6',
      status: processItem.status || 'ACTIVE'
    });
    setActiveMenuId(null);
    setIsModalOpen(true);
  };

  const handleSaveProcess = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name) return;
    setSaving(true);
    try {
      const token = localStorage.getItem('access_token');
      const isEdit = !!editingProcess;
      const url = isEdit 
        ? `${process.env.NEXT_PUBLIC_API_URL}/operations/processes/${editingProcess.id}`
        : `${process.env.NEXT_PUBLIC_API_URL}/operations/processes`;
      
      const method = isEdit ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(form)
      });
      if (res.ok) {
        setIsModalOpen(false);
        setEditingProcess(null);
        setForm({ name: '', description: '', objective: '', color: '#3b82f6', status: 'ACTIVE' });
        fetchProcesses();
      }
    } catch (error) {
      console.error('Error saving process:', error);
    } finally {
      setSaving(false);
    }
  };

  const filtered = processes.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8" onClick={() => setActiveMenuId(null)}>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Catálogo de Procesos</h1>
          <p className="text-gray-500 mt-2">Gestiona los procesos principales de la empresa.</p>
        </div>
        <button
          onClick={openCreateModal}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-colors shadow-sm"
        >
          <Plus size={20} />
          Nuevo Proceso
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center gap-4 mb-8 relative">
          <Search className="absolute left-4 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Buscar por nombre..."
            className="pl-12 pr-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl w-full max-w-md focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {loading ? (
          <div className="text-center py-10 text-gray-500">Cargando procesos...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(p => (
              <div key={p.id} className="bg-white border border-gray-100 rounded-2xl p-6 hover:border-blue-500 hover:shadow-lg transition-all duration-300 group relative flex flex-col h-full">
                
                <div className="flex justify-between items-start mb-5">
                  <div className="flex items-center gap-4">
                    <div 
                      className="w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-sm transform group-hover:scale-105 transition-transform duration-300"
                      style={{ backgroundColor: p.color || '#3b82f6' }}
                    >
                      <Activity size={26} />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 leading-tight text-lg">{p.name}</h3>
                    </div>
                  </div>

                  {/* Menú de 3 puntos */}
                  <div className="relative">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveMenuId(activeMenuId === p.id ? null : p.id);
                      }}
                      className="text-gray-400 hover:text-gray-900 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <MoreVertical size={20} />
                    </button>

                    {activeMenuId === p.id && (
                      <div 
                        onClick={(e) => e.stopPropagation()}
                        className="absolute right-0 mt-1 w-44 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-30 animate-in fade-in slide-in-from-top-2 duration-150"
                      >
                        <button
                          onClick={() => openEditModal(p)}
                          className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 flex items-center gap-2 font-medium transition-colors"
                        >
                          <Edit3 size={16} />
                          Editar Proceso
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                
                <p className="text-sm text-gray-500 mb-6 flex-1">
                  {p.description || 'Sin descripción detallada.'}
                </p>

                <div className="flex items-center justify-between pt-5 border-t border-gray-50 mt-auto">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 ${
                    p.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-gray-50 text-gray-600 border border-gray-200'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${p.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-gray-400'}`}></span>
                    {p.status === 'ACTIVE' ? 'Activo' : 'Inactivo'}
                  </span>
                  
                  <Link 
                    href={`/operaciones/procesos/${p.id}`}
                    className="text-sm font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 px-3 py-1.5 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors"
                  >
                    Detalles
                  </Link>
                </div>
              </div>
            ))}
            {filtered.length === 0 && (
              <div className="col-span-full text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                <Activity size={40} className="mx-auto text-gray-300 mb-3" />
                <p className="text-gray-500 font-medium text-lg">No se encontraron procesos.</p>
                <p className="text-gray-400 text-sm mt-1">Intenta con otros términos de búsqueda o crea un nuevo proceso.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal Crear / Editar Proceso */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h2 className="text-xl font-bold text-gray-900">
                {editingProcess ? 'Editar Proceso' : 'Crear Nuevo Proceso'}
              </h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-700 p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSaveProcess} className="p-6 space-y-5">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-700">Nombre del Proceso</label>
                <input
                  required
                  type="text"
                  placeholder="Ej. Gestión de Compras"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-700">Descripción (Opcional)</label>
                <textarea
                  rows={2}
                  placeholder="Describe brevemente de qué trata este proceso..."
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all resize-none"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-700">Objetivo General (Opcional)</label>
                <textarea
                  rows={2}
                  placeholder="¿Cuál es el objetivo principal?"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all resize-none"
                  value={form.objective}
                  onChange={(e) => setForm({ ...form, objective: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700">Color Identificador</label>
                  <div className="flex gap-2 items-center">
                    <input
                      type="color"
                      className="w-10 h-10 p-1 bg-white border border-gray-200 rounded-lg cursor-pointer"
                      value={form.color}
                      onChange={(e) => setForm({ ...form, color: e.target.value })}
                    />
                    <span className="text-sm text-gray-500 uppercase">{form.color}</span>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700">Estado</label>
                  <select
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                  >
                    <option value="ACTIVE">Activo</option>
                    <option value="INACTIVE">Inactivo</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 mt-6 border-t border-gray-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 text-gray-600 font-medium hover:bg-gray-100 rounded-xl transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-blue-600 hover:bg-blue-700 disabled:opacity-70 text-white px-6 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-colors shadow-sm"
                >
                  {saving ? 'Guardando...' : (
                    <>
                      <Save size={18} />
                      {editingProcess ? 'Guardar Cambios' : 'Crear Proceso'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
