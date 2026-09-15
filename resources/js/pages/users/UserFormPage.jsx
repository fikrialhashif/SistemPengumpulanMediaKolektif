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
        if (selectedRole?.name === 'SUPERADMIN') {
          next.department_id = '';
        }
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
    <div className="pb-12">
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={() => navigate(-1)}
          className="group flex items-center text-sm font-medium text-slate-500 hover:text-emerald-600 transition-colors bg-slate-50 px-4 py-2 rounded-xl"
        >
          <svg className="w-4 h-4 mr-1 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
          Kembali
        </button>

        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center text-white text-2xl shadow-md">
            ✏️
          </div>
          <div>
            <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">{isEdit ? 'Edit User' : 'Tambah User Baru'}</h2>
            <p className="text-sm font-medium text-emerald-600/80">Perbarui informasi pengguna sistem</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-emerald-50 space-y-5">
          <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-3 mb-4">Detail Pengguna</h3>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">Nama Lengkap <span className="text-red-500">*</span></label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:bg-white transition-all outline-none text-slate-700 font-medium"
              placeholder="Masukkan nama lengkap"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">Email <span className="text-red-500">*</span></label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:bg-white transition-all outline-none text-slate-700 font-medium"
              placeholder="contoh@email.com"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">
              Password {isEdit && '(Kosongkan jika tidak ingin mengubah)'}
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required={!isEdit}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:bg-white transition-all outline-none text-slate-700 font-medium"
              placeholder={isEdit ? "Kosongkan untuk tidak mengubah" : "Masukkan password minimal 8 karakter"}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">Role <span className="text-red-500">*</span></label>
              <div className="relative">
                <select
                  name="role_id"
                  value={formData.role_id}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:bg-white transition-all outline-none text-slate-700 appearance-none font-medium cursor-pointer"
                >
                  <option value="" disabled>Pilih Role Pengguna</option>
                  {roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
              </div>
            </div>

            {(() => {
              const selectedRole = roles.find(r => String(r.id) === String(formData.role_id));
              const isSuperadmin = selectedRole?.name === 'SUPERADMIN';
              const isCorsec = selectedRole?.name === 'CORSEC';
              return (
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Departemen</label>
                  {isSuperadmin ? (
                    <input
                      type="text"
                      value="-"
                      disabled
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-xl bg-slate-50 text-slate-500"
                    />
                  ) : isCorsec ? (
                    <input
                      type="text"
                      value={departments.find(d => d.code === 'CORSEC' || d.name === 'CORSEC')?.name || 'CORSEC'}
                      disabled
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-xl bg-slate-50 text-slate-500"
                    />
                  ) : (
                    <div className="relative">
                      <select
                        name="department_id"
                        value={formData.department_id}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:bg-white transition-all outline-none text-slate-700 appearance-none font-medium cursor-pointer"
                      >
                        <option value="">Pilih Departemen</option>
                        {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">Status</label>
            <div className="relative">
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:bg-white transition-all outline-none text-slate-700 appearance-none font-medium cursor-pointer"
              >
                <option value="ACTIVE">ACTIVE - Aktif</option>
                <option value="INACTIVE">INACTIVE - Tidak Aktif</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end space-x-4 pt-4 border-t border-slate-200">
          <button
            type="button"
            onClick={() => navigate('/users')}
            className="px-6 py-2.5 text-sm font-bold text-slate-600 bg-white border-2 border-slate-200 rounded-xl hover:bg-slate-50 hover:text-slate-800 transition-all focus:outline-none focus:ring-4 focus:ring-slate-100"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={loading}
            className="group relative px-8 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl hover:from-emerald-600 hover:to-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-emerald-100 overflow-hidden"
          >
            {loading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                Menyimpan...
              </span>
            ) : (
              'Simpan User'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}