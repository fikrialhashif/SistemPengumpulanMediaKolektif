import { useAuth } from '../../contexts/AuthContext';
import { formatDate } from '../../utils/format';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import ConfirmModal from '../../components/ConfirmModal';

export default function ProfilePage() {
  const { user, hasRole, logout } = useAuth();
  const navigate = useNavigate();
  const [confirmLogout, setConfirmLogout] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    await logout();
    navigate('/login');
  };

  const roleColors = {
    SUPERADMIN: 'bg-purple-100 text-purple-800 border-purple-200',
    CORSEC: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    USER: 'bg-blue-100 text-blue-800 border-blue-200',
  };

  const roleLabel = user?.role?.name === 'SUPERADMIN' ? 'Administrator' : user?.role?.name === 'CORSEC' ? 'CORSEC' : 'USER';
  const roleColorClass = roleColors[user?.role?.name] || 'bg-slate-100 text-slate-800 border-slate-200';

  return (
    <div className="max-w-4xl mx-auto pb-12">
      {/* Header Section */}
      <div className="mb-8">
        <button onClick={() => navigate(-1)} className="text-sm font-medium text-slate-500 hover:text-emerald-600 mb-3 flex items-center transition-colors">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
          Kembali
        </button>
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center text-white text-2xl shadow-md">
            👤
          </div>
          <div>
            <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">Profil Saya</h2>
            <p className="text-sm font-medium text-emerald-600/80">Kelola informasi akun dan pengaturan pribadi</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-emerald-50 overflow-hidden">
        {/* Cover & Avatar */}
        <div className="relative h-48 bg-gradient-to-r from-emerald-500 via-teal-500 to-blue-600">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-600/20 via-teal-600/20 to-blue-600/20" />
          <div className="absolute -bottom-16 left-8">
            <div className="w-32 h-32 rounded-2xl border-4 border-white shadow-xl bg-gradient-to-br from-emerald-400 via-teal-400 to-blue-400 flex items-center justify-center text-5xl font-bold text-white overflow-hidden">
              {user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
            </div>
          </div>
        </div>

        {/* User Info */}
        <div className="pt-20 px-8 pb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
            <div>
              <h3 className="text-3xl font-extrabold text-slate-800 tracking-tight">{user?.name}</h3>
              <p className="text-slate-500 mt-1 font-medium">{user?.email}</p>
            </div>
            
            <div className="mt-4 sm:mt-0 flex items-center space-x-3">
              <span className={`px-4 py-1.5 rounded-full text-xs font-bold border ${roleColorClass}`}>
                {roleLabel}
              </span>
              <span className={`w-3 h-3 rounded-full ${user?.status === 'active' ? 'bg-green-400' : 'bg-red-400'} animate-pulse`}></span>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-slate-100">
            <div className="space-y-6">
              <DetailItem 
                icon="🏢" 
                label="Departemen" 
                value={hasRole('SUPERADMIN') ? '—' : (user?.department?.name || '-')} 
                iconColor="bg-blue-100 text-blue-600"
              />
              <DetailItem 
                icon="🏷️" 
                label="Kode Departemen" 
                value={hasRole('SUPERADMIN') ? '—' : (user?.department?.code || '-')} 
                iconColor="bg-purple-100 text-purple-600"
              />
            </div>
            <div className="space-y-6">
              <DetailItem 
                icon="📊" 
                label="Status Akun" 
                value={user?.status} 
                status={user?.status}
                iconColor="bg-emerald-100 text-emerald-600"
              />
              <DetailItem 
                icon="📅" 
                label="Terdaftar Sejak" 
                value={formatDate(user?.created_at)} 
                iconColor="bg-amber-100 text-amber-600"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-10 pt-8 border-t border-slate-100 flex justify-end">
            <button 
              onClick={() => setConfirmLogout(true)}
              className="px-6 py-2.5 text-sm font-medium text-red-600 bg-white border-2 border-red-100 rounded-xl hover:bg-red-50 transition-all focus:outline-none focus:ring-4 focus:ring-red-100"
            >
              Keluar Sistem
            </button>
          </div>
        </div>
      </div>

      <ConfirmModal
        open={confirmLogout}
        title="Keluar dari Akun?"
        message="Apakah Anda yakin ingin keluar dari akun ini? Anda akan dikembalikan ke halaman login."
        confirmText="Ya, Keluar"
        icon="🚪"
        danger={false}
        loading={loggingOut}
        onConfirm={handleLogout}
        onCancel={() => setConfirmLogout(false)}
      />
    </div>
  );
}

function DetailItem({ icon, label, value, iconColor = 'bg-slate-100 text-slate-600', status }) {
  return (
    <div className="flex items-start space-x-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl flex-shrink-0 ${iconColor} shadow-sm`}>
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{label}</p>
        {status && (
          <div className="flex items-center space-x-2">
            <span className={`inline-block w-2.5 h-2.5 rounded-full ${status === 'active' ? 'bg-green-400' : 'bg-red-400'}`}></span>
            <span className={`text-sm font-bold capitalize ${status === 'active' ? 'text-green-700' : 'text-red-700'}`}>{value}</span>
          </div>
        )}
        {!status && (
          <p className="text-sm font-semibold text-slate-800 break-words">{value || <span className="text-slate-300 italic">Tidak tersedia</span>}</p>
        )}
      </div>
    </div>
  );
}