export interface UserPermissions {
  moduleAccess: string[];
  permissions: string[];
}

export const hasAccessToModule = (user: any, moduleName: string): boolean => {
  // Always allow admin to see everything as a fallback or if no moduleAccess is defined
  if (user?.role === 'ADMIN' && (!user.moduleAccess || user.moduleAccess.length === 0)) {
    return true;
  }
  
  if (!user || !user.moduleAccess) return false;
  
  // Array of accessible modules
  const accessibleModules = Array.isArray(user.moduleAccess) ? user.moduleAccess : [];
  
  // If the user has '*', they have access to all modules
  if (accessibleModules.includes('*')) return true;
  
  return accessibleModules.includes(moduleName);
};

export const hasPermission = (user: any, permissionString: string): boolean => {
  if (user?.role === 'ADMIN' && (!user.permissions || user.permissions.length === 0)) {
    return true;
  }
  
  if (!user || !user.permissions) return false;
  
  const perms = Array.isArray(user.permissions) ? user.permissions : [];
  
  if (perms.includes('*')) return true;
  
  // Check if they have wildcard for this module e.g. "ventas:*"
  const [mod] = permissionString.split(':');
  if (perms.includes(`${mod}:*`)) return true;
  
  return perms.includes(permissionString);
};
