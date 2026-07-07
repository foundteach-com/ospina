'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Target,
  DollarSign,
  Scale,
  Users,
  Shield,
  TrendingUp,
  Cpu,
  ShoppingCart,
  Package,
  Briefcase,
  Wallet,
  BarChart3,
  ArrowUpRight
} from 'lucide-react';

interface User {
  name: string;
  email: string;
  role: string;
}

const modules = [
  {
    title: 'Área Administrativa',
    items: [
      { name: 'Dirección', href: '/direccion', icon: Target, color: 'from-blue-500 to-blue-700', description: 'Panel ejecutivo con KPIs y gráficos de rendimiento' },
      { name: 'Finanzas', href: '/finanzas', icon: DollarSign, color: 'from-green-500 to-emerald-700', description: 'Flujo de caja, presupuestos y reportes financieros' },
      { name: 'Jurídico', href: '/juridico', icon: Scale, color: 'from-amber-500 to-orange-700', description: 'Contratos, actas y documentos legales' },
      { name: 'Talento Humano', href: '/talento-humano', icon: Users, color: 'from-violet-500 to-purple-700', description: 'Empleados, contratos laborales y nómina' },
      { name: 'SST', href: '/sst', icon: Shield, color: 'from-red-500 to-rose-700', description: 'Seguridad y salud en el trabajo' },
    ]
  },
  {
    title: 'Área Operativa',
    items: [
      { name: 'Comercial', href: '/comercial', icon: TrendingUp, color: 'from-cyan-500 to-blue-700', description: 'Ventas, cotizaciones y clientes' },
      { name: 'Operaciones', href: '/operaciones', icon: Briefcase, color: 'from-indigo-500 to-indigo-700', description: 'Proyectos, tareas y listas de verificación' },
      { name: 'Compras', href: '/compras', icon: ShoppingCart, color: 'from-amber-500 to-yellow-700', description: 'Órdenes de compra y proveedores' },
      { name: 'Inventario', href: '/inventario', icon: Package, color: 'from-teal-500 to-teal-700', description: 'Stock, productos y movimientos' },
      { name: 'Tecnología', href: '/tecnologia', icon: Cpu, color: 'from-gray-500 to-gray-700', description: 'Activos de TI y licencias de software' },
    ]
  }
];

const quickActions = [
  { name: 'Nueva Venta', href: '/ventas/crear', icon: Wallet, color: 'bg-blue-600 hover:bg-blue-700' },
  { name: 'Crear Cotización', href: '/cotizaciones/crear', icon: BarChart3, color: 'bg-emerald-600 hover:bg-emerald-700' },
  { name: 'Registrar Compra', href: '/compras/crear', icon: ShoppingCart, color: 'bg-amber-600 hover:bg-amber-700' },
  { name: 'Flujo de Caja', href: '/flujo-caja', icon: DollarSign, color: 'bg-purple-600 hover:bg-purple-700' },
];

export default function AdminPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    const userData = localStorage.getItem('user');

    if (!token) {
      router.push('/login');
      return;
    }

    if (userData) {
      setUser(JSON.parse(userData));
    }

    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleDateString('es-CO', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }));
    };

    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, [router]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Buenos días';
    if (hour < 18) return 'Buenas tardes';
    return 'Buenas noches';
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-12">
      {/* HEADER */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 rounded-3xl p-8 md:p-10 text-white shadow-2xl shadow-blue-600/20">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full -ml-16 -mb-16 blur-2xl"></div>
        <div className="relative z-10">
          <p className="text-blue-200 font-medium text-sm uppercase tracking-wider mb-2">{currentTime}</p>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            {getGreeting()}, {user.name?.split(' ')[0] || 'Usuario'} 👋
          </h1>
          <p className="text-blue-100 text-lg max-w-xl">
            Bienvenido al centro de operaciones de Ospina Comercializadora.
          </p>
        </div>
      </div>

      {/* ACCIONES RÁPIDAS */}
      <div>
        <h2 className="text-lg font-bold text-gray-900 mb-4">Acciones Rápidas</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickActions.map(action => (
            <Link
              key={action.name}
              href={action.href}
              className={`${action.color} text-white rounded-2xl p-4 flex items-center gap-3 transition-all shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]`}
            >
              <action.icon className="w-6 h-6 shrink-0" />
              <span className="font-semibold text-sm">{action.name}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* MÓDULOS */}
      {modules.map(category => (
        <div key={category.title}>
          <h2 className="text-lg font-bold text-gray-900 mb-4">{category.title}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {category.items.map(item => (
              <Link
                key={item.name}
                href={item.href}
                className="group bg-white/70 backdrop-blur-xl border border-white/20 rounded-2xl p-5 shadow-[0_4px_20px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all hover:scale-[1.01] active:scale-[0.99]"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className={`w-12 h-12 bg-gradient-to-br ${item.color} rounded-2xl flex items-center justify-center text-white shadow-lg`}>
                    <item.icon className="w-6 h-6" />
                  </div>
                  <ArrowUpRight className="w-5 h-5 text-gray-300 group-hover:text-blue-600 transition-colors" />
                </div>
                <h3 className="text-base font-bold text-gray-900 mb-1 group-hover:text-blue-700 transition-colors">{item.name}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{item.description}</p>
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
