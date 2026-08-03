'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Activity } from 'lucide-react';
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, format, subMonths, addMonths, isSameMonth, isSameDay } from 'date-fns';
import { es } from 'date-fns/locale';
import TaskModal from '@/components/operations/TaskModal';

interface OpTask {
  id: string;
  name: string;
  status: string;
  priority: string;
  scheduledDate: string | null;
  dueDate: string | null;
  process?: { id: string; name: string; color: string; code: string };
  description?: string | null;
  processId?: string;
  frequency?: string | null;
  observations?: string | null;
}

interface OpProcess {
  id: string;
  name: string;
  code: string;
}

export default function CalendarioPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [tasks, setTasks] = useState<OpTask[]>([]);
  const [processes, setProcesses] = useState<OpProcess[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<OpTask | null>(null);

  useEffect(() => {
    fetchTasks();
    fetchProcesses();
  }, [currentDate]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('access_token');
      // In a real app we would filter by date range, but here we fetch all or active tasks for simplicity
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/operations/tasks`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setTasks(data || []);
      }
    } catch (err) {
      console.error('Error fetching tasks:', err);
    } finally {
      setLoading(false);
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
    setIsModalOpen(true);
  };

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 }); // Start on Monday
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const dateFormat = 'd';
  const rows = [];
  let days = [];
  let day = startDate;
  let formattedDate = '';

  while (day <= endDate) {
    for (let i = 0; i < 7; i++) {
      formattedDate = format(day, dateFormat);
      const cloneDay = day;
      
      // Find tasks for this day
      const dayTasks = tasks.filter(t => t.scheduledDate && isSameDay(new Date(t.scheduledDate), cloneDay));

      days.push(
        <div 
          key={day.toString()} 
          className={`min-h-[120px] p-2 border-r border-b border-gray-100 flex flex-col transition-colors ${
            !isSameMonth(day, monthStart)
              ? 'bg-gray-50/50 text-gray-400'
              : 'bg-white text-gray-800 hover:bg-gray-50'
          }`}
        >
          <div className="flex justify-between items-center mb-1">
            <span className={`text-sm font-semibold w-7 h-7 flex items-center justify-center rounded-full ${
              isSameDay(day, new Date()) ? 'bg-blue-600 text-white' : ''
            }`}>
              {formattedDate}
            </span>
            {dayTasks.length > 0 && (
              <span className="text-[10px] font-bold text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
                {dayTasks.length}
              </span>
            )}
          </div>
          
          <div className="flex-1 overflow-y-auto space-y-1 mt-1 custom-scrollbar">
            {dayTasks.map(t => (
              <div 
                key={t.id} 
                onClick={() => openEditModal(t)}
                className="text-[10px] px-1.5 py-1 rounded border shadow-sm leading-tight truncate cursor-pointer hover:opacity-80 transition-opacity"
                style={{ 
                  backgroundColor: t.process?.color ? `${t.process.color}15` : '#f3f4f6',
                  borderColor: t.process?.color ? `${t.process.color}30` : '#e5e7eb',
                  color: t.process?.color || '#374151'
                }}
                title={t.name}
              >
                <span className="font-bold opacity-80 mr-1">{t.process?.code}</span>
                {t.name}
              </div>
            ))}
          </div>
        </div>
      );
      day = addDays(day, 1);
    }
    rows.push(
      <div className="grid grid-cols-7" key={day.toString()}>
        {days}
      </div>
    );
    days = [];
  }

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8 flex flex-col h-[calc(100vh-64px)]">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shrink-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Calendario Operativo</h1>
          <p className="text-gray-500 mt-2">Visualización mensual de actividades programadas.</p>
        </div>
        <div className="flex gap-3">
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-colors shadow-sm"
            onClick={openCreateModal}
          >
            Nueva Tarea
          </button>
          <Link href="/operaciones/tareas" className="bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 px-5 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-colors shadow-sm">
            Ver Lista
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col flex-1 overflow-hidden min-h-0">
        {/* Calendar Header */}
        <div className="flex justify-between items-center p-5 border-b border-gray-100 bg-gray-50/30 shrink-0">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2 capitalize">
            <CalendarIcon size={24} className="text-blue-600" />
            {format(currentDate, 'MMMM yyyy', { locale: es })}
          </h2>
          <div className="flex gap-2">
            <button 
              onClick={prevMonth}
              className="p-2 border border-gray-200 rounded-lg hover:bg-gray-100 bg-white transition-colors shadow-sm text-gray-600"
            >
              <ChevronLeft size={20} />
            </button>
            <button 
              onClick={() => setCurrentDate(new Date())}
              className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-100 bg-white transition-colors shadow-sm text-sm font-semibold text-gray-700"
            >
              Hoy
            </button>
            <button 
              onClick={nextMonth}
              className="p-2 border border-gray-200 rounded-lg hover:bg-gray-100 bg-white transition-colors shadow-sm text-gray-600"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        {/* Days of week header */}
        <div className="grid grid-cols-7 bg-gray-50 border-b border-gray-100 shrink-0">
          {['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'].map(d => (
            <div key={d} className="py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">
              {d}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="flex-1 overflow-y-auto flex flex-col custom-scrollbar bg-gray-50/20">
          {loading ? (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
              <Activity size={32} className="mb-3 animate-pulse" />
              Cargando calendario...
            </div>
          ) : (
            <div className="flex flex-col flex-1">
              {rows}
            </div>
          )}
        </div>
      </div>

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
