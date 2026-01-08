export function isSuperAdmin(email: string | null | undefined): boolean {
  if (!email) return false;

  const whitelist = import.meta.env.VITE_SUPER_ADMIN_EMAIL_WHITELIST || '';
  const superAdminEmails = whitelist
    .split(',')
    .map((e: string) => e.trim().toLowerCase())
    .filter(Boolean);

  return superAdminEmails.includes(email.toLowerCase());
}
