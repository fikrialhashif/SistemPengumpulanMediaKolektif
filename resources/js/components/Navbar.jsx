import { useAuth } from '../contexts/AuthContext';

export default function Navbar() {
  const { user } = useAuth();
  return (
    <header className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between">
      <h1 className="text-lg font-semibold text-slate-800">Sistem Pengumpulan Media Kolektif</h1>
      <div className="flex items-center space-x-3">
        <div className="text-right">
          <p className="text-sm font-medium text-slate-800">{user?.name}</p>
          <p className="text-xs text-slate-500">{user?.email}</p>
        </div>
        <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold">
          {user?.name?.charAt(0).toUpperCase()}
        </div>
      </div>
    </header>
  );
}