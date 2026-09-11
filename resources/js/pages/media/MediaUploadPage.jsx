import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { masterService, mediaService } from '../../services';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function MediaUploadPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const { user, hasRole } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [departments, setDepartments] = useState([]);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category_id: '',
    department_id: user?.department_id || '',
    event_date: new Date().toISOString().split('T')[0],
  });
  const [file, setFile] = useState(null);

  useEffect(() => {
    masterService.categories().then(res => setCategories(res.data.data));
    if (hasRole(['SUPERADMIN', 'CORSEC'])) {
      masterService.departments().then(res => setDepartments(res.data.data));
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setFile(e.target.files);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file || file.length === 0) return toast.error('Silakan pilih file');
    
    setLoading(true);
    const data = new FormData();
    Object.keys(formData).forEach(key => {
      if (formData[key]) data.append(key, formData[key]);
    });
    for (let i = 0; i < file.length; i++) {
      data.append('files[]', file[i]);
    }

    try {
      await mediaService.store(data);
      toast.success('Media berhasil diupload');
      navigate('/media');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal upload media');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-800">Upload Media Baru</h2>
        <p className="text-slate-500">Tambahkan dokumentasi kegiatan atau rapat</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Judul Media</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="Contoh: Rapat Koordinasi QHSE"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Deskripsi</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="3"
            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="Tambahkan keterangan singkat..."
          ></textarea>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Kategori</label>
            <select
              name="category_id"
              value={formData.category_id}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="">Pilih Kategori</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Tanggal Kegiatan</label>
            <input
              type="date"
              name="event_date"
              value={formData.event_date}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>

        {hasRole(['SUPERADMIN', 'CORSEC']) && (
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Departemen</label>
            <select
              name="department_id"
              value={formData.department_id}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="">Pilih Departemen</option>
              {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">File Media (Foto/Video/Doc) - Bisa pilih banyak file</label>
          <input
            type="file"
            onChange={handleFileChange}
            multiple
            required
            className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          <p className="mt-1 text-xs text-slate-400">JPG, PNG, WEBP, MP4, PDF, DOCX (Maks 100MB)</p>
        </div>

        <div className="pt-4 flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Mengunggah...' : 'Upload Media'}
          </button>
        </div>
      </form>
    </div>
  );
}