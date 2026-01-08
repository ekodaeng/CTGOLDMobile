export type AdminRole = 'admin' | 'super_admin';

export interface AdminPermissions {
  canViewMembers: boolean;
  canEditMembers: boolean;
  canApprovemembers: boolean;
  canDeleteMembers: boolean;
  canViewAdmins: boolean;
  canCreateAdmins: boolean;
  canEditAdmins: boolean;
  canDeleteAdmins: boolean;
  canViewActivityLogs: boolean;
  canViewAllActivityLogs: boolean;
  canManageSettings: boolean;
}

const ROLE_PERMISSIONS: Record<AdminRole, AdminPermissions> = {
  admin: {
    canViewMembers: true,
    canEditMembers: true,
    canApprovemembers: true,
    canDeleteMembers: false,
    canViewAdmins: false,
    canCreateAdmins: false,
    canEditAdmins: false,
    canDeleteAdmins: false,
    canViewActivityLogs: true,
    canViewAllActivityLogs: false,
    canManageSettings: false,
  },
  super_admin: {
    canViewMembers: true,
    canEditMembers: true,
    canApprovemembers: true,
    canDeleteMembers: true,
    canViewAdmins: true,
    canCreateAdmins: true,
    canEditAdmins: true,
    canDeleteAdmins: true,
    canViewActivityLogs: true,
    canViewAllActivityLogs: true,
    canManageSettings: true,
  },
};

export function getPermissions(role: string): AdminPermissions {
  const normalizedRole = role.toLowerCase();

  if (normalizedRole === 'super_admin' || normalizedRole === 'superadmin') {
    return ROLE_PERMISSIONS.super_admin;
  }

  return ROLE_PERMISSIONS.admin;
}

export function hasPermission(role: string, permission: keyof AdminPermissions): boolean {
  const permissions = getPermissions(role);
  return permissions[permission];
}

export function isSuperAdmin(role: string): boolean {
  const normalizedRole = role.toLowerCase();
  return normalizedRole === 'super_admin' || normalizedRole === 'superadmin';
}

export function canPerformAction(
  role: string,
  action: 'view' | 'edit' | 'approve' | 'delete' | 'create',
  target: 'members' | 'admins' | 'settings' | 'activity_logs'
): boolean {
  const permissions = getPermissions(role);

  if (target === 'members') {
    switch (action) {
      case 'view':
        return permissions.canViewMembers;
      case 'edit':
        return permissions.canEditMembers;
      case 'approve':
        return permissions.canApprovemembers;
      case 'delete':
        return permissions.canDeleteMembers;
      default:
        return false;
    }
  }

  if (target === 'admins') {
    switch (action) {
      case 'view':
        return permissions.canViewAdmins;
      case 'create':
        return permissions.canCreateAdmins;
      case 'edit':
        return permissions.canEditAdmins;
      case 'delete':
        return permissions.canDeleteAdmins;
      default:
        return false;
    }
  }

  if (target === 'activity_logs') {
    return action === 'view' && permissions.canViewActivityLogs;
  }

  if (target === 'settings') {
    return permissions.canManageSettings;
  }

  return false;
}
