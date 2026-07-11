'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('access_token');

    if (!token) {
      router.push('/login');
      return;
    }

    setAuthorized(true);
  }, [router]);

  if (!authorized) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white text-gray-900 flex">
      <aside className="w-64 border-r border-gray-200 bg-white h-screen sticky top-0" />
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
