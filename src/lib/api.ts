const getApiUrl = (endpoint: string): string => {
  const isDev = import.meta.env.DEV;

  if (isDev) {
    return `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/${endpoint}`;
  }

  return `/api/${endpoint}`;
};

export const apiConfig = {
  getUrl: getApiUrl,

  endpoints: {
    adminLogin: () => getApiUrl('admin/login'),
    adminGetMe: () => getApiUrl('admin/me'),
    adminVerifySession: () => getApiUrl('admin/verify-session'),
    adminForgotPassword: () => getApiUrl('admin/forgot-password'),
    adminResetPassword: () => getApiUrl('admin/reset-password'),
    setupAdminAuth: () => getApiUrl('setup-admin-auth'),
    createAdmin: () => getApiUrl('create-admin'),
    memberRegister: () => getApiUrl('member-register'),
    memberLogin: () => getApiUrl('member-login'),
    memberLogout: () => getApiUrl('member-logout'),
    requestResetPassword: () => getApiUrl('request-reset-password'),
    confirmResetPassword: () => getApiUrl('confirm-reset-password'),
  }
};

export const getAuthHeaders = (token?: string) => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  } else {
    headers['Authorization'] = `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`;
  }

  return headers;
};
