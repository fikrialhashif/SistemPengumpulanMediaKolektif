import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { mediaService, masterService } from '../../services';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function MediaEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { hasRole } = useAuth();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [categories, setCategories] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [formData, setFormData] = useState({
    title: '', description: '', category_id: '', department_id: '', event_date: ''
  });
  const [files, setFiles] = useState(null);

  useEffect(() => {
    Promise.all([
      mediaService.get(id),
      masterService.categories(),
      masterService.departments()
    ]).then(([mRes, cRes, dRes]) => {
      const m = mRes.data.data;
      setFormData({
        title: m.title,
        description: m.description || '',
        category_id: m.category?.id || '',
        department_id: m.department?.id || '',
        event_date: m.event_date ? m.event_date.split('T')[0] : ''
      });
      setCategories(cRes.data.data.filter(c => c.status === 'ACTIVE' || c.id === m.category?.id));
      setDepartments(dRes.data.data.filter(d => d.status === 'ACTIVE' || d.id === m.department?.id));
      setFetching(false);
    }).catch(() => {
      toast.error('Gagal mengambil data media');
      navigate('/media');
    });
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setFiles(e.target.files);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const data = new FormData();
    Object.keys(formData).forEach(key => {
      if (formData[key]) data.append(key, formData[key]);
    });
    if (files && files.length > 0) {
      for (let i = 0; i < files.length; i++) {
        data.append('files[]', files[i]);
      }
    }

    try {
      await mediaService.update(id, data);
      toast.success('Media berhasil diperbarui');
      navigate(`/media/${id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal memperbarui media');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <LoadingSpinner fullScreen />;

  const formatSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

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
            <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">Edit Media</h2>
            <p className="text-sm font-medium text-emerald-600/80">Perbarui informasi atau file dokumentasi</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Kolom Kiri: Form Data */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-emerald-50 space-y-5">
              <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-3 mb-4">Informasi Utama</h3>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Judul Media <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:bg-white transition-all outline-none text-slate-700 font-medium"
                  placeholder="Contoh: Dokumentasi Rapat Koordinasi QHSE Q3"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Deskripsi Lengkap</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="4"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:bg-white transition-all outline-none text-slate-700"
                  placeholder="Ceritakan detail kegiatan, peserta, atau catatan penting lainnya..."
                ></textarea>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Kategori <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <select
                      name="category_id"
                      value={formData.category_id}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:bg-white transition-all outline-none text-slate-700 appearance-none font-medium cursor-pointer"
                    >
                      <option value="" disabled>Pilih Kategori Kegiatan</option>
                      {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Tanggal Kegiatan <span className="text-red-500">*</span></label>
                  <input
                    type="date"
                    name="event_date"
                    value={formData.event_date}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:bg-white transition-all outline-none text-slate-700 font-medium cursor-pointer"
                  />
                </div>
              </div>

              {hasRole(['SUPERADMIN', 'CORSEC']) && (
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Departemen Terkait <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <select
                      name="department_id"
                      value={formData.department_id}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:bg-white transition-all outline-none text-slate-700 appearance-none font-medium cursor-pointer"
                    >
                      <option value="" disabled>Pilih Departemen Penanggung Jawab</option>
                      {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Kolom Kanan: File Upload */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-emerald-50 h-full flex flex-col">
              <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-3 mb-4">Ganti File</h3>

              <div className="mb-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
                <p className="text-xs font-medium text-slate-500">
                  Biarkan kosong jika tidak ingin mengubah file lama.
                </p>
              </div>

              <div
                className={`flex-1 relative border-2 border-dashed rounded-xl transition-all duration-300 flex flex-col items-center justify-center p-6 text-center ${
                  files ? 'border-emerald-500 bg-emerald-50' : 'border-slate-300 bg-slate-50 hover:bg-slate-100'
                }`}
              >
                <input
                  type="file"
                  onChange={handleFileChange}
                  multiple
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  title="Klik atau seret file ke sini"
                />
                <div className="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center text-emerald-500 mb-4 pointer-events-none">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
                </div>
                <p className="font-bold text-slate-700 text-sm mb-1 pointer-events-none">Klik atau Seret file ke area ini</p>
                <p className="text-xs text-slate-500 pointer-events-none px-4">Mendukung file JPG, PNG, WEBP, MP4, PDF, DOCX (Maks 100MB per file)</p>
              </div>

              {/* Daftar File Terpilih */}
              {files && files.length > 0 && (
                <div className="mt-4 space-y-2 max-h-48 overflow-y-auto custom-scrollbar pr-1">
                  <p className="text-xs font-bold text-emerald-600 uppercase">{files.length} File Terpilih</p>
                  {Array.from(files).map((file, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                      <div className="flex items-center flex-1 min-w-0 pr-2">
                        <div className="w-8 h-8 rounded bg-white shadow-sm flex items-center justify-center text-xs mr-3 flex-shrink-0">
                          {file.type.startsWith('image/') ? '🖼️' : file.type.startsWith('video/') ? '🎬' : '📄'}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-slate-700 truncate">{file.name}</p>
                          <p className="text-[10px] font-medium text-slate-400">{formatSize(file.size)}</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setFiles(null)}
                        className="text-slate-400 hover:text-red-500 p-1.5 hover:bg-red-50 rounded-md transition-colors"
                        title="Hapus file"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end space-x-4 pt-4 border-t border-slate-200">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-6 py-2.5 text-sm font-bold text-slate-600 bg-white border-2 border-slate-200 rounded-xl hover:bg-slate-50 hover:text-slate-800 transition-all focus:outline-none focus:ring-4 focus:ring-slate-100"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={loading}
            className="group relative px-8 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl hover:from-emerald-600 hover:to-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-emerald-100 overflow-hidden flex items-center"
          >
            {loading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                Menyimpan...
              </span>
            ) : (
              <span className="flex items-center">
                <span className="mr-2 text-lg group-hover:-translate-y-0.5 transition-transform">💾</span>
                Simpan Perubahan
              </span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}