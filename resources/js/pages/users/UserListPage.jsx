import { useEffect, useState } from 'react';
import { userService, masterService } from '../../services';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useToast } from '../../contexts/ToastContext';

export default function UserListPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = () => {
    setLoading(true);
    userService.list().then((res) => {
      setUsers(res.data.data);
      setLoading(false);
    });
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

  const handleDelete = async (id) => {
    if (confirm('Yakin ingin menghapus user ini?')) {
      try {
        await userService.delete(id);
        toast.success('User berhasil dihapus');
        fetchUsers();
      } catch (e) {
        toast.error('Gagal menghapus user');
      }
    }
  };

  if (loading && users.length === 0) return <LoadingSpinner fullScreen />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">Manajemen User</h2>
        <a href="/users/create" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition">
          Tambah User
        </a>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Nama & Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Departemen</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">Aksi</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {users.map((u) => (
              <tr key={u.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-slate-900">{u.name}</div>
                  <div className="text-sm text-slate-500">{u.email}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                  {u.role?.name === 'SUPERADMIN' ? '-' : u.department?.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                  {u.role?.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${u.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {u.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                  <a href={`/users/${u.id}/edit`} className="text-blue-600 hover:text-blue-900">Edit</a>
                  <button onClick={() => handleToggleStatus(u)} className="text-slate-600 hover:text-slate-900">
                    {u.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                  </button>
                  <button onClick={() => handleDelete(u.id)} className="text-red-600 hover:text-red-900">Hapus</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}