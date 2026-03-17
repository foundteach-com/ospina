'use client';

import { useEffect, useState } from 'react';

interface Notification {
  id: string;
  nombre: string;
  empresa?: string;
  email: string;
  telefono: string;
  mensaje: string;
  isRead: boolean;
  createdAt: string;
}

export default function NotificacionesPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('access_token');
      let apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
      if (typeof window !== 'undefined' && (apiUrl.includes('localhost') || !apiUrl)) {
        const hostname = window.location.hostname;
        if (hostname.includes('ospinacomercializadoraysuministros.com')) {
          apiUrl = 'https://api.ospinacomercializadoraysuministros.com';
        } else {
          apiUrl = 'http://localhost:3001';
        }
      }

      const response = await fetch(`${apiUrl}/contact`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setNotifications(data);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id: string, isRead: boolean) => {
    if (isRead) return;

    try {
      const token = localStorage.getItem('access_token');
      let apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
      if (typeof window !== 'undefined' && (apiUrl.includes('localhost') || !apiUrl)) {
        const hostname = window.location.hostname;
        if (hostname.includes('ospinacomercializadoraysuministros.com')) {
          apiUrl = 'https://api.ospinacomercializadoraysuministros.com';
        } else {
          apiUrl = 'http://localhost:3001';
        }
      }

      const response = await fetch(`${apiUrl}/contact/${id}/read`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
        );
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  return (
    <div className="p-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Notificaciones de Contacto</h1>
          <p className="text-gray-600 mt-1">Mensajes recibidos desde el formulario web</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Fecha</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Remitente</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Contacto</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Mensaje</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Estado</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-500">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                      Cargando notificaciones...
                    </div>
                  </td>
                </tr>
              ) : notifications.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-500">
                    No hay notificaciones recientes.
                  </td>
                </tr>
              ) : (
                notifications.map((notification) => (
                  <tr
                    key={notification.id}
                    className={`transition-colors ${
                      notification.isRead ? 'bg-gray-50' : 'bg-white font-medium hover:bg-gray-50'
                    }`}
                  >
                    <td className="py-4 px-6 text-gray-700 whitespace-nowrap">
                      {new Date(notification.createdAt).toLocaleDateString('es-CO', {
                        timeZone: 'UTC',
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-sm">
                        <p className={`text-gray-900 ${!notification.isRead ? 'font-bold' : ''}`}>
                          {notification.nombre}
                        </p>
                        {notification.empresa && (
                          <p className="text-gray-500">{notification.empresa}</p>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-sm">
                        <p className="text-gray-700">{notification.email}</p>
                        <p className="text-gray-500">{notification.telefono}</p>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-gray-700 max-w-sm truncate" title={notification.mensaje}>
                      {notification.mensaje}
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          notification.isRead
                            ? 'bg-gray-100 text-gray-600'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {notification.isRead ? 'Leído' : 'Nuevo'}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <button
                        onClick={() => handleMarkAsRead(notification.id, notification.isRead)}
                        disabled={notification.isRead}
                        className={`p-2 rounded-lg transition-colors ${
                          notification.isRead
                            ? 'text-gray-300 cursor-not-allowed'
                            : 'text-blue-600 hover:bg-blue-50'
                        }`}
                        title="Marcar como leído"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
