import { useEffect, useState } from 'react';
import { userService, masterService } from '../../services';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useToast } from '../../contexts/ToastContext';
import { useAuth } from '../../contexts/AuthContext';
import ConfirmModal from '../../components/ConfirmModal';

export default function UserListPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [departments, setDepartments] = useState([]);
  const [roles, setRoles] = useState([]);
  const [filters, setFilters] = useState({ department_id: '', role_id: '', search: '' });
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const { hasRole } = useAuth();
  const toast = useToast();

  useEffect(() => {
    Promise.all([
      masterService.departments(),
      masterService.roles()
    ]).then(([dRes, rRes]) => {
      setDepartments(dRes.data.data);
      setRoles(rRes.data.data);
    });
    fetchUsers();
  }, []);

  const fetchUsers = (f = {}) => {
    setLoading(true);
    const params = {};
    Object.keys(f).forEach((key) => {
      if (f[key] !== '' && f[key] !== null && f[key] !== undefined) {
        params[key] = f[key];
      }
    });
    if (!hasRole(['SUPERADMIN', 'CORSEC'])) {
      delete params.department_id;
    }
    userService.list(params).then((res) => {
      setUsers(res.data.data);
      setLoading(false);
    }).catch(() => {
      setLoading(false);
    });
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    const newFilters = { ...filters, [name]: value };
    setFilters(newFilters);
    fetchUsers(newFilters);
  };

  const handleToggleStatus = async (user) => {
    try {
      if (user.status === 'ACTIVE') {
        await userService.deactivate(user.id);
        toast.success(`User ${user.name} dinonaktifkan`);
      } else {
        await userService.activate(user.id);
        toast.success(`User ${user.name} diaktifkan`);
      }
      fetchUsers();
    } catch (e) {
      toast.error('Gagal mengubah status user');
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await userService.delete(confirmDeleteId);
      toast.success('User berhasil dihapus');
      fetchUsers();
    } catch (e) {
      toast.error('Gagal menghapus user');
    } finally {
      setDeleting(false);
      setConfirmDeleteId(null);
    }
  };

  if (loading && users.length === 0) return <LoadingSpinner fullScreen />;

  return (
    <div className="space-y-6 pb-8">
      {/* Header Area */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-emerald-50">
        <div>
          <div className="flex items-center space-x-3 mb-1">
            <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center text-xl shadow-sm">
              👥
            </div>
            <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">Manajemen User</h2>
          </div>
          <p className="text-sm font-medium text-emerald-600/80 ml-13">Kelola semua user dan akses sistem</p>
        </div>
        
        <a 
          href="/users/create" 
          className="group flex items-center space-x-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-5 py-2.5 rounded-xl hover:from-emerald-600 hover:to-emerald-700 transition-all duration-300 shadow-md hover:shadow-lg hover:-translate-y-0.5"
        >
          <span className="text-xl group-hover:scale-110 transition-transform">➕</span>
          <span className="font-bold tracking-wide">Tambah User</span>
        </a>
      </div>

      {/* Filter Area */}
      {hasRole(['SUPERADMIN', 'CORSEC']) && (
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-emerald-50 flex flex-wrap gap-4 items-center">
          <div className="flex-1 min-w-[200px] relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              name="search"
              placeholder="Cari berdasarkan nama atau email..."
              value={filters.search}
              onChange={handleFilterChange}
              className="pl-10 pr-4 py-2.5 w-full border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all bg-slate-50 focus:bg-white"
            />
          </div>

          <div className="w-full sm:w-auto relative min-w-[200px]">
            <select
              name="department_id"
              value={filters.department_id}
              onChange={handleFilterChange}
              className="w-full appearance-none bg-slate-50 border border-slate-200 text-slate-700 py-2.5 px-4 pr-8 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all cursor-pointer"
            >
              <option value="">🏢 Semua Departemen</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
              <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
            </div>
          </div>

          <div className="w-full sm:w-auto relative min-w-[200px]">
            <select
              name="role_id"
              value={filters.role_id}
              onChange={handleFilterChange}
              className="w-full appearance-none bg-slate-50 border border-slate-200 text-slate-700 py-2.5 px-4 pr-8 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all cursor-pointer"
            >
              <option value="">🎭 Semua Role</option>
              {roles.map((r) => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
              <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
            </div>
          </div>
        </div>
      )}

      {/* Content Area */}
      {loading ? (
        <div className="flex justify-center py-20">
          <LoadingSpinner />
        </div>
      ) : users.length === 0 ? (
        <div className="text-center py-24 bg-white rounded-2xl border border-dashed border-emerald-200 flex flex-col items-center justify-center">
          <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center text-4xl mb-4">🔍</div>
          <h3 className="text-xl font-bold text-slate-700 mb-2">User Tidak Ditemukan</h3>
          <p className="text-slate-500 max-w-sm">Coba ubah kata kunci pencarian atau sesuaikan filter departemen dan role.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-emerald-100/60 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Nama & Email</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Departemen</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">Aksi</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-emerald-50/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-slate-900">{u.name}</div>
                      <div className="text-sm text-slate-500">{u.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-2 h-2 rounded-full bg-yellow-400 mr-2"></div>
                        <span className="text-sm text-slate-600 font-medium">
                          {u.role?.name === 'SUPERADMIN' ? '-' : u.department?.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100">
                        {u.role?.name}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${u.status === 'ACTIVE' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${u.status === 'ACTIVE' ? 'bg-green-500' : 'bg-red-500'}`}></span>
                        {u.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                      <a 
                        href={`/users/${u.id}/edit`} 
                        className="inline-flex items-center text-emerald-600 hover:text-emerald-700 transition-colors"
                      >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                        Edit
                      </a>
                      <button 
                        onClick={() => handleToggleStatus(u)} 
                        className="inline-flex items-center text-slate-600 hover:text-slate-700 transition-colors"
                      >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                        {u.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                      </button>
                      <button 
                        onClick={() => setConfirmDeleteId(u.id)} 
                        className="inline-flex items-center text-red-600 hover:text-red-700 transition-colors"
                      >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        Hapus
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <ConfirmModal
        open={confirmDeleteId !== null}
        title="Hapus User?"
        message="Apakah Anda yakin ingin menghapus user ini? Tindakan ini tidak dapat dibatalkan."
        confirmText="Ya, Hapus"
        icon="👤"
        danger
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDeleteId(null)}
      />
    </div>
  );
}