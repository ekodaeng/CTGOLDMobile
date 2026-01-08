import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { isMemberLoggedIn } from '../lib/session';
import { isAdminSessionValid, getAdminSession } from '../lib/admin-session';

export function RequireAdminAuth() {
  const location = useLocation();

  if (!isAdminSessionValid()) {
    return <Navigate to="/admin/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}

export function RequireMemberAuth() {
  const location = useLocation();

  if (!isMemberLoggedIn()) {
    return <Navigate to="/member/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}

export function RequireSuperAdmin() {
  const location = useLocation();

  if (!isAdminSessionValid()) {
    return <Navigate to="/admin/login" replace state={{ from: location }} />;
  }

  const session = getAdminSession();
  if (!session || session.role !== 'SUPER_ADMIN') {
    return <Navigate to="/admin/dashboard" replace state={{ from: location }} />;
  }

  return <Outlet />;
}
