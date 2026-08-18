'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  LayoutList,
  ChevronDown,
  Edit3,
  Save,
  X,
  Plus,
  Trash2,
  TrendingUp,
  Zap,
  Target,
  BarChart3,
  Search,
  CheckCheck,
  Timer,
  XCircle,
  ArrowUpRight,
  Layers,
  GitBranch,
  CalendarCheck,
  Moon,
  ChevronsUpDown,
  ArrowUp,
  ArrowDown,
  Eye,
} from 'lucide-react';
import TaskModal from '@/components/operations/TaskModal';

interface OpTask {
  id: string;
  name: string;
  status: string;
  priority: string;
  frequency?: string | null;
  scheduledDate: string | null;
  dueDate: string | null;
  daysOfWeek?: string | null;
  recurrenceInterval?: number | null;
  monthlyType?: string | null;
  monthDay?: number | null;
  weekOfMonth?: number | null;
  recurrenceEndType?: string | null;
  recurrenceEndDate?: string | null;
  recurrenceCount?: number | null;
  currentOccurrence?: number | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  processId?: string;
  process?: { id: string; name: string; color: string };
}

interface OpProcess {
  id: string;
  name: string;
  color?: string;
}

type SortKey = 'name' | 'priority' | 'status' | 'scheduledDate' | 'dueDate' | 'createdAt' | 'updatedAt' | 'process';
type SortDir = 'asc' | 'desc';

const STATUS_CONFIG: Record<string, { label: string; dot: string; pill: string }> = {
  PENDING:     { label: 'Pendiente',   dot: 'bg-amber-400',   pill: 'bg-amber-50 text-amber-700 border-amber-200/80 ring-1 ring-amber-100' },
  IN_PROGRESS: { label: 'En Progreso', dot: 'bg-blue-500',    pill: 'bg-blue-50 text-blue-700 border-blue-200/80 ring-1 ring-blue-100' },
  COMPLETED:   { label: 'Completada',  dot: 'bg-emerald-500', pill: 'bg-emerald-50 text-emerald-700 border-emerald-200/80 ring-1 ring-emerald-100' },
  CANCELLED:   { label: 'Cancelada',   dot: 'bg-red-400',     pill: 'bg-red-50 text-red-600 border-red-200/80 ring-1 ring-red-100' },
};

const PRIORITY_CONFIG: Record<string, { label: string; bar: string; badge: string; order: number }> = {
  HIGH:   { label: 'Alta',  bar: 'bg-red-500',   badge: 'bg-red-50 text-red-700 border-red-200',     order: 1 },
  MEDIUM: { label: 'Media', bar: 'bg-amber-400', badge: 'bg-amber-50 text-amber-700 border-amber-200', order: 2 },
  LOW:    { label: 'Baja',  bar: 'bg-slate-300', badge: 'bg-slate-50 text-slate-600 border-slate-200', order: 3 },
};

const STATUS_ORDER: Record<string, number> = { PENDING: 1, IN_PROGRESS: 2, COMPLETED: 3, CANCELLED: 4 };

function formatDateSafe(d: string | null | undefined): string {
  if (!d) return '—';
  const parts = d.split('T')[0].split('-');
  return parts.length === 3 ? `${parts[2]}/${parts[1]}` : d;
}

function getBogotaDateStr(): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Bogota',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(new Date());
}

function isOverdue(d: string | null | undefined, status: string): boolean {
  if (!d || status === 'COMPLETED' || status === 'CANCELLED') return false;
  return new Date(d.split('T')[0]) < new Date(getBogotaDateStr());
}

