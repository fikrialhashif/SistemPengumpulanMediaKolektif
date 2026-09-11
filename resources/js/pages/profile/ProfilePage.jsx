import { useAuth } from '../../contexts/AuthContext';
import { formatDate } from '../../utils/format';

export default function ProfilePage() {
  const { user, hasRole } = useAuth();

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Profil Saya</h2>
        <p className="text-slate-500">Informasi akun Anda</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
        <div className="bg-blue-600 h-32"></div>
        <div className="px-6 pb-6">
          <div className="relative flex justify-center -mt-16 mb-4">
            <div className="w-32 h-32 rounded-full border-4 border-white bg-slate-200 flex items-center justify-center text-4xl font-bold text-slate-400">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
          </div>
          <div className="text-center space-y-1">
            <h3 className="text-xl font-bold text-slate-800">{user?.name}</h3>
            <p className="text-slate-500">{user?.email}</p>
            <div className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold uppercase mt-2">
              {user?.role?.name}
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-slate-100">
            <div>
              <p className="text-xs text-slate-500 uppercase font-semibold">Departemen</p>
              {hasRole('SUPERADMIN') ? (
                <p className="text-slate-800 font-medium">—</p>
              ) : (
                <p className="text-slate-800 font-medium">{user?.role?.name === 'SUPERADMIN' ? '-' : user?.department?.name || '-'}</p>
              )}
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase font-semibold">Kode Departemen</p>
              {hasRole('SUPERADMIN') ? (
                <p className="text-slate-800 font medium">—</p>
              ) : (
                <p className="text-slate-800 font-medium">{user?.role?.name === 'SUPERADMIN' ? '-' : user?.department?.code || '-'}</p>
              )}
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase font-semibold">Status Akun</p>
              <p className="text-slate-800 font-medium">{user?.status}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase font-semibold">Terdaftar Sejak</p>
              <p className="text-slate-800 font-medium">{formatDate(user?.created_at)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}