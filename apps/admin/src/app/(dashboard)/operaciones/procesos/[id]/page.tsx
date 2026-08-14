'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Activity, Calendar as CalendarIcon, CheckCircle2, Clock, Trash2 } from 'lucide-react';

interface OpTask {
  id: string;
  name: string;
  status: string;
  priority: string;
  scheduledDate: string | null;
}

interface OpProcessDetail {
  id: string;
  name: string;
  description: string | null;
  objective: string | null;
  status: string;
  color: string;
  createdAt: string;
  tasks: OpTask[];
}

export default function ProcessDetailPage(props: { params: Promise<{ id: string }> }) {
  const params = use(props.params);
  const router = useRouter();
  const [processInfo, setProcessInfo] = useState<OpProcessDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProcessDetails();
  }, [params.id]);

  const fetchProcessDetails = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/operations/processes/${params.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setProcessInfo(data);
      } else {
        router.push('/operaciones/procesos');
      }
    } catch (err) {
      console.error('Error fetching process details:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Cargando detalles del proceso...</div>;
  }

  if (!processInfo) {
    return <div className="p-8 text-center text-gray-500">Proceso no encontrado.</div>;
  }

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/operaciones/procesos" className="p-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
          <ArrowLeft size={20} className="text-gray-600" />
        </Link>
        <div>
          <div className="flex items-center gap-3">
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
              processInfo.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-700'
            }`}>
              {processInfo.status === 'ACTIVE' ? 'Activo' : 'Inactivo'}
            </span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mt-1">{processInfo.name}</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Info lateral */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div 
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-white mb-6 shadow-sm"
              style={{ backgroundColor: processInfo.color || '#3b82f6' }}
            >
              <Activity size={32} />
            </div>
            
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">Descripción</h4>
                <p className="text-gray-800 text-sm">{processInfo.description || 'Sin descripción'}</p>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">Objetivo General</h4>
                <p className="text-gray-800 text-sm">{processInfo.objective || 'No especificado'}</p>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">Fecha de Creación</h4>
                <p className="text-gray-800 text-sm">{new Date(processInfo.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Listado de tareas asociadas */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-gray-900">Tareas del Proceso</h2>
              <Link 
                href="/operaciones/tareas" 
                className="text-sm text-blue-600 hover:text-blue-800 font-semibold"
              >
                Ir a todas las tareas &rarr;
              </Link>
            </div>

            {processInfo.tasks && processInfo.tasks.length > 0 ? (
              <div className="space-y-3">
                {processInfo.tasks.map(task => (
                  <div key={task.id} className="flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:border-blue-200 transition-colors bg-gray-50/30">
                    <div className="flex items-center gap-3">
                      {task.status === 'COMPLETED' ? (
                        <CheckCircle2 size={20} className="text-emerald-500" />
                      ) : (
                        <Clock size={20} className="text-amber-500" />
                      )}
                      <div>
                        <h4 className="font-semibold text-gray-800">{task.name}</h4>
                        <div className="text-xs text-gray-500 flex items-center gap-2 mt-1">
                          <CalendarIcon size={12} />
                          {task.scheduledDate ? new Date(task.scheduledDate).toLocaleDateString() : 'Sin fecha'}
                        </div>
                      </div>
                    </div>
                    <div>
                      <span className="bg-white border border-gray-200 px-2.5 py-1 rounded-md text-xs font-semibold text-gray-600 shadow-sm">
                        {task.status === 'PENDING' ? 'Pendiente' : 
                         task.status === 'IN_PROGRESS' ? 'En Progreso' : 
                         task.status === 'COMPLETED' ? 'Completada' : 'Cancelada'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 text-gray-500 border border-dashed border-gray-200 rounded-xl bg-gray-50/50">
                <p>Este proceso aún no tiene tareas vinculadas.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
