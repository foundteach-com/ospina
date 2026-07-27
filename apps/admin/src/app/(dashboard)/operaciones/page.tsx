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
  TrendingUp
} from 'lucide-react';

export default function OperationsDashboard() {
  const [loading, setLoading] = useState(true);
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

  const menuItems = [
    { name: 'Procesos', href: '/operaciones/procesos', icon: Activity, desc: 'Catálogo de procesos' },
    { name: 'Lista de Tareas', href: '/operaciones/tareas', icon: LayoutList, desc: 'Gestión y seguimiento' },
    { name: 'Kanban', href: '/operaciones/tareas/kanban', icon: LayoutList, desc: 'Tablero visual' },
    { name: 'Cronograma', href: '/operaciones/tareas/cronograma', icon: CalendarDays, desc: 'Vista semanal' },
    { name: 'Calendario', href: '/operaciones/tareas/calendario', icon: CalendarDays, desc: 'Vista mensual' },
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

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Próximas Tareas</h2>
          <div className="text-center py-10 text-gray-500">
            {/* TODO: Fetch and display upcoming tasks list */}
            <p>Cargando próximas tareas...</p>
          </div>
        </div>
      </div>
    </div>
  );
}
