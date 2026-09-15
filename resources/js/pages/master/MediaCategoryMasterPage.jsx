import { useEffect, useState } from 'react';
import { masterService } from '../../services';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useToast } from '../../contexts/ToastContext';
import ConfirmModal from '../../components/ConfirmModal';

export default function MediaCategoryMasterPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modal Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' | 'edit'
  const [currentId, setCurrentId] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '', status: 'ACTIVE' });
  const [formErrors, setFormErrors] = useState({});
  const [saving, setSaving] = useState(false);

  // Delete Modal State
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const toast = useToast();

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await masterService.categories();
      setCategories(res.data.data);
    } catch (err) {
      toast.error('Gagal mengambil data kategori');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleOpenCreate = () => {
    setModalMode('create');
    setCurrentId(null);
    setFormData({ name: '', description: '', status: 'ACTIVE' });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cat) => {
    setModalMode('edit');
    setCurrentId(cat.id);
    setFormData({ name: cat.name, description: cat.description, status: cat.status });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFormErrors({});

    try {
      if (modalMode === 'create') {
        await masterService.storeCategory(formData);
        toast.success('Kategori berhasil ditambahkan');
      } else {
        await masterService.updateCategory(currentId, formData);
        toast.success('Kategori berhasil diperbarui');
      }
      setIsModalOpen(false);
      fetchCategories();
    } catch (err) {
      if (err.response?.status === 422 && err.response?.data?.errors) {
        setFormErrors(err.response.data.errors);
      } else {
        toast.error(err.response?.data?.message || 'Terjadi kesalahan saat menyimpan data');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await masterService.deleteCategory(confirmDeleteId);
      toast.success('Kategori berhasil dihapus');
      fetchCategories();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menghapus kategori');
    } finally {
      setDeleting(false);
      setConfirmDeleteId(null);
    }
  };

  const filteredCategories = categories.filter((c) =>
    c.name?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading && categories.length === 0) return <LoadingSpinner fullScreen />;

  return (
    <div className="space-y-6 pb-8">
      {/* Header Area */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-emerald-50">
        <div>
          <div className="flex items-center space-x-3 mb-1">
            <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center text-xl shadow-sm">
              📁
            </div>
            <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">Master Media Category</h2>
          </div>
          <p className="text-sm font-medium text-emerald-600/80 ml-13">Kelola kategori untuk pengelompokan media</p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="group flex items-center space-x-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-5 py-2.5 rounded-xl hover:from-emerald-600 hover:to-emerald-700 transition-all duration-300 shadow-md hover:shadow-lg hover:-translate-y-0.5"
        >
          <span className="text-xl group-hover:scale-110 transition-transform">➕</span>
          <span className="font-bold tracking-wide">Tambah Kategori</span>
        </button>
      </div>

      {/* Filter / Search Area */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-emerald-50 flex flex-wrap gap-4 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Cari nama kategori..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 pr-4 py-2.5 w-full border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all bg-slate-50 focus:bg-white"
          />
        </div>
      </div>

      {/* Table Content */}
      {loading ? (
        <div className="flex justify-center py-20">
          <LoadingSpinner />
        </div>
      ) : filteredCategories.length === 0 ? (
        <div className="text-center py-24 bg-white rounded-2xl border border-dashed border-emerald-200 flex flex-col items-center justify-center">
          <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center text-4xl mb-4">📁</div>
          <h3 className="text-xl font-bold text-slate-700 mb-2">Kategori Tidak Ditemukan</h3>
          <p className="text-slate-500 max-w-sm">Coba sesuaikan kata kunci pencarian Anda.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-emerald-100/60 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Nama Kategori</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Deskripsi</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">Aksi</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {filteredCategories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-emerald-50/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-slate-900">{cat.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-slate-500 max-w-[300px] truncate">
                        {cat.description || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                        cat.status === 'ACTIVE'
                          ? 'bg-green-50 text-green-700 border border-green-100'
                          : 'bg-red-50 text-red-700 border border-red-100'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${cat.status === 'ACTIVE' ? 'bg-green-500' : 'bg-red-500'}`}></span>
                        {cat.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                      <button
                        onClick={() => handleOpenEdit(cat)}
                        className="inline-flex items-center text-emerald-600 hover:text-emerald-700 transition-colors"
                      >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Edit
                      </button>
                      <button
                        onClick={() => setConfirmDeleteId(cat.id)}
                        className="inline-flex items-center text-red-600 hover:text-red-700 transition-colors"
                      >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
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

      {/* Form Modal (Create / Edit) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-emerald-950/60 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]"
            onClick={() => !saving && setIsModalOpen(false)}
          ></div>
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-emerald-100 animate-[slideUp_0.25s_ease-out]">
            <div className="p-6 md:p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center text-xl">
                    {modalMode === 'create' ? '➕' : '✏️'}
                  </div>
                  <h3 className="text-xl font-extrabold text-slate-800">
                    {modalMode === 'create' ? 'Tambah Kategori' : 'Edit Kategori'}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={saving}
                  className="text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">
                    Nama Kategori <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Dokumen Penting, Gambar, Video"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 transition-all ${
                      formErrors.name ? 'border-red-500 bg-red-50/50' : 'border-slate-200 bg-slate-50 focus:bg-white'
                    }`}
                  />
                  {formErrors.name && <p className="text-xs text-red-500 mt-1">{formErrors.name[0]}</p>}
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Deskripsi</label>
                  <textarea
                    rows={3}
                    placeholder="Deskripsi singkat tentang kategori ini (opsional)"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 transition-all bg-slate-50 focus:bg-white resize-none"
                  />
                  {formErrors.description && <p className="text-xs text-red-500 mt-1">{formErrors.description[0]}</p>}
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 bg-slate-50 focus:bg-white"
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="INACTIVE">INACTIVE</option>
                  </select>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    disabled={saving}
                    className="px-5 py-2.5 rounded-xl text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-all"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 transition-all shadow-md flex items-center"
                  >
                    {saving ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Menyimpan...
                      </>
                    ) : (
                      'Simpan'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      <ConfirmModal
        open={confirmDeleteId !== null}
        title="Hapus Kategori?"
        message="Apakah Anda yakin ingin menghapus kategori ini? Media yang terkait nantinya akan menampilkan tanda strip (-)."
        confirmText="Ya, Hapus"
        icon="📁"
        danger
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDeleteId(null)}
      />
    </div>
  );
}
