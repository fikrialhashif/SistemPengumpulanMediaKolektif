import { useEffect, useState } from 'react';
import { mediaService, masterService } from '../../services';
import LoadingSpinner from '../../components/LoadingSpinner';
import { formatDate, formatFileSize } from '../../utils/format';
import { useAuth } from '../../contexts/AuthContext';

export default function MediaListPage() {
  const [medias, setMedias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [departments, setDepartments] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filters, setFilters] = useState({ department_id: '', category_id: '', search: '' });
  const { hasRole } = useAuth();

  useEffect(() => {
    Promise.all([
      masterService.departments(),
      masterService.categories()
    ]).then(([dRes, cRes]) => {
      setDepartments(dRes.data.data);
      setCategories(cRes.data.data);
    });
    fetchMedias();
  }, []);

  const fetchMedias = (f = filters) => {
    setLoading(true);
    mediaService.list(f).then((res) => {
      setMedias(res.data.data);
      setLoading(false);
    });
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    const newFilters = { ...filters, [name]: value };
    setFilters(newFilters);
    fetchMedias(newFilters);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">Media</h2>
        <a href="/media/upload" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition">
          Upload Baru
        </a>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 flex flex-wrap gap-4">
        <input
          type="text"
          name="search"
          placeholder="Cari media..."
          value={filters.search}
          onChange={handleFilterChange}
          className="border border-slate-300 rounded px-3 py-1.5 text-sm w-full md:w-64"
        />
        {hasRole(['SUPERADMIN', 'CORSEC']) && (
          <select
            name="department_id"
            value={filters.department_id}
            onChange={handleFilterChange}
            className="border border-slate-300 rounded px-3 py-1.5 text-sm"
          >
            <option value="">Semua Departemen</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        )}
        <select
          name="category_id"
          value={filters.category_id}
          onChange={handleFilterChange}
          className="border border-slate-300 rounded px-3 py-1.5 text-sm"
        >
          <option value="">Semua Kategori</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : medias.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-lg border border-slate-200">
          <p className="text-slate-500">Tidak ada media ditemukan</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {medias.map((media) => (
            <div key={media.id} className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden group">
              <div className="aspect-video bg-slate-100 flex items-center justify-center relative overflow-hidden">
                {media.file_type.startsWith('image/') ? (
                  <img src={`/storage/${media.file_path}`} alt={media.title} className="object-cover w-full h-full" />
                ) : (
                  <div className="text-4xl">
                    {media.file_type.startsWith('video/') ? '🎬' : media.file_type === 'application/pdf' ? '📄' : '📁'}
                  </div>
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center space-x-2">
                  <a href={`/media/${media.id}`} className="p-2 bg-white rounded-full text-slate-800 hover:text-blue-600 transition">
                    More
                  </a>
                </div>
              </div>
              <div className="p-4 space-y-2">
                <h3 className="font-semibold text-slate-800 line-clamp-1" title={media.title}>{media.title}</h3>
                <div className="flex justify-between text-xs text-slate-500">
                  <span>{media.category?.name}</span>
                  <span>{formatDate(media.event_date)}</span>
                </div>
                <div className="pt-2 border-t border-slate-50 flex justify-between items-center text-xs text-slate-500">
                   <span className="truncate w-24" title={media.department?.name}>{media.department?.code}</span>
                   <span>{formatFileSize(media.file_size)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}