export const ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  OPERATOR: 'operator',
  VIEWER: 'viewer',
  GUEST: 'guest',
};

export const PERMISSIONS = {
  // Dashboard
  VIEW_DASHBOARD: 'view_dashboard',

  // Shipments
  VIEW_SHIPMENTS: 'view_shipments',
  CREATE_SHIPMENTS: 'create_shipments',
  EDIT_SHIPMENTS: 'edit_shipments',
  DELETE_SHIPMENTS: 'delete_shipments',

  // Documents
  VIEW_DOCUMENTS: 'view_documents',
  UPLOAD_DOCUMENTS: 'upload_documents',
  DELETE_DOCUMENTS: 'delete_documents',

  // Finances
  VIEW_FINANCES: 'view_finances',
  MANAGE_FINANCES: 'manage_finances',

  // Reports
  VIEW_REPORTS: 'view_reports',
  EXPORT_REPORTS: 'export_reports',

  // Users
  VIEW_USERS: 'view_users',
  MANAGE_USERS: 'manage_users',

  // Settings
  VIEW_SETTINGS: 'view_settings',
  MANAGE_SETTINGS: 'manage_settings',
};

export const rolePermissions = {
  [ROLES.ADMIN]: Object.values(PERMISSIONS),

  [ROLES.MANAGER]: [
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.VIEW_SHIPMENTS,
    PERMISSIONS.CREATE_SHIPMENTS,
    PERMISSIONS.EDIT_SHIPMENTS,
    PERMISSIONS.VIEW_DOCUMENTS,
    PERMISSIONS.UPLOAD_DOCUMENTS,
    PERMISSIONS.VIEW_FINANCES,
    PERMISSIONS.MANAGE_FINANCES,
    PERMISSIONS.VIEW_REPORTS,
    PERMISSIONS.EXPORT_REPORTS,
    PERMISSIONS.VIEW_SETTINGS,
  ],

  [ROLES.OPERATOR]: [
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.VIEW_SHIPMENTS,
    PERMISSIONS.CREATE_SHIPMENTS,
    PERMISSIONS.EDIT_SHIPMENTS,
    PERMISSIONS.VIEW_DOCUMENTS,
    PERMISSIONS.UPLOAD_DOCUMENTS,
  ],

  [ROLES.VIEWER]: [
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.VIEW_SHIPMENTS,
    PERMISSIONS.VIEW_DOCUMENTS,
    PERMISSIONS.VIEW_REPORTS,
  ],

  [ROLES.GUEST]: [],
};

export const hasPermission = (userRole, permission) => {
  const permissions = rolePermissions[userRole] || [];
  return permissions.includes(permission);
};

export const hasAnyPermission = (userRole, permissionsList) => {
  return permissionsList.some(permission => hasPermission(userRole, permission));
};

export const hasAllPermissions = (userRole, permissionsList) => {
  return permissionsList.every(permission => hasPermission(userRole, permission));
};
