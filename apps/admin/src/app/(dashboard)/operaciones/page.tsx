'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  Activity,
  CalendarDays,
  LayoutList,
  ArrowRight,
  ChevronDown,
  Edit3,
  Save,
  X,
  Plus,
  Trash2,
} from 'lucide-react';
import TaskModal from '@/components/operations/TaskModal';

interface OpTask {
  id: string;
  name: string;
  status: string;
  priority: string;
  scheduledDate: string | null;
  dueDate: string | null;
  processId?: string;
  process?: { id: string; name: string; code: string; color: string };
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

const priorityColors: Record<string, string> = {
  HIGH: 'text-red-700 bg-red-50 border-red-200',
  MEDIUM: 'text-amber-700 bg-amber-50 border-amber-200',
  LOW: 'text-emerald-700 bg-emerald-50 border-emerald-200',
};

const priorityLabels: Record<string, string> = {
  HIGH: 'Alta',
  MEDIUM: 'Media',
  LOW: 'Baja',
};

function formatDateSafe(dateStr: string | null | undefined): string {
  if (!dateStr) return '—';
  const clean = dateStr.split('T')[0].split('-');
  if (clean.length === 3) return `${clean[2]}/${clean[1]}/${clean[0]}`;
  return dateStr;
}

// ─── Inline Dropdown ───────────────────────────────────────────────────────
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
        <div className="absolute z-50 mt-1 left-0 bg-white border border-gray-200 rounded-xl shadow-lg py-1 min-w-[140px] animate-in fade-in slide-in-from-top-1 duration-150">
          {options.map(opt => (
            <button
              key={opt.value}
              onClick={() => { onChange(opt.value); setOpen(false); }}
              className={`w-full text-left px-3 py-2 text-xs font-semibold hover:bg-gray-50 transition-colors ${opt.value === value ? 'opacity-50 cursor-default' : ''}`}
            >
              <span className={`px-2 py-0.5 rounded-full border ${opt.className || ''}`}>
                {opt.label}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Inline Task Name Edit ─────────────────────────────────────────────────
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
        <Edit3 size={12} className="opacity-0 group-hover:opacity-40 transition-opacity" />
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
        className="text-sm font-semibold text-gray-900 border-b-2 border-blue-500 outline-none bg-transparent w-full"
      />
      <button onClick={commit} className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"><Save size={13} /></button>
      <button onClick={() => setEditing(false)} className="p-1 text-gray-400 hover:bg-gray-100 rounded"><X size={13} /></button>
    </div>
  );
}

export default function OperationsDashboard() {
  const [loading, setLoading] = useState(true);
  const [tasksLoading, setTasksLoading] = useState(true);
  const [tasks, setTasks] = useState<OpTask[]>([]);
  const [processes, setProcesses] = useState<OpProcess[]>([]);
  const [indicators, setIndicators] = useState({
    totalTasks: 0,
    pendingTasks: 0,
    completedTasks: 0,
    completedToday: 0,
    activeProcesses: 0,
    overdueTasks: 0,
  });

  // Task creation / edit modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<OpTask | null>(null);

  // Delete confirmation state
  const [taskToDelete, setTaskToDelete] = useState<OpTask | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchIndicators();
    fetchTasks();
    fetchProcesses();
  }, []);

