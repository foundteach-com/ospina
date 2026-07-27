'use client';

import { useState, useEffect } from 'react';
import { LayoutList, Search, Plus, Calendar as CalendarIcon, Clock, Activity, GripVertical } from 'lucide-react';
import Link from 'next/link';

interface OpTask {
  id: string;
  name: string;
  priority: string;
  status: string;
  dueDate: string | null;
  scheduledDate: string | null;
  process?: { name: string; color: string; code: string };
}

const statusColumns = [
  { id: 'PENDING', title: 'Pendiente', color: 'border-amber-200', bg: 'bg-amber-50/50', headerBg: 'bg-amber-100', dot: 'bg-amber-500' },
  { id: 'IN_PROGRESS', title: 'En Progreso', color: 'border-blue-200', bg: 'bg-blue-50/50', headerBg: 'bg-blue-100', dot: 'bg-blue-500' },
  { id: 'COMPLETED', title: 'Completada', color: 'border-emerald-200', bg: 'bg-emerald-50/50', headerBg: 'bg-emerald-100', dot: 'bg-emerald-500' },
  { id: 'CANCELLED', title: 'Cancelada', color: 'border-red-200', bg: 'bg-red-50/50', headerBg: 'bg-red-100', dot: 'bg-red-500' }
];

export default function KanbanPage() {
  const [tasks, setTasks] = useState<OpTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [draggedTask, setDraggedTask] = useState<string | null>(null);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const token = localStorage.getItem('access_token');
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

  const updateTaskStatus = async (taskId: string, newStatus: string) => {
    const originalTasks = [...tasks];
    
    // Optimistic UI update
    setTasks(tasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t));

    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/operations/tasks/${taskId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: newStatus, observations: 'Movido desde el Kanban visual' })
      });
      if (!res.ok) {
        // Revert on failure
        setTasks(originalTasks);
      }
    } catch (error) {
      console.error('Error updating task status:', error);
      setTasks(originalTasks);
    }
  };

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    setDraggedTask(taskId);
    e.dataTransfer.effectAllowed = 'move';
    // Small timeout to allow the dragged element to be rendered before hiding the original
    setTimeout(() => {
      const el = document.getElementById(`task-${taskId}`);
      if (el) el.classList.add('opacity-50');
    }, 0);
  };

  const handleDragEnd = (e: React.DragEvent, taskId: string) => {
    setDraggedTask(null);
    const el = document.getElementById(`task-${taskId}`);
    if (el) el.classList.remove('opacity-50');
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, columnId: string) => {
    e.preventDefault();
    if (draggedTask) {
      const task = tasks.find(t => t.id === draggedTask);
      if (task && task.status !== columnId) {
        updateTaskStatus(draggedTask, columnId);
      }
    }
  };

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto h-[calc(100vh-64px)] flex flex-col space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shrink-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tablero Kanban</h1>
          <p className="text-gray-500 mt-2">Gestiona el estado de las tareas arrastrando y soltando.</p>
        </div>
        <div className="flex gap-3">
          <Link href="/operaciones/tareas" className="bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 px-5 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-colors shadow-sm">
            Ver Lista
          </Link>
          <Link href="/operaciones/tareas" className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-colors shadow-sm">
            <Plus size={20} />
            Nueva Tarea
          </Link>
        </div>
      </div>

      <div className="flex gap-6 overflow-x-auto pb-4 flex-1 items-start min-h-0">
        {statusColumns.map(col => {
          const columnTasks = tasks.filter(t => t.status === col.id);
          
          return (
            <div 
              key={col.id} 
              className={`w-80 min-w-[320px] rounded-2xl border ${col.color} ${col.bg} flex flex-col max-h-full`}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, col.id)}
            >
              <div className={`px-4 py-3 border-b ${col.color} ${col.headerBg} rounded-t-2xl flex justify-between items-center shrink-0`}>
                <div className="flex items-center gap-2">
                  <div className={`w-2.5 h-2.5 rounded-full ${col.dot}`} />
                  <h3 className="font-bold text-gray-800">{col.title}</h3>
                </div>
                <span className="bg-white/60 text-gray-600 text-xs font-bold px-2.5 py-1 rounded-full shadow-sm backdrop-blur-sm">
                  {columnTasks.length}
                </span>
              </div>
              
              <div className="p-4 flex-1 overflow-y-auto space-y-3 custom-scrollbar">
                {loading && columnTasks.length === 0 && (
                  <div className="text-center py-10 text-gray-400 text-sm">Cargando...</div>
                )}
                {!loading && columnTasks.length === 0 && (
                  <div className="border-2 border-dashed border-gray-200/50 rounded-xl p-8 text-center text-gray-400 text-sm">
                    Suelta tareas aquí
                  </div>
                )}
                {columnTasks.map(task => (
                  <div 
                    key={task.id}
                    id={`task-${task.id}`}
                    draggable
                    onDragStart={(e) => handleDragStart(e, task.id)}
                    onDragEnd={(e) => handleDragEnd(e, task.id)}
                    className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 cursor-grab active:cursor-grabbing hover:shadow-md hover:border-blue-300 transition-all group"
                  >
                    <div className="flex justify-between items-start mb-2.5 gap-2">
                      <div className="flex-1">
                        {task.process && (
                          <span 
                            className="inline-block px-2 py-0.5 rounded text-[10px] font-bold text-white mb-1.5 shadow-sm uppercase tracking-wider"
                            style={{ backgroundColor: task.process.color }}
                          >
                            {task.process.code}
                          </span>
                        )}
                        <h4 className="font-bold text-gray-800 leading-snug group-hover:text-blue-600 transition-colors">
                          {task.name}
                        </h4>
                      </div>
                      <GripVertical size={16} className="text-gray-300 group-hover:text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    
                    <div className="flex items-center justify-between mt-4 text-xs font-medium">
                      <div className="flex items-center gap-1.5 text-gray-500">
                        <CalendarIcon size={14} />
                        {task.scheduledDate ? new Date(task.scheduledDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'Sin fecha'}
                      </div>
                      
                      <span className={`px-2 py-1 rounded uppercase tracking-wide text-[10px] border ${
                        task.priority === 'HIGH' ? 'text-red-700 bg-red-50 border-red-200' :
                        task.priority === 'MEDIUM' ? 'text-amber-700 bg-amber-50 border-amber-200' :
                        'text-emerald-700 bg-emerald-50 border-emerald-200'
                      }`}>
                        {task.priority === 'HIGH' ? 'Alta' : task.priority === 'MEDIUM' ? 'Media' : 'Baja'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
