'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Activity, 
  CalendarDays, 
  LayoutList,
  TrendingUp,
  ArrowRight
} from 'lucide-react';

interface OpTask {
  id: string;
  name: string;
  status: string;
  priority: string;
  scheduledDate: string | null;
  process?: { name: string; code: string; color: string };
}

export default function OperationsDashboard() {
  const [loading, setLoading] = useState(true);
  const [upcomingTasks, setUpcomingTasks] = useState<OpTask[]>([]);
  const [indicators, setIndicators] = useState({
    totalTasks: 0,
    pendingTasks: 0,
    completedTasks: 0,
    completedToday: 0,
    activeProcesses: 0,
    overdueTasks: 0,
  });

  useEffect(() => {
    fetchIndicators();
    fetchUpcomingTasks();
  }, []);

  const fetchIndicators = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/operations/dashboard/indicators`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setIndicators(data);
      }
    } catch (err) {
      console.error('Error fetching indicators:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUpcomingTasks = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/operations/tasks?status=PENDING`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setUpcomingTasks((data || []).slice(0, 5));
      }
    } catch (err) {
      console.error('Error fetching upcoming tasks:', err);
    }
  };

  const menuItems = [
    { name: 'Procesos', href: '/operaciones/procesos', icon: Activity, desc: 'Catálogo de procesos' },
    { name: 'Lista de Tareas', href: '/operaciones/tareas', icon: LayoutList, desc: 'Gestión y seguimiento' },
    { name: 'Kanban', href: '/operaciones/kanban', icon: LayoutList, desc: 'Tablero visual' },
    { name: 'Cronograma', href: '/operaciones/cronograma', icon: CalendarDays, desc: 'Vista semanal' },
    { name: 'Calendario', href: '/operaciones/calendario', icon: CalendarDays, desc: 'Vista mensual' },
  ];

  const statCards = [
    { title: 'Tareas Pendientes', value: indicators.pendingTasks, icon: Clock, color: 'text-blue-500', bg: 'bg-blue-50' },
    { title: 'Tareas Vencidas', value: indicators.overdueTasks, icon: AlertCircle, color: 'text-red-500', bg: 'bg-red-50' },
    { title: 'Realizadas Hoy', value: indicators.completedToday, icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-50' },
    { title: 'Procesos Activos', value: indicators.activeProcesses, icon: Activity, color: 'text-purple-500', bg: 'bg-purple-50' },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Operaciones</h1>
        <p className="text-gray-500 mt-2">Centro de organización y planificación de actividades operativas.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
              <div className={`p-4 rounded-xl ${stat.bg} ${stat.color}`}>
                <Icon size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900">
                  {loading ? '...' : stat.value}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp size={20} className="text-gray-500" />
            Accesos Rápidos
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {menuItems.map((item, i) => {
              const Icon = item.icon;
              return (
                <Link 
                  key={i} 
                  href={item.href}
                  className="flex items-start gap-4 p-4 rounded-xl border border-gray-100 hover:border-blue-500 hover:shadow-md transition-all group"
                >
                  <div className="p-2 bg-gray-50 rounded-lg group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                    <Icon size={20} className="text-gray-600 group-hover:text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">{item.name}</h3>
                    <p className="text-sm text-gray-500 mt-1">{item.desc}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-gray-900">Próximas Tareas</h2>
              <Link href="/operaciones/tareas" className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1">
                Ver todas <ArrowRight size={14} />
              </Link>
            </div>

            {loading ? (
              <div className="text-center py-10 text-gray-400">Cargando tareas...</div>
            ) : upcomingTasks.length === 0 ? (
              <div className="text-center py-12 text-gray-400 border border-dashed border-gray-100 rounded-xl">
                <CheckCircle2 size={32} className="mx-auto text-gray-300 mb-2" />
                <p className="text-sm font-medium">No hay tareas pendientes en este momento.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingTasks.map(t => (
                  <div key={t.id} className="p-3 bg-gray-50/70 hover:bg-blue-50/50 rounded-xl border border-gray-100 flex justify-between items-center transition-colors">
                    <div className="space-y-0.5">
                      <div className="font-semibold text-gray-900 text-sm">{t.name}</div>
                      {t.process && (
                        <span className="text-[11px] font-bold text-gray-400 bg-white px-2 py-0.5 rounded border border-gray-100">
                          {t.process.code} - {t.process.name}
                        </span>
                      )}
                    </div>
                    <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                      Pendiente
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
