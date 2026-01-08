interface AdminSession {
  session: string;
  email: string;
  role: string;
  expires_at: number;
  full_name?: string;
  id?: string;
}

const SESSION_KEYS = {
  SESSION: 'ctgold_admin_session',
  EMAIL: 'ctgold_admin_email',
  ROLE: 'ctgold_admin_role',
  EXPIRES_AT: 'ctgold_admin_expires_at',
  FULL_NAME: 'ctgold_admin_full_name',
  ID: 'ctgold_admin_id',
  LAST_ACTIVITY: 'ctgold_admin_last_activity',
};

const SESSION_DURATION = {
  SHORT: 8 * 60 * 60 * 1000,
  LONG: 30 * 24 * 60 * 60 * 1000,
};

export function setAdminSession(session: AdminSession, rememberMe: boolean = false): void {
  try {
    const storage = rememberMe ? localStorage : sessionStorage;
    const now = Date.now();

    storage.setItem(SESSION_KEYS.SESSION, session.session);
    storage.setItem(SESSION_KEYS.EMAIL, session.email);
    storage.setItem(SESSION_KEYS.ROLE, session.role);
    storage.setItem(SESSION_KEYS.EXPIRES_AT, session.expires_at.toString());
    storage.setItem(SESSION_KEYS.LAST_ACTIVITY, now.toString());

    if (session.full_name) {
      storage.setItem(SESSION_KEYS.FULL_NAME, session.full_name);
    }

    if (session.id) {
      storage.setItem(SESSION_KEYS.ID, session.id);
    }

    const memberData = {
      id: session.id,
      email: session.email,
      full_name: session.full_name,
      role: 'ADMIN',
      status: 'ACTIVE',
      member_code: '',
      city: ''
    };

    if (rememberMe) {
      localStorage.setItem('ctgold_member', JSON.stringify(memberData));
    } else {
      sessionStorage.setItem('ctgold_member', JSON.stringify(memberData));
    }

    console.log(`✅ Admin session saved (${rememberMe ? 'localStorage' : 'sessionStorage'})`);
  } catch (error) {
    console.error('Failed to save admin session:', error);
    throw new Error('Failed to save session');
  }
}

export function getSessionDuration(rememberMe: boolean): number {
  return rememberMe ? SESSION_DURATION.LONG : SESSION_DURATION.SHORT;
}

export function getAdminSession(): AdminSession | null {
  try {
    let storage: Storage | null = null;
    let session: string | null = null;

    session = sessionStorage.getItem(SESSION_KEYS.SESSION);
    if (session) {
      storage = sessionStorage;
    } else {
      session = localStorage.getItem(SESSION_KEYS.SESSION);
      if (session) {
        storage = localStorage;
      }
    }

    if (!storage || !session) {
      return null;
    }

    const email = storage.getItem(SESSION_KEYS.EMAIL);
    const role = storage.getItem(SESSION_KEYS.ROLE);
    const expiresAt = storage.getItem(SESSION_KEYS.EXPIRES_AT);

    if (!email || !role || !expiresAt) {
      return null;
    }

    const expiresAtNum = parseInt(expiresAt, 10);
    if (isNaN(expiresAtNum)) {
      return null;
    }

    if (Date.now() > expiresAtNum) {
      clearAdminSession();
      return null;
    }

    return {
      session,
      email,
      role,
      expires_at: expiresAtNum,
      full_name: storage.getItem(SESSION_KEYS.FULL_NAME) || undefined,
      id: storage.getItem(SESSION_KEYS.ID) || undefined,
    };
  } catch (error) {
    console.error('Failed to get admin session:', error);
    return null;
  }
}

export function isAdminSessionValid(): boolean {
  const session = getAdminSession();
  return session !== null;
}

export function clearAdminSession(): void {
  try {
    [sessionStorage, localStorage].forEach(storage => {
      storage.removeItem(SESSION_KEYS.SESSION);
      storage.removeItem(SESSION_KEYS.EMAIL);
      storage.removeItem(SESSION_KEYS.ROLE);
      storage.removeItem(SESSION_KEYS.EXPIRES_AT);
      storage.removeItem(SESSION_KEYS.FULL_NAME);
      storage.removeItem(SESSION_KEYS.ID);
      storage.removeItem(SESSION_KEYS.LAST_ACTIVITY);
      storage.removeItem('ctgold_member');
      storage.removeItem('ctgold_admin_session');
      storage.removeItem('ctgold-auth');
    });

    const authKeys = Object.keys(localStorage).filter(key =>
      key.startsWith('sb-') ||
      key.startsWith('supabase.') ||
      key.includes('auth-token') ||
      key === 'ctgold-auth'
    );
    authKeys.forEach(key => {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    });

    console.log('🧹 Admin session cleared from both storages');
  } catch (error) {
    console.error('Failed to clear admin session:', error);
  }
}

export function getSessionExpiresIn(): number | null {
  const session = getAdminSession();
  if (!session) return null;

  const now = Date.now();
  const expiresIn = session.expires_at - now;

  return Math.max(0, expiresIn);
}

export function updateLastActivity(): void {
  try {
    const storage = sessionStorage.getItem(SESSION_KEYS.SESSION) ? sessionStorage : localStorage;
    storage.setItem(SESSION_KEYS.LAST_ACTIVITY, Date.now().toString());
  } catch (error) {
    console.error('Failed to update last activity:', error);
  }
}

export function getLastActivity(): number | null {
  try {
    const storage = sessionStorage.getItem(SESSION_KEYS.SESSION) ? sessionStorage : localStorage;
    const lastActivity = storage.getItem(SESSION_KEYS.LAST_ACTIVITY);

    if (!lastActivity) return null;

    const timestamp = parseInt(lastActivity, 10);
    return isNaN(timestamp) ? null : timestamp;
  } catch (error) {
    console.error('Failed to get last activity:', error);
    return null;
  }
}

export function isSessionIdle(maxIdleTimeMs: number): boolean {
  const lastActivity = getLastActivity();
  if (!lastActivity) return false;

  const now = Date.now();
  const idleTime = now - lastActivity;

  return idleTime > maxIdleTimeMs;
}