// ─── Determina si una tarea aplica para el día de HOY según su patrón de recurrencia ───
function isTaskForToday(t: OpTask, todayStr: string): boolean {
  if (t.status === 'COMPLETED' || t.status === 'CANCELLED') return false;

  // Convierte un ISO UTC a fecha local Colombia (YYYY-MM-DD)
  const toCol = (iso: string) =>
    new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Bogota' }).format(new Date(iso));

  // Verificar si la recurrencia ya terminó
  if (t.recurrenceEndType === 'ON_DATE' && t.recurrenceEndDate) {
    if (toCol(t.recurrenceEndDate) < todayStr) return false;
  }
  if (
    t.recurrenceEndType === 'AFTER_COUNT' &&
    t.recurrenceCount != null &&
    t.currentOccurrence != null &&
    t.currentOccurrence > t.recurrenceCount
  ) return false;

  const startDateStr = t.scheduledDate ? toCol(t.scheduledDate) : null;
  // Si la tarea aún no ha comenzado, no mostrar
  if (startDateStr && startDateStr > todayStr) return false;

  const freq = t.frequency;

  // Parsear fecha Colombia como fecha local (no UTC) para getDay() correcto
  const [y, m, d] = todayStr.split('-').map(Number);
  const todayLocal = new Date(y, m - 1, d);
  const DAY_NAMES = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  const todayDayName = DAY_NAMES[todayLocal.getDay()];

  // Sin frecuencia o frecuencia puntual (una sola vez)
  if (!freq || freq === 'CUSTOM') {
    if (t.scheduledDate) return startDateStr === todayStr;
    if (t.dueDate) return toCol(t.dueDate) <= todayStr;
    return false; // Sin fecha = no es tarea de hoy
  }

  // Diaria: aplica de lunes a viernes (excluye fines de semana)
  if (freq === 'DAILY') {
    const dayOfWeek = todayLocal.getDay();
    return dayOfWeek !== 0 && dayOfWeek !== 6; // 0 = Domingo, 6 = Sábado
  }

  // Semanal o quincenal: verificar si HOY es uno de los días configurados
  if (freq === 'WEEKLY' || freq === 'BIWEEKLY') {
    if (!t.daysOfWeek) return false;
    const activeDays = t.daysOfWeek.split(',').map(s => s.trim());
    return activeDays.includes(todayDayName);
  }

  // Mensual, trimestral, semestral
  if (freq === 'MONTHLY' || freq === 'QUARTERLY' || freq === 'BIANNUAL') {
    if (t.monthlyType === 'DAY_OF_WEEK' && t.daysOfWeek && t.weekOfMonth != null) {
      const activeDays = t.daysOfWeek.split(',').map(s => s.trim());
      if (!activeDays.includes(todayDayName)) return false;
      // Contar cuántas veces ha caído este día de semana en el mes hasta hoy
      let count = 0;
      for (let day = 1; day <= d; day++) {
        if (new Date(y, m - 1, day).getDay() === todayLocal.getDay()) count++;
      }
      if (t.weekOfMonth === -1) {
        // Último: verificar si la próxima ocurrencia es el mes siguiente
        return new Date(y, m - 1, d + 7).getMonth() !== todayLocal.getMonth();
      }
      return count === t.weekOfMonth;
    }
    // DAY_OF_MONTH: verificar el día del mes
    const targetDay = t.monthDay ?? (startDateStr ? Number(startDateStr.split('-')[2]) : null);
    return targetDay != null && d === targetDay;
  }

  // Anual
  if (freq === 'ANNUAL') {
    if (!startDateStr) return false;
    const [, sm, sd] = startDateStr.split('-').map(Number);
    return m === sm && d === sd;
  }

  return false;
}

function compareDates(a: string | null | undefined, b: string | null | undefined): number {
  if (!a && !b) return 0;
  if (!a) return 1;
  if (!b) return -1;
  return new Date(a).getTime() - new Date(b).getTime();
}

