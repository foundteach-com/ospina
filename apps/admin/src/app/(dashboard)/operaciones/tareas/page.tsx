'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Plus, Search, Filter, Calendar as CalendarIcon, Clock, Activity, CheckCircle2, X, Edit3, Trash2, ChevronDown, Save } from 'lucide-react';
import TaskModal from '@/components/operations/TaskModal';

interface OpTask {
  id: string;
  name: string;
  description?: string | null;
  priority: string;
  status: string;
  dueDate: string | null;
  scheduledDate: string | null;
  frequency?: string | null;
  observations?: string | null;
  processId?: string;
  process?: { id: string; name: string; color: string; code: string };
}

interface OpProcess {
  id: string;
  name: string;
  code: string;
}

const statusColors: Record<string, string> = {
  PENDING: 'bg-amber-100 text-amber-800 border-amber-200',
  IN_PROGRESS: 'bg-blue-100 text-blue-800 border-blue-200',
  COMPLETED: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  CANCELLED: 'bg-red-100 text-red-800 border-red-200',
};

const statusLabels: Record<string, string> = {
  PENDING: 'Pendiente',
  IN_PROGRESS: 'En Progreso',
  COMPLETED: 'Completada',
  CANCELLED: 'Cancelada',
};

const priorityLabels: Record<string, string> = {
  HIGH: 'Alta',
  MEDIUM: 'Media',
  LOW: 'Baja',
};

const priorityColors: Record<string, string> = {
  HIGH: 'text-red-700 bg-red-50 border-red-200',
  MEDIUM: 'text-amber-700 bg-amber-50 border-amber-200',
  LOW: 'text-emerald-700 bg-emerald-50 border-emerald-200',
};

// Formateador seguro de fechas sin desfase UTC
function formatDateSafe(dateStr: string | null | undefined): string {
  if (!dateStr) return 'Sin fecha';
  const cleanDate = dateStr.split('T')[0];
  const parts = cleanDate.split('-');
  if (parts.length === 3) {
    const [year, month, day] = parts;
    return `${day}/${month}/${year}`;
  }
  return dateStr;
}

function formatDateInput(dateStr: string | null | undefined): string {
  if (!dateStr) return '';
  return dateStr.split('T')[0];
}

