'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Activity, Clock, CheckCircle2 } from 'lucide-react';
import { startOfWeek, addDays, format, isSameDay } from 'date-fns';
import { es } from 'date-fns/locale';

interface OpTask {
  id: string;
  name: string;
  status: string;
  priority: string;
  scheduledDate: string | null;
  process?: { color: string; name: string };
}

export default function CronogramaPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [tasks, setTasks] = useState<OpTask[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTasks();
  }, [currentDate]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
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

  const nextWeek = () => setCurrentDate(addDays(currentDate, 7));
  const prevWeek = () => setCurrentDate(addDays(currentDate, -7));

  // Lunes de la semana actual
  const monday = startOfWeek(currentDate, { weekStartsOn: 1 });
  
  // Días de Lunes (0) a Viernes (4)
  const weekDays = Array.from({ length: 5 }).map((_, i) => addDays(monday, i));

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8 h-[calc(100vh-64px)] flex flex-col">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shrink-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Cronograma Operativo</h1>
          <p className="text-gray-500 mt-2">Organización semanal de la operación (Lunes a Viernes).</p>
        </div>
        <Link href="/operaciones/tareas" className="bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 px-5 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-colors shadow-sm">
          Volver a Tareas
        </Link>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col flex-1 overflow-hidden min-h-0">
        
        {/* Header Controls */}
        <div className="flex justify-between items-center p-5 border-b border-gray-100 bg-gray-50/30 shrink-0">
          <div className="flex items-center gap-4">
            <div className="flex gap-1">
              <button onClick={prevWeek} className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors shadow-sm text-gray-600">
                <ChevronLeft size={18} />
              </button>
              <button onClick={nextWeek} className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors shadow-sm text-gray-600">
                <ChevronRight size={18} />
              </button>
            </div>
            <h2 className="text-lg font-bold text-gray-800 capitalize">
              Semana del {format(monday, "d 'de' MMMM, yyyy", { locale: es })}
            </h2>
          </div>
          <button 
            onClick={() => setCurrentDate(new Date())}
            className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 bg-white transition-colors shadow-sm text-sm font-semibold text-gray-700"
          >
            Esta Semana
          </button>
        </div>

        {/* Columns Grid */}
        <div className="flex-1 overflow-x-auto custom-scrollbar bg-gray-50/20 p-6">
          {loading ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400">
              <Activity size={32} className="mb-3 animate-pulse" />
              Cargando cronograma...
            </div>
          ) : (
            <div className="flex gap-4 min-w-[1000px] h-full">
              {weekDays.map((day) => {
                const dayTasks = tasks.filter(t => t.scheduledDate && isSameDay(new Date(t.scheduledDate), day));
                const isToday = isSameDay(day, new Date());
                
                return (
                  <div key={day.toISOString()} className={`flex-1 flex flex-col bg-white rounded-2xl border ${isToday ? 'border-blue-200 ring-4 ring-blue-50' : 'border-gray-100'} shadow-sm overflow-hidden`}>
                    
                    <div className={`p-4 border-b text-center shrink-0 ${isToday ? 'bg-blue-50' : 'bg-gray-50/50'}`}>
                      <h3 className={`font-bold text-lg capitalize ${isToday ? 'text-blue-700' : 'text-gray-800'}`}>
                        {format(day, 'EEEE', { locale: es })}
                      </h3>
                      <p className={`text-sm mt-0.5 ${isToday ? 'text-blue-500 font-semibold' : 'text-gray-500'}`}>
                        {format(day, 'd MMM', { locale: es })}
                      </p>
                    </div>
                    
                    <div className="flex-1 p-3 overflow-y-auto custom-scrollbar space-y-3">
                      {dayTasks.length === 0 ? (
                        <div className="h-full flex items-center justify-center text-gray-400 text-sm border-2 border-dashed border-gray-100 rounded-xl p-4 text-center">
                          Sin actividades
                        </div>
                      ) : (
                        dayTasks.map(task => (
                          <div 
                            key={task.id} 
                            className="bg-white border border-gray-100 p-3 rounded-xl shadow-sm hover:border-blue-300 hover:shadow-md transition-all group relative overflow-hidden"
                          >
                            <div className="absolute left-0 top-0 bottom-0 w-1" style={{ backgroundColor: task.process?.color || '#cbd5e1' }} />
                            
                            <div className="pl-3">
                              <div className="flex justify-between items-start mb-1 gap-2">
                                <span className="text-[10px] font-bold text-gray-500 uppercase bg-gray-100 px-1.5 py-0.5 rounded tracking-wide">
                                  {task.process?.name || ''}
                                </span>
                                {task.status === 'COMPLETED' ? (
                                  <CheckCircle2 size={14} className="text-emerald-500" />
                                ) : task.status === 'IN_PROGRESS' ? (
                                  <Activity size={14} className="text-blue-500" />
                                ) : (
                                  <Clock size={14} className="text-amber-500" />
                                )}
                              </div>
                              <h4 className="font-semibold text-gray-800 text-sm leading-tight mb-2 group-hover:text-blue-600 transition-colors">
                                {task.name}
                              </h4>
                              
                              <div className="flex justify-between items-center mt-2">
                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${
                                  task.priority === 'HIGH' ? 'text-red-700 border-red-200 bg-red-50' : 
                                  task.priority === 'MEDIUM' ? 'text-amber-700 border-amber-200 bg-amber-50' : 
                                  'text-emerald-700 border-emerald-200 bg-emerald-50'
                                }`}>
                                  {task.priority === 'HIGH' ? 'ALTA' : task.priority === 'MEDIUM' ? 'MEDIA' : 'BAJA'}
                                </span>
                                
                                <span className="text-[10px] text-gray-400 font-medium bg-gray-50 px-1.5 py-0.5 rounded">
                                  {task.status === 'PENDING' ? 'Pdte' : 
                                   task.status === 'IN_PROGRESS' ? 'Prog' : 
                                   task.status === 'COMPLETED' ? 'Fin' : 'Canc'}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