// ─── Inline Dropdown ─────────────────────────────────────────────────────────
function InlineSelect({ value, options, onChange, renderValue }: {
  value: string;
  options: { value: string; label: string; dotClass?: string }[];
  onChange: (v: string) => void;
  renderValue: (v: string) => React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);
  return (
    <div ref={ref} className="relative inline-flex">
      <button onClick={() => setOpen(o => !o)} className="flex items-center gap-1 group">
        {renderValue(value)}
        <ChevronDown size={11} className={`text-slate-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute z-50 top-full mt-1.5 left-0 bg-white border border-slate-200 rounded-2xl shadow-xl shadow-slate-200/60 py-1.5 min-w-[160px] animate-in fade-in slide-in-from-top-2 duration-150">
          {options.map(opt => {
            const active = opt.value === value;
            return (
              <button key={opt.value} onClick={() => { onChange(opt.value); setOpen(false); }}
                className={`w-full text-left px-3 py-2 flex items-center gap-2.5 text-xs font-semibold transition-colors ${active ? 'bg-slate-100 text-slate-400 cursor-default' : 'hover:bg-slate-50 text-slate-700'}`}>
                {opt.dotClass && <span className={`w-2 h-2 rounded-full flex-shrink-0 ${opt.dotClass}`} />}
                {opt.label}
                {active && <CheckCircle2 size={12} className="ml-auto text-slate-400" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Inline Name Edit ─────────────────────────────────────────────────────────
function InlineNameEdit({ taskId, value, onSave }: { taskId: string; value: string; onSave: (id: string, name: string) => void }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => { if (editing) ref.current?.focus(); }, [editing]);
  const commit = () => { if (draft.trim() && draft !== value) onSave(taskId, draft.trim()); setEditing(false); };
  if (!editing) return (
    <button onClick={() => { setDraft(value); setEditing(true); }} className="font-medium text-slate-800 hover:text-blue-600 text-left leading-snug transition-colors group/name flex items-center gap-1.5 w-full">
      <span className="truncate">{value}</span>
      <Edit3 size={11} className="opacity-0 group-hover/name:opacity-50 transition-opacity flex-shrink-0 text-slate-400" />
    </button>
  );
  return (
    <div className="flex items-center gap-1 w-full">
      <input ref={ref} value={draft} onChange={e => setDraft(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') setEditing(false); }}
        className="text-sm font-medium text-slate-800 border-b-2 border-blue-500 outline-none bg-transparent flex-1 min-w-0" />
      <button onClick={commit} className="p-1 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"><Save size={12} /></button>
      <button onClick={() => setEditing(false)} className="p-1 text-slate-400 hover:bg-slate-100 rounded-lg transition-colors"><X size={12} /></button>
    </div>
  );
}

// ─── Sortable Column Header ───────────────────────────────────────────────────
function SortHeader({ label, sortKey, current, dir, onSort }: {
  label: string; sortKey: SortKey; current: SortKey; dir: SortDir; onSort: (k: SortKey) => void;
}) {
  const active = current === sortKey;
  return (
    <button onClick={() => onSort(sortKey)}
      className={`flex items-center gap-1.5 group transition-colors select-none ${active ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}>
      <span className="text-[11px] font-bold uppercase tracking-widest">{label}</span>
      <span className="flex-shrink-0">
        {active
          ? (dir === 'asc' ? <ArrowUp size={11} className="text-blue-500" /> : <ArrowDown size={11} className="text-blue-500" />)
          : <ChevronsUpDown size={11} className="opacity-0 group-hover:opacity-60 transition-opacity" />}
      </span>
    </button>
  );
}

// ─── Skeleton Row ─────────────────────────────────────────────────────────────
function SkeletonRow() {
  return (
    <tr className="border-b border-slate-100/80">
      {[90, 220, 80, 90, 70, 70, 60].map((w, i) => (
        <td key={i} className="py-4 px-4">
          <div className="h-3.5 bg-slate-100 rounded-full animate-pulse" style={{ width: w }} />
        </td>
      ))}
    </tr>
  );
}

export default function OperationsDashboard() {
  const [loading, setLoading] = useState(true);
  const [tasksLoading, setTasksLoading] = useState(true);
  const [tasks, setTasks] = useState<OpTask[]>([]);
  const [processes, setProcesses] = useState<OpProcess[]>([]);
  const [indicators, setIndicators] = useState({ totalTasks: 0, pendingTasks: 0, completedToday: 0, activeProcesses: 0, overdueTasks: 0 });

  // Filters
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterPriority, setFilterPriority] = useState('ALL');
  const [filterProcess, setFilterProcess] = useState('ALL');
  const [filterDate, setFilterDate] = useState<'TODAY' | 'ALL'>('TODAY');

  // Sort — default: updatedAt desc (más reciente primero)
  const [sortKey, setSortKey] = useState<SortKey>('updatedAt');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<OpTask | null>(null);
  const [taskToDelete, setTaskToDelete] = useState<OpTask | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = () => { fetchIndicators(); fetchTasks(); fetchProcesses(); };

  const fetchIndicators = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/operations/dashboard/indicators`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) setIndicators(await res.json());
    } finally { setLoading(false); }
  };

  const fetchTasks = async () => {
    setTasksLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/operations/tasks`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) { const d = await res.json(); setTasks(Array.isArray(d) ? d : []); }
    } finally { setTasksLoading(false); }
  };

  const fetchProcesses = async () => {
    const token = localStorage.getItem('access_token');
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/operations/processes?status=ACTIVE`, { headers: { Authorization: `Bearer ${token}` } });
    if (res.ok) { const d = await res.json(); setProcesses(d.processes || []); }
  };

  const updateTaskField = async (id: string, patch: Record<string, any>) => {
    const token = localStorage.getItem('access_token');
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/operations/tasks/${id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(patch),
    });
    if (res.ok) { setTasks(prev => prev.map(t => t.id === id ? { ...t, ...patch } : t)); if ('status' in patch) fetchIndicators(); }
  };

  const handleDelete = async () => {
    if (!taskToDelete) return;
    setDeleting(true);
    const token = localStorage.getItem('access_token');
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/operations/tasks/${taskToDelete.id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
    if (res.ok) { setTasks(prev => prev.filter(t => t.id !== taskToDelete.id)); fetchIndicators(); setTaskToDelete(null); }
    setDeleting(false);
  };

  const handleSort = useCallback((key: SortKey) => {
    setSortDir(prev => sortKey === key ? (prev === 'asc' ? 'desc' : 'asc') : 'desc');
    setSortKey(key);
  }, [sortKey]);

  // ── Filter + Sort ──────────────────────────────────────────────────────────
  // Get today's date in YYYY-MM-DD format (Colombia Time)
  const todayStr = getBogotaDateStr();

  const displayed = tasks
    .filter(t => {
      const q = search.toLowerCase();
      const matchSearch = !q || t.name.toLowerCase().includes(q) || t.process?.name?.toLowerCase().includes(q);
      const matchStatus = filterStatus === 'ALL' || t.status === filterStatus;
      const matchPriority = filterPriority === 'ALL' || t.priority === filterPriority;
      const matchProcess = filterProcess === 'ALL' || t.processId === filterProcess;
      // "Hoy": evaluar el patrón de recurrencia de cada tarea
      const matchDate = filterDate === 'ALL' || isTaskForToday(t, todayStr);
      return matchSearch && matchStatus && matchPriority && matchProcess && matchDate;
    })
    .sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case 'name':          cmp = a.name.localeCompare(b.name, 'es'); break;
        case 'priority':      cmp = (PRIORITY_CONFIG[a.priority]?.order ?? 99) - (PRIORITY_CONFIG[b.priority]?.order ?? 99); break;
        case 'status':        cmp = (STATUS_ORDER[a.status] ?? 99) - (STATUS_ORDER[b.status] ?? 99); break;
        case 'scheduledDate': cmp = compareDates(a.scheduledDate, b.scheduledDate); break;
        case 'dueDate':       cmp = compareDates(a.dueDate, b.dueDate); break;
        case 'process':       cmp = (a.process?.name || '').localeCompare(b.process?.name || '', 'es'); break;
        case 'updatedAt':     cmp = compareDates(a.updatedAt, b.updatedAt); break;
        case 'createdAt':     cmp = compareDates(a.createdAt, b.createdAt); break;
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });

  const completionRate = indicators.totalTasks > 0
    ? Math.round(((indicators.totalTasks - indicators.pendingTasks) / indicators.totalTasks) * 100) : 0;

  const views = [
    { name: 'Procesos',   href: '/operaciones/procesos',          icon: GitBranch,    bg: 'bg-violet-50', ring: 'ring-violet-200' },
    { name: 'Kanban',     href: '/operaciones/kanban',            icon: Layers,       bg: 'bg-blue-50',   ring: 'ring-blue-200' },
    { name: 'Cronograma', href: '/operaciones/tareas/cronograma', icon: BarChart3,    bg: 'bg-teal-50',   ring: 'ring-teal-200' },
    { name: 'Calendario', href: '/operaciones/tareas/calendario', icon: CalendarCheck, bg: 'bg-orange-50', ring: 'ring-orange-200' },
  ];

  const activeFiltersCount = [filterStatus !== 'ALL', filterPriority !== 'ALL', filterProcess !== 'ALL', search !== '', filterDate !== 'ALL'].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-7">

        {/* ── HEADER ──────────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-lg shadow-blue-200">
                <Zap size={18} className="text-white" />
              </div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Operaciones</h1>
            </div>
            <p className="text-slate-500 text-sm ml-12">Centro de control y seguimiento de actividades operativas</p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/operaciones/tareas" className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-white hover:shadow-sm text-sm font-medium transition-all flex items-center gap-2">
              <LayoutList size={16} />Ver todas
            </Link>
            <button onClick={() => { setEditingTask(null); setIsModalOpen(true); }}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-4 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-all shadow-md shadow-blue-200 hover:shadow-lg hover:shadow-blue-300 text-sm">
              <Plus size={16} />Nueva Tarea
            </button>
          </div>
        </div>

        {/* ── KPI CARDS ───────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="col-span-2 lg:col-span-1 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-700 rounded-2xl p-5 text-white shadow-lg shadow-blue-200 relative overflow-hidden">
            <div className="absolute -top-4 -right-4 w-24 h-24 rounded-full bg-white/10 blur-xl" />
            <p className="text-blue-200 text-xs font-semibold uppercase tracking-wider mb-1">Progreso General</p>
            <div className="flex items-end gap-2 mt-1">
              <p className="text-4xl font-black">{loading ? '…' : `${completionRate}%`}</p>
              <TrendingUp size={18} className="text-blue-300 mb-1" />
            </div>
            <div className="mt-3 h-1.5 bg-white/20 rounded-full">
              <div className="h-full bg-white rounded-full transition-all duration-700" style={{ width: `${completionRate}%` }} />
            </div>
            <p className="text-blue-200 text-xs mt-2 font-medium">{indicators.totalTasks} tareas totales</p>
          </div>
          {[
            { title: 'Pendientes', value: indicators.pendingTasks,   icon: Clock,        color: 'text-amber-600',   bg: 'bg-amber-50',   border: 'border-amber-100' },
            { title: 'Vencidas',   value: indicators.overdueTasks,   icon: AlertCircle,  color: 'text-red-600',     bg: 'bg-red-50',     border: 'border-red-100' },
            { title: 'Hechas Hoy', value: indicators.completedToday, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' },
          ].map((s, i) => {
            const Icon = s.icon;
            return (
              <div key={i} className={`bg-white rounded-2xl p-5 border ${s.border} shadow-sm hover:shadow-md transition-shadow`}>
                <div className="flex justify-between items-start mb-3">
                  <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">{s.title}</p>
                  <div className={`p-2 rounded-xl ${s.bg}`}><Icon size={16} className={s.color} /></div>
                </div>
                <p className="text-3xl font-black text-slate-900">{loading ? <span className="animate-pulse text-slate-300">—</span> : s.value}</p>
              </div>
            );
          })}
        </div>

        {/* ── QUICK VIEWS ─────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {views.map((v, i) => {
            const Icon = v.icon;
            return (
              <Link key={i} href={v.href} className="group relative bg-white border border-slate-100 rounded-2xl p-4 flex items-center gap-3 hover:border-transparent hover:shadow-lg hover:shadow-slate-200/60 transition-all duration-300 overflow-hidden">
                <div className={`p-2.5 rounded-xl ${v.bg} ${v.ring} ring-1 group-hover:ring-2 transition-all flex-shrink-0`}>
                  <Icon size={17} className="text-slate-700 group-hover:scale-110 transition-transform duration-200" />
                </div>
                <h3 className="font-semibold text-sm text-slate-800 group-hover:text-slate-900 min-w-0">{v.name}</h3>
                <ArrowUpRight size={14} className="ml-auto text-slate-300 group-hover:text-slate-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
              </Link>
            );
          })}
        </div>

        {/* ── TASK LIST ───────────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">

          {/* Toolbar */}
          <div className="flex flex-col gap-3 px-5 py-4 border-b border-slate-100 bg-slate-50/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Target size={16} className="text-slate-400" />
                <h2 className="text-sm font-bold text-slate-800">Lista de Tareas</h2>
                {!tasksLoading && (
                  <span className="px-2 py-0.5 bg-slate-100 rounded-full text-xs font-semibold text-slate-500">
                    {displayed.length}
                    {displayed.length !== tasks.length && <span className="text-slate-400"> / {tasks.length}</span>}
                  </span>
                )}
                {activeFiltersCount > 0 && (
                  <span className="px-2 py-0.5 bg-blue-100 rounded-full text-xs font-bold text-blue-700 flex items-center gap-1">
                    {activeFiltersCount} filtro{activeFiltersCount > 1 ? 's' : ''}
                    <button onClick={() => { setSearch(''); setFilterStatus('ALL'); setFilterPriority('ALL'); setFilterProcess('ALL'); setFilterDate('ALL'); }}
                      className="ml-0.5 hover:text-blue-900 transition-colors"><X size={11} /></button>
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                  <button onClick={() => setFilterDate('TODAY')} className={`px-3 py-1.5 text-[11px] font-bold rounded-md transition-colors ${filterDate === 'TODAY' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Hoy</button>
                  <button onClick={() => setFilterDate('ALL')} className={`px-3 py-1.5 text-[11px] font-bold rounded-md transition-colors ${filterDate === 'ALL' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Todas</button>
                </div>
                <Link href="/operaciones/tareas" className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 transition-colors">
                  Ver lista <ArrowUpRight size={13} />
                </Link>
              </div>
            </div>

            {/* Filter row */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Search */}
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type="text" placeholder="Buscar tarea o proceso..." value={search} onChange={e => setSearch(e.target.value)}
                  className="pl-8 pr-3 py-2 text-xs bg-white border border-slate-200 rounded-xl w-52 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 outline-none transition-all placeholder:text-slate-400" />
              </div>

              {/* Process filter */}
              <div className="relative">
                <select value={filterProcess} onChange={e => setFilterProcess(e.target.value)}
                  className={`appearance-none pl-3 pr-7 py-2 text-xs border rounded-xl outline-none transition-all font-medium cursor-pointer ${filterProcess !== 'ALL' ? 'bg-violet-50 border-violet-300 text-violet-700 ring-2 ring-violet-100' : 'bg-white border-slate-200 text-slate-600'}`}>
                  <option value="ALL">Todos los procesos</option>
                  {processes.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
                <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>

              {/* Status filter */}
              <div className="relative">
                <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
                  className={`appearance-none pl-3 pr-7 py-2 text-xs border rounded-xl outline-none transition-all font-medium cursor-pointer ${filterStatus !== 'ALL' ? 'bg-blue-50 border-blue-300 text-blue-700 ring-2 ring-blue-100' : 'bg-white border-slate-200 text-slate-600'}`}>
                  <option value="ALL">Todos los estados</option>
                  <option value="PENDING">Pendiente</option>
                  <option value="IN_PROGRESS">En Progreso</option>
                  <option value="COMPLETED">Completada</option>
                  <option value="CANCELLED">Cancelada</option>
                </select>
                <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>

              {/* Priority filter */}
              <div className="relative">
                <select value={filterPriority} onChange={e => setFilterPriority(e.target.value)}
                  className={`appearance-none pl-3 pr-7 py-2 text-xs border rounded-xl outline-none transition-all font-medium cursor-pointer ${filterPriority !== 'ALL' ? 'bg-amber-50 border-amber-300 text-amber-700 ring-2 ring-amber-100' : 'bg-white border-slate-200 text-slate-600'}`}>
                  <option value="ALL">Todas las prioridades</option>
                  <option value="HIGH">Alta</option>
                  <option value="MEDIUM">Media</option>
                  <option value="LOW">Baja</option>
                </select>
                <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/30">
                  {/* Proceso */}
                  <th className="py-3 px-4 text-left w-28">
                    <SortHeader label="Proceso" sortKey="process" current={sortKey} dir={sortDir} onSort={handleSort} />
                  </th>
                  {/* Tarea */}
                  <th className="py-3 px-4 text-left">
                    <SortHeader label="Tarea" sortKey="name" current={sortKey} dir={sortDir} onSort={handleSort} />
                  </th>
                  {/* Prioridad */}
                  <th className="py-3 px-4 text-left w-28">
                    <SortHeader label="Prioridad" sortKey="priority" current={sortKey} dir={sortDir} onSort={handleSort} />
                  </th>
                  {/* Estado */}
                  <th className="py-3 px-4 text-left w-36">
                    <SortHeader label="Estado" sortKey="status" current={sortKey} dir={sortDir} onSort={handleSort} />
                  </th>
                  {/* Programada */}
                  <th className="py-3 px-4 text-left w-28">
                    <SortHeader label="Programada" sortKey="scheduledDate" current={sortKey} dir={sortDir} onSort={handleSort} />
                  </th>
                  {/* Límite */}
                  <th className="py-3 px-4 text-left w-28">
                    <SortHeader label="Límite" sortKey="dueDate" current={sortKey} dir={sortDir} onSort={handleSort} />
                  </th>
                  {/* Acciones — no sortable */}
                  <th className="py-3 px-4 text-right w-20">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Acciones</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {tasksLoading
                  ? Array.from({ length: 8 }).map((_, i) => <SkeletonRow key={i} />)
                  : displayed.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-16 text-center">
                        <div className="flex flex-col items-center gap-3">
                          <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center">
                            <Moon size={24} className="text-slate-300" />
                          </div>
                          <p className="font-semibold text-slate-600">{search || activeFiltersCount > 0 ? 'Sin resultados' : 'Sin tareas aún'}</p>
                          <p className="text-slate-400 text-xs">{search ? 'Prueba con otro término' : activeFiltersCount > 0 ? 'Intenta quitar algún filtro' : 'Crea tu primera tarea operativa'}</p>
                          {activeFiltersCount > 0 && (
                            <button onClick={() => { setSearch(''); setFilterStatus('ALL'); setFilterPriority('ALL'); setFilterProcess('ALL'); setFilterDate('ALL'); }}
                              className="text-xs font-semibold text-blue-600 hover:underline">Limpiar filtros</button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ) : displayed.map(task => {
                    const statusCfg = STATUS_CONFIG[task.status] || STATUS_CONFIG.PENDING;
                    const priorityCfg = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.MEDIUM;
                    const overdueFlag = isOverdue(task.dueDate, task.status);
                    const isCompleted = task.status === 'COMPLETED';

                    return (
                      <tr key={task.id} className={`group border-b border-slate-50 hover:bg-slate-50/70 transition-colors ${isCompleted ? 'opacity-55' : ''}`}>

                        {/* Proceso */}
                        <td className="py-3.5 px-4">
                          {task.process ? (
                            <div className="flex items-center gap-1.5">
                              <div className="w-2 h-2 rounded-sm flex-shrink-0" style={{ backgroundColor: task.process.color }} />
                              <span className="text-[11px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-lg tracking-wide whitespace-nowrap">
                                {task.process.name}
                              </span>
                            </div>
                          ) : <span className="text-slate-300 text-xs">—</span>}
                        </td>

                        {/* Tarea */}
                        <td className="py-3.5 px-4 max-w-xs">
                          <div className="flex items-center gap-2.5 group/task">
                            <span className={`w-2 h-2 rounded-full flex-shrink-0 ${statusCfg.dot}`} />
                            <InlineNameEdit taskId={task.id} value={task.name} onSave={(id, name) => updateTaskField(id, { name })} />
                            <button
                              onClick={() => { setEditingTask(task); setIsModalOpen(true); }}
                              className="text-slate-400 hover:text-blue-600 opacity-0 group-hover/task:opacity-100 transition-opacity p-1 hover:bg-blue-50 rounded-lg flex-shrink-0"
                              title="Ver detalles"
                            >
                              <Eye size={14} />
                            </button>
                          </div>
                        </td>

                        {/* Prioridad */}
                        <td className="py-3.5 px-4">
                          <InlineSelect
                            value={task.priority}
                            options={[
                              { value: 'HIGH',   label: 'Alta',  dotClass: 'bg-red-500' },
                              { value: 'MEDIUM', label: 'Media', dotClass: 'bg-amber-400' },
                              { value: 'LOW',    label: 'Baja',  dotClass: 'bg-slate-300' },
                            ]}
                            onChange={v => updateTaskField(task.id, { priority: v })}
                            renderValue={v => (
                              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold border ${PRIORITY_CONFIG[v]?.badge || ''}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${PRIORITY_CONFIG[v]?.bar || 'bg-slate-300'}`} />
                                {PRIORITY_CONFIG[v]?.label || v}
                              </span>
                            )}
                          />
                        </td>

                        {/* Estado */}
                        <td className="py-3.5 px-4">
                          <InlineSelect
                            value={task.status}
                            options={Object.entries(STATUS_CONFIG).map(([val, cfg]) => ({ value: val, label: cfg.label, dotClass: cfg.dot }))}
                            onChange={v => updateTaskField(task.id, { status: v })}
                            renderValue={v => {
                              const cfg = STATUS_CONFIG[v] || STATUS_CONFIG.PENDING;
                              return (
                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${cfg.pill}`}>
                                  <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                                  {cfg.label}
                                </span>
                              );
                            }}
                          />
                        </td>

                        {/* Programada */}
                        <td className="py-3.5 px-4">
                          <span className="text-xs text-slate-500 tabular-nums font-medium">{formatDateSafe(task.scheduledDate)}</span>
                        </td>

                        {/* Límite */}
                        <td className="py-3.5 px-4">
                          <span className={`text-xs tabular-nums font-medium ${overdueFlag ? 'text-red-600 bg-red-50 px-2 py-0.5 rounded-lg' : 'text-slate-500'}`}>
                            {formatDateSafe(task.dueDate)}{overdueFlag ? ' ⚠' : ''}
                          </span>
                        </td>

                        {/* Acciones — siempre visibles */}
                        <td className="py-3.5 px-4">
                          <div className="flex justify-end gap-1">
                            <button onClick={() => { setEditingTask(task); setIsModalOpen(true); }}
                              className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Editar">
                              <Edit3 size={14} />
                            </button>
                            <button onClick={() => setTaskToDelete(task)}
                              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Eliminar">
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          {!tasksLoading && displayed.length > 0 && (
            <div className="px-5 py-3 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
              <p className="text-xs text-slate-400">
                Mostrando <span className="font-semibold text-slate-600">{displayed.length}</span> de{' '}
                <span className="font-semibold text-slate-600">{tasks.length}</span> tareas ·{' '}
                <span className="text-slate-400">Ordenado por <span className="font-medium text-slate-500">{sortKey === 'updatedAt' ? 'más reciente' : sortKey}</span> {sortDir === 'desc' ? '↓' : '↑'}</span>
              </p>
              <Link href="/operaciones/tareas" className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 transition-colors">
                Ver lista completa <ArrowUpRight size={12} />
              </Link>
            </div>
          )}
        </div>

      </div>

      {/* ── Delete Modal ──────────────────────────────────────────────────── */}
      {taskToDelete && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6">
              <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center mb-4">
                <Trash2 size={22} className="text-red-500" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-1">Eliminar tarea</h3>
              <p className="text-sm text-slate-500 mb-4">Esta acción no se puede deshacer.</p>
              <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 mb-5">
                <p className="text-sm font-semibold text-slate-800 truncate">{taskToDelete.name}</p>
                {taskToDelete.process && <p className="text-xs text-slate-400 mt-0.5">{taskToDelete.process.name}</p>}
              </div>
              <div className="flex gap-2">
                <button onClick={() => setTaskToDelete(null)} disabled={deleting}
                  className="flex-1 py-2.5 text-sm text-slate-600 font-medium hover:bg-slate-100 rounded-xl transition-colors">Cancelar</button>
                <button onClick={handleDelete} disabled={deleting}
                  className="flex-1 py-2.5 text-sm text-white font-semibold bg-red-600 hover:bg-red-700 disabled:opacity-60 rounded-xl transition-colors flex items-center justify-center gap-2">
                  {deleting ? 'Eliminando...' : <><Trash2 size={15} /> Eliminar</>}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Task Modal ────────────────────────────────────────────────────── */}
      <TaskModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingTask(null); }}
        onSaved={() => { fetchTasks(); fetchIndicators(); }}
        editingTask={editingTask}
        processes={processes}
      />
    </div>
  );
}