// ─── Inline Dropdown Component ────────────────────────────────────────────────
function InlineSelect({
  value,
  options,
  onChange,
  renderValue,
}: {
  value: string;
  options: { value: string; label: string; className?: string }[];
  onChange: (val: string) => void;
  renderValue: (val: string) => React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className="relative inline-block">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1 hover:opacity-80 transition-opacity group"
      >
        {renderValue(value)}
        <ChevronDown size={11} className="text-gray-400 group-hover:text-gray-600 transition-colors" />
      </button>
      {open && (
        <div className="absolute z-50 mt-1 left-0 bg-white border border-gray-200 rounded-xl shadow-lg py-1 min-w-[150px] animate-in fade-in slide-in-from-top-1 duration-150">
          {options.map(opt => (
            <button
              key={opt.value}
              onClick={() => { onChange(opt.value); setOpen(false); }}
              className={`w-full text-left px-3 py-2 text-xs font-semibold hover:bg-gray-50 transition-colors ${
                opt.value === value ? 'opacity-50 cursor-default' : ''
              }`}
            >
              <span className={`px-2 py-0.5 rounded-full border ${opt.className || ''}`}>{opt.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Inline Name Edit ─────────────────────────────────────────────────────────
function InlineNameEdit({
  taskId,
  value,
  onSave,
}: {
  taskId: string;
  value: string;
  onSave: (id: string, name: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  const commit = () => {
    if (draft.trim() && draft !== value) onSave(taskId, draft.trim());
    setEditing(false);
  };

  if (!editing) {
    return (
      <button
        onClick={() => { setDraft(value); setEditing(true); }}
        className="font-semibold text-gray-900 hover:text-blue-600 text-left leading-tight transition-colors group flex items-center gap-1.5"
      >
        {value}
        <Edit3 size={11} className="opacity-0 group-hover:opacity-40 transition-opacity flex-shrink-0" />
      </button>
    );
  }

  return (
    <div className="flex items-center gap-1">
      <input
        ref={inputRef}
        value={draft}
        onChange={e => setDraft(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') setEditing(false); }}
        className="text-sm font-semibold text-gray-900 border-b-2 border-blue-500 outline-none bg-transparent w-full min-w-0"
      />
      <button onClick={commit} className="p-1 text-emerald-600 hover:bg-emerald-50 rounded flex-shrink-0"><Save size={12} /></button>
      <button onClick={() => setEditing(false)} className="p-1 text-gray-400 hover:bg-gray-100 rounded flex-shrink-0"><X size={12} /></button>
    </div>
  );
}

export default function TasksListPage() {
  const [tasks, setTasks] = useState<OpTask[]>([]);
  const [processes, setProcesses] = useState<OpProcess[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');

  // Create / Edit Task Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<OpTask | null>(null);

  // Detail Modal State
  const [selectedTask, setSelectedTask] = useState<OpTask | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    fetchTasks();
    fetchProcesses();
  }, []);

  const fetchTasks = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/operations/tasks`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        // API returns a plain array directly
        setTasks(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Error fetching tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  // ── Inline field update ────────────────────────────────────────────────────
  const updateTaskField = async (taskId: string, patch: Record<string, any>) => {
    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/operations/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(patch),
      });
      if (res.ok) {
        setTasks(prev => prev.map(t => t.id === taskId ? { ...t, ...patch } : t));
      }
    } catch (err) {
      console.error('Error updating task:', err);
    }
  };

  const fetchProcesses = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/operations/processes?status=ACTIVE`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setProcesses(data.processes || []);
      }
    } catch (err) {
      console.error('Error fetching processes:', err);
    }
  };

  const openCreateModal = () => {
    setEditingTask(null);
    setIsModalOpen(true);
  };

  const openEditModal = (task: OpTask) => {
    setEditingTask(task);
    setIsDetailModalOpen(false);
    setIsModalOpen(true);
  };

  const handleUpdateTaskStatus = async (taskId: string, newStatus: string) => {
    setUpdatingStatus(true);
    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/operations/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        if (selectedTask) {
          setSelectedTask({ ...selectedTask, status: newStatus });
        }
        fetchTasks();
      }
    } catch (error) {
      console.error('Error updating task status:', error);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const openTaskDetail = (task: OpTask) => {
    setSelectedTask(task);
    setIsDetailModalOpen(true);
  };

  const filtered = tasks.filter(t => {
    const matchesSearch = t.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'ALL' || t.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Lista de Tareas</h1>
          <p className="text-gray-500 mt-2">Gestiona y haz seguimiento de todas las actividades operativas.</p>
        </div>
        <div className="flex gap-3">
          <Link href="/operaciones/kanban" className="bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 px-5 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-colors shadow-sm">
            Vista Kanban
          </Link>
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-colors shadow-sm"
            onClick={openCreateModal}
          >
            <Plus size={20} />
            Nueva Tarea
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Toolbar */}
        <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row gap-4 justify-between items-center bg-gray-50/50">
          <div className="flex items-center gap-3 w-full max-w-md relative">
            <Search className="absolute left-4 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Buscar tarea..."
              className="pl-11 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl w-full text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-1 shadow-sm">
              <Filter size={16} className="text-gray-400" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="py-1.5 bg-transparent text-sm focus:outline-none font-medium text-gray-700"
              >
                <option value="ALL">Todos los estados</option>
                <option value="PENDING">Pendientes</option>
                <option value="IN_PROGRESS">En Progreso</option>
                <option value="COMPLETED">Completadas</option>
                <option value="CANCELLED">Canceladas</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-white text-gray-500 font-medium border-b border-gray-100">
              <tr>
                <th className="py-4 px-6 font-semibold">Tarea</th>
                <th className="py-4 px-6 font-semibold">Proceso</th>
                <th className="py-4 px-6 font-semibold">Programada</th>
                <th className="py-4 px-6 font-semibold">Límite</th>
                <th className="py-4 px-6 font-semibold">Prioridad ✎</th>
                <th className="py-4 px-6 font-semibold">Estado ✎</th>
                <th className="py-4 px-6 font-semibold text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-500">
                    <Activity size={32} className="mx-auto text-gray-300 mb-3 animate-pulse" />
                    Cargando tareas...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-500">
                    <CheckCircle2 size={32} className="mx-auto text-gray-300 mb-3" />
                    No se encontraron tareas con estos filtros.
                  </td>
                </tr>
              ) : (
                filtered.map(t => (
                  <tr key={t.id} className="hover:bg-blue-50/20 transition-colors group">
                    {/* Nombre — inline editable */}
                    <td className="py-3.5 px-6 max-w-[200px]">
                      <InlineNameEdit
                        taskId={t.id}
                        value={t.name}
                        onSave={(id, name) => updateTaskField(id, { name })}
                      />
                    </td>

                    {/* Proceso */}
                    <td className="py-3.5 px-6">
                      {t.process ? (
                        <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ backgroundColor: t.process.color }} />
                          <span className="text-gray-700 font-medium text-xs bg-gray-100 px-2 py-1 rounded">{t.process.code}</span>
                        </div>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>

                    {/* Fecha programada */}
                    <td className="py-3.5 px-6">
                      <div className="flex items-center gap-1.5 text-gray-500 text-xs">
                        <CalendarIcon size={13} className="text-gray-400 flex-shrink-0" />
                        {formatDateSafe(t.scheduledDate)}
                      </div>
                    </td>

                    {/* Fecha límite */}
                    <td className="py-3.5 px-6 text-xs text-gray-500">
                      {formatDateSafe(t.dueDate)}
                    </td>

                    {/* Prioridad — inline dropdown */}
                    <td className="py-3.5 px-6">
                      <InlineSelect
                        value={t.priority}
                        options={[
                          { value: 'HIGH', label: 'Alta', className: priorityColors.HIGH },
                          { value: 'MEDIUM', label: 'Media', className: priorityColors.MEDIUM },
                          { value: 'LOW', label: 'Baja', className: priorityColors.LOW },
                        ]}
                        onChange={val => updateTaskField(t.id, { priority: val })}
                        renderValue={val => (
                          <span className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold tracking-wide border uppercase ${priorityColors[val]}`}>
                            {priorityLabels[val]}
                          </span>
                        )}
                      />
                    </td>

                    {/* Estado — inline dropdown */}
                    <td className="py-3.5 px-6">
                      <InlineSelect
                        value={t.status}
                        options={[
                          { value: 'PENDING', label: 'Pendiente', className: statusColors.PENDING },
                          { value: 'IN_PROGRESS', label: 'En Progreso', className: statusColors.IN_PROGRESS },
                          { value: 'COMPLETED', label: 'Completada', className: statusColors.COMPLETED },
                          { value: 'CANCELLED', label: 'Cancelada', className: statusColors.CANCELLED },
                        ]}
                        onChange={val => updateTaskField(t.id, { status: val })}
                        renderValue={val => (
                          <span className={`px-3 py-0.5 rounded-full text-[11px] font-semibold border ${statusColors[val]}`}>
                            {statusLabels[val]}
                          </span>
                        )}
                      />
                    </td>

                    {/* Acciones */}
                    <td className="py-3.5 px-6 text-right">
                      <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => openEditModal(t)}
                          className="text-blue-500 hover:text-blue-700 p-1.5 rounded-lg hover:bg-blue-50 transition-colors"
                          title="Editar completo"
                        >
                          <Edit3 size={15} />
                        </button>
                        <button 
                          onClick={() => openTaskDetail(t)}
                          className="text-gray-400 hover:text-gray-700 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                          title="Ver detalles"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0z"/><circle cx="12" cy="12" r="3"/></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Ver Detalle / Editar Estado de Tarea */}
      {isDetailModalOpen && selectedTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${statusColors[selectedTask.status]}`}>
                  {statusLabels[selectedTask.status]}
                </span>
                {selectedTask.process && (
                  <span className="text-xs font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    {selectedTask.process.code}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => openEditModal(selectedTask)}
                  className="text-gray-600 hover:text-blue-600 p-2 hover:bg-blue-50 rounded-full transition-colors flex items-center gap-1 text-xs font-semibold"
                  title="Editar Tarea"
                >
                  <Edit3 size={18} />
                </button>
                <button 
                  onClick={() => setIsDetailModalOpen(false)}
                  className="text-gray-400 hover:text-gray-700 p-2 hover:bg-gray-200 rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{selectedTask.name}</h2>
                {selectedTask.process && (
                  <p className="text-sm text-gray-500 mt-1">Proceso: {selectedTask.process.name}</p>
                )}
              </div>

              {selectedTask.description && (
                <div className="bg-gray-50 p-4 rounded-xl text-sm text-gray-700 border border-gray-100">
                  <p className="font-semibold text-xs text-gray-400 uppercase tracking-wider mb-1">Descripción</p>
                  <p>{selectedTask.description}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 text-sm bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                <div>
                  <span className="text-gray-500 text-xs block">Fecha Programada</span>
                  <span className="font-semibold text-gray-800 flex items-center gap-1.5 mt-0.5">
                    <CalendarIcon size={14} className="text-blue-500" />
                    {formatDateSafe(selectedTask.scheduledDate)}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 text-xs block">Fecha Límite</span>
                  <span className="font-semibold text-gray-800 flex items-center gap-1.5 mt-0.5">
                    <Clock size={14} className="text-blue-500" />
                    {formatDateSafe(selectedTask.dueDate)}
                  </span>
                </div>
              </div>

              {/* Cambiar Estado */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Cambiar Estado de la Tarea</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'] as const).map(st => (
                    <button
                      key={st}
                      disabled={updatingStatus}
                      onClick={() => handleUpdateTaskStatus(selectedTask.id, st)}
                      className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all ${
                        selectedTask.status === st 
                          ? 'ring-2 ring-blue-500 shadow-sm ' + statusColors[st]
                          : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      {statusLabels[st]}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex justify-between items-center">
              <button
                onClick={() => openEditModal(selectedTask)}
                className="text-blue-600 hover:text-blue-800 font-semibold text-sm flex items-center gap-1.5"
              >
                <Edit3 size={16} />
                Editar Tarea
              </button>
              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="bg-gray-900 hover:bg-gray-800 text-white px-5 py-2.5 rounded-xl font-medium text-sm shadow-sm"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Crear / Editar Tarea */}
      <TaskModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingTask(null);
        }}
        onSaved={fetchTasks}
        editingTask={editingTask}
        processes={processes}
      />
    </div>
  );
}
