export interface AdminSession {
  accessToken: string;
  role: 'admin' | 'super_admin';
  adminId?: string;
  email?: string;
}

export interface MemberSession {
  accessToken: string;
  userId?: string;
  email?: string;
}

export function getAdminSession(): AdminSession | null {
  try {
    const raw = localStorage.getItem('ctgold_admin_session');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function getMemberSession(): MemberSession | null {
  try {
    const raw = localStorage.getItem('ctgold_member_session');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function isAdminLoggedIn(): boolean {
  const session = getAdminSession();
  return Boolean(session?.accessToken);
}

export function isMemberLoggedIn(): boolean {
  const session = getMemberSession();
  return Boolean(session?.accessToken);
}

export function isSuperAdmin(): boolean {
  const session = getAdminSession();
  return session?.role === 'super_admin';
}

export function setAdminSession(session: AdminSession): void {
  localStorage.setItem('ctgold_admin_session', JSON.stringify(session));
}

export function setMemberSession(session: MemberSession): void {
  localStorage.setItem('ctgold_member_session', JSON.stringify(session));
}

export function clearAdminSession(): void {
  localStorage.removeItem('ctgold_admin_session');
}

export function clearMemberSession(): void {
  localStorage.removeItem('ctgold_member_session');
}
