import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { userService, masterService } from '../../services';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useToast } from '../../contexts/ToastContext';

export default function UserFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);
  const [departments, setDepartments] = useState([]);
  const [roles, setRoles] = useState([]);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    department_id: '',
    role_id: '',
    status: 'ACTIVE',
  });

  useEffect(() => {
    Promise.all([
      masterService.departments(),
      masterService.roles()
    ]).then(([dRes, rRes]) => {
      setDepartments(dRes.data.data);
      setRoles(rRes.data.data);
    });

    if (isEdit) {
      userService.get(id).then(res => {
        const u = res.data.data;
        setFormData({
          name: u.name,
          email: u.email,
          password: '',
          department_id: u.department?.id || '',
          role_id: u.role?.id || '',
          status: u.status,
        });
        setFetching(false);
      });
    }
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const next = { ...prev, [name]: value };
      if (name === 'role_id') {
        const selectedRole = roles.find(r => String(r.id) === String(value));
        // Jika SUPERADMIN dipilih, kosongkan departemen
        if (selectedRole?.name === 'SUPERADMIN') {
          next.department_id = '';
        }
        // Jika CORSEC dipilih, default ke departemen CORSEC (ID 10)
        if (selectedRole?.name === 'CORSEC') {
          const corsecDept = departments.find(d => d.code === 'CORSEC' || d.name === 'CORSEC');
          next.department_id = corsecDept?.id || '';
        }
      }
      return next;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isEdit) {
        await userService.update(id, formData);
        toast.success('User berhasil diperbarui');
      } else {
        await userService.store(formData);
        toast.success('User berhasil dibuat');
      }
      navigate('/users');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menyimpan user');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <LoadingSpinner fullScreen />;

  return (
    <div className="max-w-xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-800">{isEdit ? 'Edit User' : 'Tambah User Baru'}</h2>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Nama Lengkap</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-slate-300 rounded-md outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-slate-300 rounded-md outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Password {isEdit && '(Kosongkan jika tidak ingin mengubah)'}
          </label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required={!isEdit}
            className="w-full px-3 py-2 border border-slate-300 rounded-md outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
            <select
              name="role_id"
              value={formData.role_id}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-slate-300 rounded-md outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Pilih Role</option>
              {roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
            </select>
          </div>
          {(() => {
            const selectedRole = roles.find(r => String(r.id) === String(formData.role_id));
            const isSuperadmin = selectedRole?.name === 'SUPERADMIN';
            const isCorsec = selectedRole?.name === 'CORSEC';
            return (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Departemen</label>
                {isSuperadmin ? (
                  <input
                    type="text"
                    value="-"
                    disabled
                    className="w-full px-3 py-2 border border-slate-300 rounded-md bg-slate-50 text-slate-500"
                  />
                ) : isCorsec ? (
                  <input
                    type="text"
                    value={departments.find(d => d.code === 'CORSEC' || d.name === 'CORSEC')?.name || 'CORSEC'}
                    disabled
                    className="w-full px-3 py-2 border border-slate-300 rounded-md bg-slate-50 text-slate-500"
                  />
                ) : (
                  <select
                    name="department_id"
                    value={formData.department_id}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-slate-300 rounded-md outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Pilih Departemen</option>
                    {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                )}
              </div>
            );
          })()}
        </div>

        <div className="pt-4 flex justify-end space-x-3">
          <button type="button" onClick={() => navigate('/users')} className="px-4 py-2 text-sm text-slate-700 border border-slate-300 rounded-md hover:bg-slate-50">Batal</button>
          <button type="submit" disabled={loading} className="px-4 py-2 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50">
            {loading ? 'Menyimpan...' : 'Simpan User'}
          </button>
        </div>
      </form>
    </div>
  );
}