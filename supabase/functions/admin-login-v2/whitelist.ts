function parseEmailList(envVar: string | undefined): string[] {
  if (!envVar) return [];
  return envVar
    .split(',')
    .map(email => email.trim().toLowerCase())
    .filter(email => email.length > 0);
}

export function getAdminWhitelist(): string[] {
  return parseEmailList(Deno.env.get('ADMIN_EMAIL_WHITELIST'));
}

export function getSuperAdminWhitelist(): string[] {
  return parseEmailList(Deno.env.get('SUPER_ADMIN_EMAIL_WHITELIST'));
}

export function isAllowedAdmin(email: string): boolean {
  const normalizedEmail = email.trim().toLowerCase();
  const adminList = getAdminWhitelist();
  return adminList.includes(normalizedEmail);
}

export function isSuperAdmin(email: string): boolean {
  const normalizedEmail = email.trim().toLowerCase();
  const superAdminList = getSuperAdminWhitelist();
  return superAdminList.includes(normalizedEmail);
}

export function determineRole(email: string): 'super_admin' | 'admin' {
  return isSuperAdmin(email) ? 'super_admin' : 'admin';
}