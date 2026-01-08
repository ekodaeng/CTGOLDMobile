import { supabase } from './supabaseClient';

const getAdminSession = async (): Promise<string | null> => {
  try {
    console.log('[AdminActivity] Getting admin session...');

    const { data: { session }, error } = await supabase.auth.getSession();

    if (error) {
      console.error('[AdminActivity] Error getting session:', error);
      return null;
    }

    if (!session) {
      console.error('[AdminActivity] No active session found');
      return null;
    }

    console.log('[AdminActivity] Session found, user ID:', session.user?.id);

    const tokenExpiresAt = session.expires_at;
    const now = Math.floor(Date.now() / 1000);
    const timeUntilExpiry = tokenExpiresAt ? tokenExpiresAt - now : 0;

    console.log(`[AdminActivity] Token expires in ${timeUntilExpiry} seconds`);

    if (timeUntilExpiry <= 0) {
      console.error('[AdminActivity] Token already expired');
      return null;
    }

    if (timeUntilExpiry < 300) {
      console.log('[AdminActivity] Token expiring soon (< 5 min), attempting to refresh session...');

      try {
        const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();

        if (refreshError) {
          console.error('[AdminActivity] Failed to refresh session:', refreshError);
          if (timeUntilExpiry > 60) {
            console.log('[AdminActivity] Refresh failed but token still valid for 1+ min, using existing token');
            return session.access_token;
          }
          return null;
        }

        if (!refreshData.session) {
          console.error('[AdminActivity] No session returned after refresh');
          if (timeUntilExpiry > 60) {
            console.log('[AdminActivity] No refreshed session but token still valid for 1+ min, using existing token');
            return session.access_token;
          }
          return null;
        }

        console.log('[AdminActivity] Session refreshed successfully, new expiry:', refreshData.session.expires_at);
        return refreshData.session.access_token;
      } catch (refreshEx) {
        console.error('[AdminActivity] Exception during session refresh:', refreshEx);
        if (timeUntilExpiry > 60) {
          console.log('[AdminActivity] Refresh exception but token still valid for 1+ min, using existing token');
          return session.access_token;
        }
        return null;
      }
    }

    console.log('[AdminActivity] Using current session token');
    return session.access_token;
  } catch (error) {
    console.error('[AdminActivity] Exception in getAdminSession:', error);
    return null;
  }
};

export const callAdminFunction = async (
  functionName: string,
  body: Record<string, any>
): Promise<{ ok: boolean; error?: string; error_code?: string }> => {
  console.log(`[AdminActivity] Calling function: ${functionName}`);

  const token = await getAdminSession();

  if (!token) {
    console.error('[AdminActivity] No session token available');
    return {
      ok: false,
      error: 'Sesi tidak ditemukan. Silakan login kembali.',
      error_code: 'NO_TOKEN'
    };
  }

  console.log(`[AdminActivity] Got token, length: ${token.length}`);

  try {
    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/${functionName}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      }
    );

    console.log(`[AdminActivity] Response status: ${response.status}`);

    let data;
    try {
      data = await response.json();
      console.log(`[AdminActivity] Response data:`, data);
    } catch (parseError) {
      console.error('[AdminActivity] Failed to parse response:', parseError);
      return {
        ok: false,
        error: `Server mengembalikan response yang tidak valid (status ${response.status})`,
        error_code: 'INVALID_RESPONSE'
      };
    }

    if (!response.ok) {
      console.error(`[AdminActivity] Function ${functionName} error:`, {
        status: response.status,
        statusText: response.statusText,
        data
      });

      if (response.status === 401) {
        const errorCode = data.error_code || '';
        const errorMsg = data.error || data.message || 'Unauthorized';

        if (errorCode === 'INVALID_TOKEN' || errorCode === 'TOKEN_VERIFICATION_FAILED' ||
            errorMsg.includes('expired') || errorMsg.includes('Invalid JWT')) {
          return {
            ok: false,
            error: 'Sesi telah berakhir. Silakan login kembali.',
            error_code: 'SESSION_EXPIRED'
          };
        }

        return {
          ok: false,
          error: data.error || 'Akses ditolak',
          error_code: data.error_code || 'UNAUTHORIZED'
        };
      }

      return {
        ok: false,
        error: data.error || `Request gagal dengan status ${response.status}`,
        error_code: data.error_code || 'REQUEST_FAILED'
      };
    }

    return data;
  } catch (error: any) {
    console.error(`[AdminActivity] Exception calling ${functionName}:`, error);

    if (error?.message?.includes('Failed to fetch') || error?.name === 'NetworkError') {
      return {
        ok: false,
        error: 'Koneksi terputus. Periksa internet Anda.',
        error_code: 'NETWORK_ERROR'
      };
    }

    return {
      ok: false,
      error: error?.message || 'Terjadi kesalahan tidak terduga',
      error_code: 'UNKNOWN_ERROR'
    };
  }
};

