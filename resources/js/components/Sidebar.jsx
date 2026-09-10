import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Sidebar() {
  const { user, hasRole, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const linkClass = (active) =>
    `block px-4 py-2 rounded-md text-sm font-medium transition-colors ${
      active ? 'bg-blue-700 text-white' : 'text-slate-200 hover:bg-blue-700 hover:text-white'
    }`;

  return (
    <aside className="w-64 bg-slate-900 text-white min-h-screen flex flex-col">
      <div className="p-4 border-b border-slate-700">
        <h2 className="text-lg font-bold">Media Kolektif</h2>
        <p className="text-xs text-slate-400 mt-1">{user?.role?.name} - {user?.department?.name}</p>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        <a href="/dashboard" className={linkClass(false)}>Dashboard</a>
        <a href="/media" className={linkClass(false)}>{hasRole('USER') ? 'Media Saya' : 'Semua Media'}</a>
        <a href="/media/upload" className={linkClass(false)}>Upload Media</a>
        {hasRole('SUPERADMIN') && (
          <>
            <a href="/trash" className={linkClass(false)}>Recycle Bin</a>
            <a href="/users" className={linkClass(false)}>User Management</a>
            <a href="/activity-logs" className={linkClass(false)}>Activity Log</a>
          </>
        )}
        <a href="/profile" className={linkClass(false)}>Profile</a>
      </nav>
      <div className="p-4 border-t border-slate-700">
        <button
          onClick={handleLogout}
          className="w-full text-left px-4 py-2 rounded-md text-sm font-medium text-slate-200 hover:bg-red-600 hover:text-white transition-colors"
        >
          Logout
        </button>
      </div>
    </aside>
  );
}