'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';

const menuItems = [
  {
    name: 'Dashboard',
    href: '/',
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect width="7" height="9" x="3" y="3" rx="1" />
        <rect width="7" height="5" x="14" y="3" rx="1" />
        <rect width="7" height="9" x="14" y="12" rx="1" />
        <rect width="7" height="5" x="3" y="16" rx="1" />
      </svg>
    ),
  },
  {
    name: 'Inventario',
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="m7.5 4.27 9 5.15" />
        <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
        <path d="m3.3 7 8.7 5 8.7-5" />
        <path d="M12 22V12" />
      </svg>
    ),
    children: [
      { name: 'Stock', href: '/inventario' },
      { name: 'Productos', href: '/productos' },
    ],
  },
  {
    name: 'Compras',
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
        <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
        <line x1="12" x2="12" y1="22.08" y2="12" />
      </svg>
    ),
    children: [
      { name: 'Movimientos de Compras', href: '/compras' },
      { name: 'Proveedores', href: '/proveedores' },
    ],
  },
  {
    name: 'Ventas',
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="8" cy="21" r="1" />
        <circle cx="19" cy="21" r="1" />
        <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
      </svg>
    ),
    children: [
      { name: 'Movimientos de Ventas', href: '/ventas' },
      { name: 'Clientes', href: '/clientes' },
    ],
  },
  {
    name: 'Cotizaciones',
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" x2="8" y1="13" y2="13" />
        <line x1="16" x2="8" y1="17" y2="17" />
        <polyline points="10 9 9 9 8 9" />
      </svg>
    ),
    children: [
      { name: 'Movimientos de Cotizaciones', href: '/cotizaciones' },
    ],
  },
  {
    name: 'Flujo de Caja',
    href: '/flujo-caja',
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 2v20" />
        <path d="m17 5-5-3-5 3" />
        <path d="m17 19-5 3-5-3" />
        <path d="M2 12h20" />
        <path d="m5 7-3 5 3 5" />
        <path d="m19 7 3 5-3 5" />
      </svg>
    ),
  },
  {
    name: 'Usuarios',
    href: '/usuarios',
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
];

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatarUrl?: string;
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [settings, setSettings] = useState<{ companyName: string; logoUrl: string | null } | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    const userData = localStorage.getItem('user');

    if (!token) {
      router.push('/login');
    } else if (userData) {
      setUser(JSON.parse(userData) as User);
      fetchSettings(token);
    }
  }, [router]);

  const fetchSettings = async (token: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/settings`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setSettings(data);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  const [openGroups, setOpenGroups] = useState<string[]>([]);

  useEffect(() => {
    const activeGroup = menuItems.find((item) =>
      item.children?.some((child) => child.href === pathname)
    );
    if (activeGroup && !openGroups.includes(activeGroup.name)) {
      setOpenGroups((prev) => [...prev, activeGroup.name]);
    }
  }, [pathname]);

  const toggleGroup = (name: string) => {
    setOpenGroups((prev) =>
      prev.includes(name) ? prev.filter((item) => item !== name) : [...prev, name]
    );
  };

  if (!user) {
    return null; // or a loading spinner
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col justify-between h-screen sticky top-0 overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-10 overflow-hidden">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shrink-0 overflow-hidden shadow-sm">
              {settings?.logoUrl ? (
                <img src={settings.logoUrl} alt="Logo" className="w-full h-full object-cover" />
              ) : (
                <span className="font-bold text-white text-xl">
                  {settings?.companyName?.charAt(0) || 'O'}
                </span>
              )}
            </div>
            <h2 className="text-lg font-bold tracking-tight text-gray-900 truncate">
              {settings?.companyName || 'Cargando...'}
            </h2>
          </div>

          <nav>
            <ul className="space-y-1">
              {menuItems.map((item) => {
                // Hide "Usuarios" tab for specific user
                if (item.name === 'Usuarios' && user.name === 'LUIS FERNANDO OSPINA SUAREZ') {
                  return null;
                }
                if (item.children) {
                  const isExpanded = openGroups.includes(item.name);
                  const isAnyChildActive = item.children.some((child) => child.href === pathname);

                  return (
                    <li key={item.name} className="space-y-1">
                      <button
                        onClick={() => toggleGroup(item.name)}
                        className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl font-medium transition-all border ${
                          isAnyChildActive
                            ? 'bg-blue-50 text-blue-600 border-blue-100'
                            : 'text-gray-600 border-transparent hover:text-gray-900 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          {item.icon}
                          {item.name}
                        </div>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className={`transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                        >
                          <path d="m6 9 6 6 6-6" />
                        </svg>
                      </button>

                      {isExpanded && (
                        <ul className="ml-4 pl-4 border-l border-gray-200 space-y-1 mt-1">
                          {item.children.map((child) => {
                            const isChildActive = pathname === child.href;
                            return (
                              <li key={child.name}>
                                <Link
                                  href={child.href}
                                  className={`flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                                    isChildActive
                                      ? 'text-blue-600 bg-blue-50'
                                      : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                                  }`}
                                >
                                  {child.name}
                                </Link>
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </li>
                  );
                }

                const isActive = pathname === item.href;
                return (
                  <li key={item.name}>
                    <Link
                      href={item.href || '#'}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all border ${
                        isActive
                          ? 'bg-blue-50 text-blue-600 border-blue-100'
                          : 'text-gray-600 border-transparent hover:text-gray-900 hover:bg-gray-50'
                      }`}
                    >
                      {item.icon}
                      {item.name}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>

        <div className="p-6 border-t border-gray-200">
          <Link 
            href="/perfil" 
            className="flex items-center gap-3 mb-4 px-2 hover:bg-gray-50 p-2 rounded-xl transition-all cursor-pointer group"
            title="Editar Perfil"
          >
            <div className="w-10 h-10 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-sm font-bold text-blue-600 overflow-hidden shrink-0">
              {user.avatarUrl ? (
                <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                user.name?.charAt(0) || 'A'
              )}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-semibold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                {user.name}
              </p>
              <p className="text-xs text-gray-500 truncate">{user.email}</p>
            </div>
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors text-sm font-medium"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" x2="9" y1="12" y2="12" />
            </svg>
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
