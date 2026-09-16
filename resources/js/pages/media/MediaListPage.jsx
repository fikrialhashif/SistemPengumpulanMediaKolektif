import { useEffect, useRef, useState } from 'react';
import { mediaService, masterService } from '../../services';
import LoadingSpinner from '../../components/LoadingSpinner';
import { formatDate, formatFileSize, formatDateTime } from '../../utils/format';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function MediaListPage() {
  const [medias, setMedias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [departments, setDepartments] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filters, setFilters] = useState({ department_id: '', category_id: '', search: '', approval_status: '' });
  const { user, hasRole } = useAuth();
  const navigate = useNavigate();

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
    <div className="space-y-6 pb-8">
      {/* Header Area */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-emerald-50">
        <div>
          <div className="flex items-center space-x-3 mb-1">
            <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center text-xl shadow-sm">
              📁
            </div>
            <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">Pustaka Media</h2>
          </div>
          <p className="text-sm font-medium text-emerald-600/80 ml-13">Kelola dan jelajahi semua media yang ada di sistem</p>
        </div>
        
        {!hasRole('SUPERADMIN') && (
          <button 
            onClick={() => navigate('/media/upload')}
            className="group flex items-center space-x-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-5 py-2.5 rounded-xl hover:from-emerald-600 hover:to-emerald-700 transition-all duration-300 shadow-md hover:shadow-lg hover:-translate-y-0.5"
          >
            <span className="text-xl group-hover:scale-110 transition-transform">📤</span>
            <span className="font-bold tracking-wide">Upload Baru</span>
          </button>
        )}
      </div>

      {/* Filter Area */}
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
            placeholder="Cari berdasarkan judul..."
            value={filters.search}
            onChange={handleFilterChange}
            className="pl-10 pr-4 py-2.5 w-full border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all bg-slate-50 focus:bg-white"
          />
        </div>

        {hasRole(['SUPERADMIN', 'CORSEC']) && (
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
        )}

        <div className="w-full sm:w-auto relative min-w-[200px]">
          <select
            name="category_id"
            value={filters.category_id}
            onChange={handleFilterChange}
            className="w-full appearance-none bg-slate-50 border border-slate-200 text-slate-700 py-2.5 px-4 pr-8 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all cursor-pointer"
          >
            <option value="">🗂️ Semua Kategori</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
          </div>
        </div>

        {/* Filter Approval Status untuk USER, MANAGER, SUPERADMIN (CORSEC selalu approved) */}
        {!hasRole('CORSEC') && (
          <div className="w-full sm:w-auto relative min-w-[190px]">
            <select
              name="approval_status"
              value={filters.approval_status}
              onChange={handleFilterChange}
              className="w-full appearance-none bg-slate-50 border border-slate-200 text-slate-700 py-2.5 px-4 pr-8 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all cursor-pointer"
            >
              <option value="">⚡ Semua Status Approval</option>
              <option value="APPROVED">✅ Approved</option>
              <option value="UNAPPROVED">❌ Unapproved</option>
              <option value="PENDING">⏳ Menunggu Review</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
              <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
            </div>
          </div>
        )}
      </div>

      {/* Content Area */}
      {loading ? (
        <div className="flex justify-center py-20">
          <LoadingSpinner />
        </div>
      ) : medias.length === 0 ? (
        <div className="text-center py-24 bg-white rounded-2xl border border-dashed border-emerald-200 flex flex-col items-center justify-center">
          <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center text-4xl mb-4">🔍</div>
          <h3 className="text-xl font-bold text-slate-700 mb-2">Media Tidak Ditemukan</h3>
          <p className="text-slate-500 max-w-sm">Coba ubah kata kunci pencarian atau sesuaikan filter kategori dan departemen.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {medias.map((media) => (
            <div 
              key={media.id} 
              className="bg-white rounded-2xl shadow-sm border border-emerald-100/60 overflow-hidden group hover:shadow-lg hover:border-emerald-300 transition-all duration-300 flex flex-col hover:-translate-y-1 cursor-pointer"
              onClick={() => navigate(`/media/${media.id}`)}
            >
              {/* Media Thumbnail Container */}
              <div className="relative aspect-video bg-emerald-50/50 overflow-hidden">
                {media.file_type.startsWith('image/') ? (
                  <img 
                    src={`/storage/${media.file_path}`} 
                    alt={media.title} 
                    onError={e => {
                      e.target.src = '/assets/fallback-image.svg';
                    }}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                  />
                ) : media.file_type.startsWith('video/') ? (
                  <VideoThumbnail filePath={`/storage/${media.file_path}`} fileType={media.file_type} />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-5xl">
                    {media.file_type === 'application/pdf' ? '📄' : '📁'}
                  </div>
                )}
                
                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4 pointer-events-none">
                  <span className="text-white font-medium text-sm flex items-center">
                    <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                    Lihat Detail
                  </span>
                </div>
                
                {/* Category Badge */}
                <div className="absolute top-3 right-3 bg-white/95 backdrop-blur px-2.5 py-1 rounded-full text-[10px] font-bold text-emerald-700 border border-emerald-100 shadow-sm pointer-events-none">
                  {media.category?.name || '-'}
                </div>

                {/* Approval Status Badge */}
                <div className="absolute top-3 left-3 pointer-events-none">
                  {media.approval_status === 'APPROVED' && (
                    <span className="bg-emerald-500/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-sm backdrop-blur flex items-center gap-1">
                      <span>✓</span> Approved
                    </span>
                  )}
                  {media.approval_status === 'UNAPPROVED' && (
                    <span className="bg-rose-500/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-sm backdrop-blur flex items-center gap-1">
                      <span>✕</span> Unapproved
                    </span>
                  )}
                  {(!media.approval_status || media.approval_status === 'PENDING') && (
                    <span className="bg-amber-500/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-sm backdrop-blur flex items-center gap-1">
                      <span>⏳</span> Pending
                    </span>
                  )}
                </div>
              </div>

              {/* Media Info */}
              <div className="p-5 flex flex-col flex-1">
                <h3 className="font-bold text-slate-800 line-clamp-1 mb-3 group-hover:text-emerald-600 transition-colors" title={media.title}>
                  {media.title}
                </h3>
                
                <div className="flex-1"></div> {/* Spacer */}
                
                <div className="space-y-3">
                  <div className="flex items-center text-xs text-slate-500 font-medium">
                    <svg className="w-4 h-4 mr-1.5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    {formatDate(media.event_date)}
                  </div>
                  
                  <div className="pt-3 border-t border-slate-100 flex justify-between items-center">
                    <div className="flex items-center bg-slate-50 px-2 py-1 rounded text-xs font-semibold text-slate-600 truncate max-w-[60%]" title={media.department?.name || '-'}>
                      <span className="w-2 h-2 rounded-full bg-yellow-400 mr-1.5"></span>
                      {media.department?.code || '-'}
                    </div>
                    <span className="text-xs font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded">
                      {formatFileSize(media.file_size)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function VideoThumbnail({ filePath, fileType }) {
  const [hovering, setHovering] = useState(false);

  return (
    <div
      className="relative w-full h-full overflow-hidden"
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
    >
      {hovering ? (
        <video
          className="w-full h-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          onError={e => { e.target.onerror = null; e.target.src = '/assets/fallback-video.svg'; }}
        >
          <source src={filePath} type={fileType} />
        </video>
      ) : (
        <div className="w-full h-full flex items-center justify-center text-5xl">🎬</div>
      )}
    </div>
  );
}