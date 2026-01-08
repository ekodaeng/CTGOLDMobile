import { Outlet } from 'react-router-dom';

export default function MemberLayout() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800">
      <div className="max-w-md mx-auto bg-gray-900 min-h-screen shadow-2xl">
        <Outlet />
      </div>
    </div>
  );
}
