import { useState } from 'react';
import AdminDashboardLayout from '../components/AdminDashboardLayout';
import AdminDashboardOverview from './admin/AdminDashboardOverview';
import AdminMembersPage from './admin/AdminMembersPage';
import AdminAdminsPage from './admin/AdminAdminsPage';

type AdminView = 'dashboard' | 'members' | 'admins' | 'settings';

export default function AdminDashboard() {
  const [currentView, setCurrentView] = useState<AdminView>('members');

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <AdminDashboardOverview />;
      case 'members':
        return <AdminMembersPage />;
      case 'admins':
        return <AdminAdminsPage />;
      case 'settings':
        return (
          <div className="text-center py-12">
            <p className="text-gray-400">Settings page coming soon...</p>
          </div>
        );
      default:
        return <AdminDashboardOverview />;
    }
  };

  return (
    <AdminDashboardLayout currentView={currentView} onNavigate={setCurrentView}>
      {renderView()}
    </AdminDashboardLayout>
  );
}
