const ADMIN_WHITELIST = import.meta.env.VITE_ADMIN_EMAIL_WHITELIST || '';
const SUPER_ADMIN_WHITELIST = import.meta.env.VITE_SUPER_ADMIN_EMAIL_WHITELIST || '';

export function getAdminWhitelist(): string[] {
  return ADMIN_WHITELIST.split(',').map(e => e.trim()).filter(Boolean);
}

export function getSuperAdminWhitelist(): string[] {
  return SUPER_ADMIN_WHITELIST.split(',').map(e => e.trim()).filter(Boolean);
}

export function isAdminWhitelisted(email: string): boolean {
  const whitelist = getAdminWhitelist();
  return whitelist.includes(email.toLowerCase());
}

export function isSuperAdmin(email: string): boolean {
  const superAdmins = getSuperAdminWhitelist();
  return superAdmins.includes(email.toLowerCase());
}

export function getAdminRole(email: string): 'super_admin' | 'admin' | null {
  if (!isAdminWhitelisted(email)) return null;
  return isSuperAdmin(email) ? 'super_admin' : 'admin';
}