export const updateMember = async (
  userId: string,
  updates: {
    full_name?: string;
    email?: string;
    city?: string;
    phone?: string | null;
    telegram_username?: string | null;
  }
) => {
  return callAdminFunction('admin-members-update', { userId, updates });
};

export const deleteMember = async (userId: string) => {
  return callAdminFunction('admin-members-delete', { userId });
};

export const approveMember = async (userId: string) => {
  return callAdminFunction('admin-members-approve', { userId });
};

export const rejectMember = async (userId: string) => {
  return callAdminFunction('admin-members-reject', { userId });
};

export type ActivityAction =
  | 'login'
  | 'logout'
  | 'edit_member'
  | 'approve_member'
  | 'reject_member'
  | 'delete_member'
  | 'create_admin'
  | 'edit_admin'
  | 'delete_admin';

interface LogActivityParams {
  adminId: string;
  adminEmail: string;
  action: ActivityAction;
  targetUserId?: string;
  targetUserEmail?: string;
  targetUserName?: string;
  changes?: Record<string, any>;
}

export async function logAdminActivity(params: LogActivityParams): Promise<void> {
  try {
    const { error } = await supabase
      .from('admin_activity_logs')
      .insert({
        admin_user_id: params.adminId,
        admin_email: params.adminEmail,
        action_type: params.action,
        target_user_id: params.targetUserId || null,
        target_user_email: params.targetUserEmail || null,
        target_user_name: params.targetUserName || null,
        changes: params.changes || null,
        user_agent: navigator.userAgent || null,
      });

    if (error) {
      console.error('[ActivityLog] Failed to log activity:', error);
    } else {
      console.log(`[ActivityLog] Logged: ${params.action} by ${params.adminEmail}`);
    }
  } catch (error) {
    console.error('[ActivityLog] Exception logging activity:', error);
  }
}

export function logLogin(adminId: string, adminEmail: string) {
  logAdminActivity({
    adminId,
    adminEmail,
    action: 'login',
  });
}

export function logLogout(adminId: string, adminEmail: string) {
  logAdminActivity({
    adminId,
    adminEmail,
    action: 'logout',
  });
}

export function logMemberEdit(
  adminId: string,
  adminEmail: string,
  targetUserId: string,
  targetUserEmail: string,
  targetUserName: string,
  changes: Record<string, any>
) {
  logAdminActivity({
    adminId,
    adminEmail,
    action: 'edit_member',
    targetUserId,
    targetUserEmail,
    targetUserName,
    changes,
  });
}

export function logMemberApprove(
  adminId: string,
  adminEmail: string,
  targetUserId: string,
  targetUserEmail: string,
  targetUserName: string
) {
  logAdminActivity({
    adminId,
    adminEmail,
    action: 'approve_member',
    targetUserId,
    targetUserEmail,
    targetUserName,
  });
}

export function logMemberReject(
  adminId: string,
  adminEmail: string,
  targetUserId: string,
  targetUserEmail: string,
  targetUserName: string
) {
  logAdminActivity({
    adminId,
    adminEmail,
    action: 'reject_member',
    targetUserId,
    targetUserEmail,
    targetUserName,
  });
}

export function logMemberDelete(
  adminId: string,
  adminEmail: string,
  targetUserId: string,
  targetUserEmail: string,
  targetUserName: string
) {
  logAdminActivity({
    adminId,
    adminEmail,
    action: 'delete_member',
    targetUserId,
    targetUserEmail,
    targetUserName,
  });
}