  const fetchIndicators = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/operations/dashboard/indicators`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setIndicators(await res.json());
    } catch (err) {
      console.error('Error fetching indicators:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTasks = async () => {
    setTasksLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/operations/tasks`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        // The API returns a plain array
        setTasks(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Error fetching tasks:', err);
    } finally {
      setTasksLoading(false);
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

  // ── Inline update helpers ────────────────────────────────────────────────
  const updateTaskField = async (taskId: string, patch: Record<string, any>) => {
    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/operations/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(patch),
      });
      if (res.ok) {
        // Optimistic update
        setTasks(prev => prev.map(t => t.id === taskId ? { ...t, ...patch } : t));
        // Re-fetch indicators if status changed
        if ('status' in patch) fetchIndicators();
      }
    } catch (err) {
      console.error('Error updating task:', err);
    }
  };

  const handleDeleteTask = async () => {
    if (!taskToDelete) return;
    setDeleting(true);
    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/operations/tasks/${taskToDelete.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setTasks(prev => prev.filter(t => t.id !== taskToDelete.id));
        fetchIndicators();
        setIsDeleteModalOpen(false);
        setTaskToDelete(null);
      }
    } catch (err) {
      console.error('Error deleting task:', err);
    } finally {
      setDeleting(false);
    }
  };

  const openDeleteModal = (task: OpTask) => {
    setTaskToDelete(task);
    setIsDeleteModalOpen(true);
  };

  const openEditModal = (task: OpTask) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const menuItems = [
    { name: 'Procesos', href: '/operaciones/procesos', icon: Activity, desc: 'Catálogo de procesos', color: 'bg-purple-50 text-purple-600 group-hover:bg-purple-600 group-hover:text-white' },
    { name: 'Kanban', href: '/operaciones/kanban', icon: LayoutList, desc: 'Tablero visual', color: 'bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white' },
    { name: 'Cronograma', href: '/operaciones/tareas/cronograma', icon: CalendarDays, desc: 'Vista semanal', color: 'bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white' },
    { name: 'Calendario', href: '/operaciones/tareas/calendario', icon: CalendarDays, desc: 'Vista mensual', color: 'bg-amber-50 text-amber-600 group-hover:bg-amber-600 group-hover:text-white' },
  ];

  const statCards = [
    { title: 'Tareas Pendientes', value: indicators.pendingTasks, icon: Clock, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' },
    { title: 'Tareas Vencidas', value: indicators.overdueTasks, icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-100' },
    { title: 'Realizadas Hoy', value: indicators.completedToday, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' },
    { title: 'Procesos Activos', value: indicators.activeProcesses, icon: Activity, color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-100' },
  ];

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Operaciones</h1>
          <p className="text-gray-500 mt-1">Centro de organización y planificación de actividades operativas.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-colors shadow-sm"
        >
          <Plus size={18} />
          Nueva Tarea
        </button>
      </div>

      {/* ── KPI Cards ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className={`bg-white p-5 rounded-2xl border ${stat.border} shadow-sm flex items-center gap-4`}>
              <div className={`p-3 rounded-xl ${stat.bg}`}>
                <Icon size={22} className={stat.color} />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium leading-tight">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900 mt-0.5">
                  {loading ? <span className="animate-pulse">…</span> : stat.value}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Quick Access — horizontal row ──────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {menuItems.map((item, i) => {
          const Icon = item.icon;
          return (
            <Link
              key={i}
              href={item.href}
              className="bg-white border border-gray-100 rounded-2xl p-4 flex items-center gap-3 hover:border-blue-300 hover:shadow-md transition-all group"
            >
              <div className={`p-2.5 rounded-xl transition-colors ${item.color}`}>
                <Icon size={18} />
              </div>
              <div>
                <h3 className="font-semibold text-sm text-gray-900 group-hover:text-blue-600 transition-colors">{item.name}</h3>
                <p className="text-xs text-gray-400 mt-0.5">{item.desc}</p>
              </div>
            </Link>
          );
        })}
      </div>

      {/* ── Inline Task List ───────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/40">
          <h2 className="text-base font-bold text-gray-900">Lista de Tareas</h2>
          <Link
            href="/operaciones/tareas"
            className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 hover:underline"
          >
            Ver todas <ArrowRight size={13} />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b border-gray-100 bg-white">
                <th className="py-3 px-5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Tarea</th>
                <th className="py-3 px-5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Proceso</th>
                <th className="py-3 px-5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Programada</th>
                <th className="py-3 px-5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Límite</th>
                <th className="py-3 px-5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Prioridad</th>
                <th className="py-3 px-5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Estado</th>
                <th className="py-3 px-5 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {tasksLoading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-400">
                    <Activity size={28} className="mx-auto mb-3 animate-pulse text-gray-300" />
                    Cargando tareas...
                  </td>
                </tr>
              ) : tasks.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-400">
                    <CheckCircle2 size={28} className="mx-auto mb-3 text-gray-200" />
                    <p className="font-medium">No hay tareas registradas.</p>
                    <button
                      onClick={() => setIsModalOpen(true)}
                      className="mt-3 text-blue-600 hover:underline text-xs font-semibold"
                    >
                      + Crear primera tarea
                    </button>
                  </td>
                </tr>
              ) : (
                tasks.map(task => (
                  <tr key={task.id} className="hover:bg-blue-50/20 transition-colors group">
                    {/* Nombre — inline editable */}
                    <td className="py-3.5 px-5 max-w-[220px]">
                      <InlineNameEdit
                        taskId={task.id}
                        value={task.name}
                        onSave={(id, name) => updateTaskField(id, { name })}
                      />
                    </td>

                    {/* Proceso — inline select */}
                    <td className="py-3.5 px-5">
                      {task.process ? (
                        <div className="flex items-center gap-1.5">
                          <div className="w-2 h-2 rounded-sm flex-shrink-0" style={{ backgroundColor: task.process.color }} />
                          <span className="text-xs font-medium text-gray-600 bg-gray-100 px-2 py-0.5 rounded">
                            {task.process.code}
                          </span>
                        </div>
                      ) : (
                        <span className="text-gray-300 text-xs">—</span>
                      )}
                    </td>

                    {/* Fecha programada */}
                    <td className="py-3.5 px-5 text-xs text-gray-500">
                      {formatDateSafe(task.scheduledDate)}
                    </td>

                    {/* Fecha límite */}
                    <td className="py-3.5 px-5 text-xs text-gray-500">
                      {formatDateSafe(task.dueDate)}
                    </td>

                    {/* Prioridad — inline dropdown */}
                    <td className="py-3.5 px-5">
                      <InlineSelect
                        value={task.priority}
                        options={[
                          { value: 'HIGH', label: 'Alta', className: priorityColors.HIGH },
                          { value: 'MEDIUM', label: 'Media', className: priorityColors.MEDIUM },
                          { value: 'LOW', label: 'Baja', className: priorityColors.LOW },
                        ]}
                        onChange={val => updateTaskField(task.id, { priority: val })}
                        renderValue={val => (
                          <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold tracking-wide border ${priorityColors[val]}`}>
                            {priorityLabels[val]}
                          </span>
                        )}
                      />
                    </td>

                    {/* Estado — inline dropdown */}
                    <td className="py-3.5 px-5">
                      <InlineSelect
                        value={task.status}
                        options={[
                          { value: 'PENDING', label: 'Pendiente', className: statusColors.PENDING },
                          { value: 'IN_PROGRESS', label: 'En Progreso', className: statusColors.IN_PROGRESS },
                          { value: 'COMPLETED', label: 'Completada', className: statusColors.COMPLETED },
                          { value: 'CANCELLED', label: 'Cancelada', className: statusColors.CANCELLED },
                        ]}
                        onChange={val => updateTaskField(task.id, { status: val })}
                        renderValue={val => (
                          <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${statusColors[val]}`}>
                            {statusLabels[val]}
                          </span>
                        )}
                      />
                    </td>

                    {/* Acciones */}
                    <td className="py-3.5 px-5 text-right">
                      <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => openEditModal(task)}
                          className="text-blue-500 hover:text-blue-700 p-1.5 rounded-lg hover:bg-blue-50 transition-colors"
                          title="Editar tarea"
                        >
                          <Edit3 size={14} />
                        </button>
                        <button
                          onClick={() => openDeleteModal(task)}
                          className="text-red-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                          title="Eliminar tarea"
                        >
                          <Trash2 size={14} />
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

      {/* ── Delete Confirmation Modal ─────────────────────────────────────── */}
      {isDeleteModalOpen && taskToDelete && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                  <Trash2 size={22} className="text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Eliminar Tarea</h3>
                  <p className="text-sm text-gray-500">Esta acción no se puede deshacer.</p>
                </div>
              </div>
              <div className="bg-red-50 border border-red-100 rounded-xl p-4 mb-6">
                <p className="text-sm font-semibold text-gray-800">{taskToDelete.name}</p>
                {taskToDelete.process && (
                  <p className="text-xs text-gray-500 mt-1">Proceso: {taskToDelete.process.code} — {taskToDelete.process.name}</p>
                )}
              </div>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => { setIsDeleteModalOpen(false); setTaskToDelete(null); }}
                  disabled={deleting}
                  className="px-5 py-2.5 text-gray-600 font-medium hover:bg-gray-100 rounded-xl transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDeleteTask}
                  disabled={deleting}
                  className="bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white px-6 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-colors shadow-sm"
                >
                  {deleting ? 'Eliminando...' : (<><Trash2 size={16} /> Eliminar Tarea</>)}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Quick Create Task Modal ────────────────────────────────────────── */}
      <TaskModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingTask(null); }}
        onSaved={() => {
          fetchTasks();
          fetchIndicators();
        }}
        editingTask={editingTask}
        processes={processes}
      />
    </div>
  );
}
