import { useState, useEffect, useCallback } from 'react';
import { hasPermission } from '@/lib/permissions';

export interface CurrentUser {
  id: string;
  name: string;
  email: string;
  role: string;
  moduleAccess: string[];
  permissions: string[];
}

/**
 * Hook centralizado para obtener el usuario en sesión y verificar permisos.
 *
 * can('ventas:create') → true si el usuario tiene ese permiso.
 * Siempre devuelve true para el rol ADMIN (retrocompatibilidad).
 */
export function useCurrentUser() {
  const [user, setUser] = useState<CurrentUser | null>(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const parsed = JSON.parse(userData);
        setUser({
          id: parsed.id || '',
          name: parsed.name || '',
          email: parsed.email || '',
          role: parsed.role || 'USER',
          moduleAccess: Array.isArray(parsed.moduleAccess) ? parsed.moduleAccess : [],
          permissions: Array.isArray(parsed.permissions) ? parsed.permissions : [],
        });
      } catch {
        // ignore malformed JSON
      }
    }
  }, []);

  const can = useCallback(
    (permissionString: string): boolean => {
      if (!user) return false;
      // ADMIN legacy: always allowed
      if (user.role === 'ADMIN') return true;
      return hasPermission(user, permissionString);
    },
    [user]
  );

  return { user, can };
}
