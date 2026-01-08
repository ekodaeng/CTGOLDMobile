import { useEffect, useState } from 'react';
import AdminLayout from '../components/AdminLayout';
import AdminDashboard from './admin/AdminDashboard';
import AdminMembers from './admin/AdminMembers';
import AdminTransactions from './admin/AdminTransactions';
import AdminContentPage from './admin/AdminContent';
import AdminSettings from './admin/AdminSettings';

function AdminPageContent() {
  const [currentPage, setCurrentPage] = useState(() => {
    const path = window.location.pathname;
    if (path.startsWith('/admin/members')) return 'members';
    if (path.startsWith('/admin/transactions')) return 'transactions';
    if (path.startsWith('/admin/content')) return 'content';
    if (path.startsWith('/admin/settings')) return 'settings';
    if (path === '/admin' || path === '/admin/dashboard') return 'dashboard';
    return 'dashboard';
  });

  useEffect(() => {
    document.title = 'CTGOLD Admin - Panel Administrator';

    let metaRobots = document.querySelector('meta[name="robots"]');
    if (!metaRobots) {
      metaRobots = document.createElement('meta');
      metaRobots.setAttribute('name', 'robots');
      document.head.appendChild(metaRobots);
    }
    metaRobots.setAttribute('content', 'noindex, nofollow');

    return () => {
      if (metaRobots) {
        metaRobots.setAttribute('content', 'index, follow');
      }
    };
  }, []);

  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      if (path.startsWith('/admin/members')) setCurrentPage('members');
      else if (path.startsWith('/admin/transactions')) setCurrentPage('transactions');
      else if (path.startsWith('/admin/content')) setCurrentPage('content');
      else if (path.startsWith('/admin/settings')) setCurrentPage('settings');
      else setCurrentPage('dashboard');
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleNavigate = (page: string) => {
    if (page === currentPage) return;

    let path = '/admin';
    switch (page) {
      case 'dashboard':
        path = '/admin';
        break;
      case 'members':
        path = '/admin/members';
        break;
      case 'transactions':
        path = '/admin/transactions';
        break;
      case 'content':
        path = '/admin/content';
        break;
      case 'settings':
        path = '/admin/settings';
        break;
    }

    window.history.pushState({}, '', path);
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <AdminDashboard />;
      case 'members':
        return <AdminMembers />;
      case 'transactions':
        return <AdminTransactions />;
      case 'content':
        return <AdminContentPage />;
      case 'settings':
        return <AdminSettings />;
      default:
        return <AdminDashboard />;
    }
  };

  return (
    <AdminLayout currentPage={currentPage} onNavigate={handleNavigate}>
      {renderPage()}
    </AdminLayout>
  );
}

export default function Admin() {
  return <AdminPageContent />;
}
