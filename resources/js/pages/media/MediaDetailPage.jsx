import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { mediaService } from '../../services';
import LoadingSpinner from '../../components/LoadingSpinner';
import { formatDate, formatDateTime, formatFileSize } from '../../utils/format';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import ConfirmModal from '../../components/ConfirmModal';

export default function MediaDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { user, hasRole } = useAuth();
  const [media, setMedia] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const [viewMode, setViewMode] = useState('slide');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    mediaService.get(id)
      .then((res) => {
        setMedia(res.data.data);
        setLoading(false);
      })
      .catch(() => {
        toast.error('Gagal mengambil data media');
        navigate('/media');
      });
  }, [id]);

  const handleDownload = async () => {
    try {
      const res = await mediaService.download(id);
      const contentDisposition = res.headers['content-disposition'];
      let fileName = media.file_name;
      if (contentDisposition) {
        const match = contentDisposition.match(/filename="?([^";\n]+)"?/);
        if (match) fileName = match[1];
      }
      const contentType = res.headers['content-type'] || 'application/octet-stream';
      const blob = new Blob([res.data], { type: contentType });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      toast.error('Gagal mendownload media');
    }
  };

  const handleDownloadFile = async (file) => {
    if (file.id === 0) {
      return handleDownload();
    }
    try {
      const res = await mediaService.downloadFile(id, file.id);
      const contentDisposition = res.headers['content-disposition'];
      let fileName = file.file_name;
      if (contentDisposition) {
        const match = contentDisposition.match(/filename="?([^";\n]+)"?/);
        if (match) fileName = match[1];
      }
      const blob = new Blob([res.data], { type: res.headers['content-type'] || 'application/octet-stream' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      toast.error('Gagal mendownload file');
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await mediaService.delete(id);
      toast.success('Media berhasil dihapus');
      navigate('/media');
    } catch (e) {
      toast.error('Gagal menghapus media');
    } finally {
      setDeleting(false);
      setConfirmDelete(false);
    }
  };

  if (loading) return <div className="flex justify-center py-20"><LoadingSpinner /></div>;

  const files = media.files && media.files.length > 0
    ? media.files
    : [{ id: 0, file_path: media.file_path, file_name: media.file_name, file_type: media.file_type, file_size: media.file_size }];

  const activeFile = files[activeIndex];

  const renderPreview = (file, className = '') => {
    if (file.file_type.startsWith('image/')) {
      return <img src={`/storage/${file.file_path}`} alt={file.file_name} onError={e => { e.target.src = '/assets/fallback-image.svg'; }} className={`w-full max-h-[500px] object-contain rounded-xl shadow-inner bg-slate-900 ${className}`} />;
    }
    if (file.file_type.startsWith('video/')) {
      return <video src={`/storage/${file.file_path}`} controls onError={e => { e.target.src = '/assets/fallback-video.svg'; }} className={`w-full max-h-[500px] rounded-xl shadow-inner bg-slate-900 ${className}`} />;
    }
    return (
      <div className={`aspect-video bg-gradient-to-br from-emerald-50 to-teal-50 flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-emerald-200 ${className}`}>
        <span className="text-7xl mb-4 transform hover:scale-110 transition-transform duration-300">
          {file.file_type === 'application/pdf' ? '📄' : '📁'}
        </span>
        <p className="text-emerald-800 font-medium text-center px-4 line-clamp-2">{file.file_name}</p>
        <button onClick={() => handleDownloadFile(file)} className="mt-4 px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 shadow-sm transition-colors">
          Download File
        </button>
      </div>
    );
  };

  const renderThumbnail = (file) => {
    if (file.file_type.startsWith('image/')) {
      return <img src={`/storage/${file.file_path}`} alt={file.file_name} onError={e => { e.target.src = '/assets/fallback-image.svg'; }} className="w-full h-full object-cover" />;
    }
    if (file.file_type.startsWith('video/')) {
      return (
        <div className="w-full h-full bg-slate-800 flex items-center justify-center">
          <span className="text-white text-xl">▶</span>
        </div>
      );
    }
    return (
      <div className="w-full h-full bg-emerald-50 flex items-center justify-center">
        <span className="text-2xl">{file.file_type === 'application/pdf' ? '📄' : '📁'}</span>
      </div>
    );
  };

  return (
    <>
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* Header Info & Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-emerald-50">
        <button 
          onClick={() => navigate(-1)} 
          className="group flex items-center text-sm font-medium text-slate-500 hover:text-emerald-600 transition-colors bg-slate-50 px-4 py-2 rounded-xl"
        >
          <svg className="w-5 h-5 mr-2 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
          Kembali
        </button>
        
        <div className="flex flex-wrap gap-3">
          { (media.uploaded_by === user.id || hasRole(['SUPERADMIN', 'CORSEC'])) && (
            <button 
              onClick={() => navigate(`/media/${id}/edit`)} 
              className="flex items-center bg-white border-2 border-emerald-100 text-emerald-700 px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-emerald-50 hover:border-emerald-200 transition-all shadow-sm"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
              Edit Media
            </button>
          )}
          <button 
            onClick={handleDownload} 
            className="flex items-center bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:from-emerald-600 hover:to-teal-700 transition-all shadow-md hover:shadow-lg"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
            Download {files.length > 1 ? 'Semua' : ''}
          </button>
          { (media.uploaded_by === user.id || hasRole(['SUPERADMIN', 'CORSEC'])) && (
            <button 
              onClick={() => setConfirmDelete(true)} 
              className="flex items-center bg-white border-2 border-red-100 text-red-600 px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-red-50 hover:border-red-200 transition-all shadow-sm"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
              Hapus
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-emerald-50">
            {files.length > 1 && (
              <div className="flex flex-wrap items-center justify-between mb-4 gap-2">
                <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold tracking-wider">
                  {files.length} FILE TERLAMPIR
                </span>
                <div className="flex bg-slate-100 p-1 rounded-lg">
                  <button
                    onClick={() => setViewMode('slide')}
                    className={`flex items-center px-4 py-1.5 text-xs font-bold rounded-md transition-all ${viewMode === 'slide' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg>
                    Preview
                  </button>
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`flex items-center px-4 py-1.5 text-xs font-bold rounded-md transition-all ${viewMode === 'grid' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg>
                    Grid View
                  </button>
                </div>
              </div>
            )}

            {viewMode === 'slide' ? (
              <div className="space-y-4">
                <div className="bg-slate-50 p-2 rounded-xl border border-slate-200 relative group overflow-hidden">
                  {renderPreview(activeFile)}
                  {files.length > 1 && (
                    <>
                      <button
                        onClick={() => setActiveIndex((prev) => (prev - 1 + files.length) % files.length)}
                        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 text-slate-800 w-10 h-10 rounded-full flex items-center justify-center hover:bg-emerald-500 hover:text-white shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 transform -translate-x-4 group-hover:translate-x-0"
                      >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
                      </button>
                      <button
                        onClick={() => setActiveIndex((prev) => (prev + 1) % files.length)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 text-slate-800 w-10 h-10 rounded-full flex items-center justify-center hover:bg-emerald-500 hover:text-white shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-4 group-hover:translate-x-0"
                      >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                      </button>
                    </>
                  )}
                </div>
                
                {files.length > 1 && (
                  <div className="flex space-x-3 overflow-x-auto py-2 custom-scrollbar">
                    {files.map((file, idx) => (
                      <button
                        key={file.id}
                        onClick={() => setActiveIndex(idx)}
                        className={`w-20 h-20 flex-shrink-0 rounded-lg border-2 overflow-hidden transition-all duration-200 ${idx === activeIndex ? 'border-emerald-500 shadow-md ring-2 ring-emerald-200 ring-offset-1 scale-105' : 'border-transparent opacity-70 hover:opacity-100 hover:border-emerald-200'}`}
                      >
                        {renderThumbnail(file)}
                      </button>
                    ))}
                  </div>
                )}
                
                <div className="flex items-center justify-center text-sm font-medium text-slate-600 bg-slate-50 py-2 px-4 rounded-lg">
                  <svg className="w-4 h-4 mr-2 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                  {activeFile.file_name} <span className="mx-2 text-slate-300">|</span> <span className="text-slate-400">{formatFileSize(activeFile.file_size)}</span>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {files.map((file, idx) => (
                  <div 
                    key={file.id} 
                    className="bg-white p-3 rounded-xl shadow-sm border border-emerald-50 hover:shadow-md hover:border-emerald-200 transition-all cursor-pointer group"
                    onClick={() => { setActiveIndex(idx); setViewMode('slide'); }}
                  >
                    <div className="aspect-square overflow-hidden rounded-lg mb-3 relative">
                      {renderThumbnail(file)}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="bg-white text-emerald-700 text-xs font-bold px-3 py-1.5 rounded-full shadow-sm">Lihat Preview</span>
                      </div>
                    </div>
                    <p className="text-sm font-semibold text-slate-700 truncate group-hover:text-emerald-600 transition-colors" title={file.file_name}>{file.file_name}</p>
                    <p className="text-xs text-slate-400 mt-1 font-medium">{formatFileSize(file.file_size)}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-sm border border-emerald-50">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-1.5 h-6 bg-emerald-500 rounded-full"></div>
              <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">{media.title}</h1>
            </div>
            <div className="prose prose-emerald max-w-none">
              <p className="text-slate-600 whitespace-pre-wrap leading-relaxed">
                {media.description || <span className="italic text-slate-400">Tidak ada deskripsi yang ditambahkan untuk media ini.</span>}
              </p>
            </div>
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-emerald-50 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-bl-full -z-10"></div>
            <h3 className="flex items-center font-bold text-lg text-slate-800 mb-6">
              <span className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center text-emerald-600 mr-3">ℹ️</span>
              Detail Informasi
            </h3>
            
            <div className="space-y-5">
              <DetailRow icon="🏢" label="Departemen" value={media.department?.name || '-'} highlight />
              <DetailRow icon="🗂️" label="Kategori" value={media.category?.name || '-'} highlight />
              <DetailRow icon="📅" label="Tanggal Kegiatan" value={formatDate(media.event_date)} />
              <DetailRow icon="👤" label="Diunggah Oleh" value={media.uploader?.name} />
              <DetailRow icon="🕒" label="Waktu Unggah" value={formatDateTime(media.created_at)} />
              <DetailRow icon="📎" label="Jumlah Lampiran" value={`${files.length} File`} />
              <DetailRow icon="💾" label="Total Kapasitas" value={formatFileSize(media.file_size)} />
            </div>
          </div>

          {files.length > 1 && (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-emerald-50">
              <h3 className="flex items-center font-bold text-lg text-slate-800 mb-5">
                <span className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600 mr-3">📑</span>
                Daftar Lampiran
              </h3>
              <ul className="space-y-3">
                {files.map((file, idx) => (
                  <li
                    key={file.id}
                    className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                      idx === activeIndex 
                        ? 'bg-emerald-50 border-emerald-200 shadow-sm' 
                        : 'bg-white border-slate-100 hover:border-emerald-200 hover:bg-slate-50'
                    }`}
                  >
                    <button
                      onClick={() => { setActiveIndex(idx); setViewMode('slide'); }}
                      className="flex items-center flex-1 min-w-0 text-left group"
                    >
                      <span className={`w-8 h-8 rounded-lg flex items-center justify-center mr-3 text-sm ${idx === activeIndex ? 'bg-emerald-200 text-emerald-800' : 'bg-slate-100 text-slate-500 group-hover:bg-emerald-100 group-hover:text-emerald-700'}`}>
                        {idx + 1}
                      </span>
                      <div className="flex-1 min-w-0 pr-4">
                        <p className={`text-sm font-semibold truncate ${idx === activeIndex ? 'text-emerald-800' : 'text-slate-700'}`} title={file.file_name}>{file.file_name}</p>
                        <p className="text-xs text-slate-400 font-medium">{formatFileSize(file.file_size)}</p>
                      </div>
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDownloadFile(file); }}
                      className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                      title="Download file ini"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      <ConfirmModal
        open={confirmDelete}
        title="Hapus Media?"
        message="Apakah Anda yakin ingin menghapus media ini? Media akan dipindahkan ke recycle bin."
        confirmText="Ya, Hapus"
        icon="🗑️"
        danger
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(false)}
      />
    </div>
    </>
  );
}

function DetailRow({ icon, label, value, highlight = false }) {
  return (
    <div className="flex items-start">
      <span className="text-xl mr-3 opacity-80 mt-0.5">{icon}</span>
      <div>
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">{label}</p>
        <p className={`text-sm ${highlight ? 'font-bold text-emerald-700' : 'font-medium text-slate-700'}`}>
          {value || <span className="text-slate-300 italic">Tidak ada data</span>}
        </p>
      </div>
    </div>
  );
}
