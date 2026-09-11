import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { mediaService } from '../../services';
import LoadingSpinner from '../../components/LoadingSpinner';
import { formatDate, formatDateTime, formatFileSize } from '../../utils/format';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';

export default function MediaDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { user, hasRole } = useAuth();
  const [media, setMedia] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const [viewMode, setViewMode] = useState('slide');

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
    if (confirm('Apakah Anda yakin ingin menghapus media ini?')) {
      try {
        await mediaService.delete(id);
        toast.success('Media berhasil dihapus');
        navigate('/media');
      } catch (e) {
        toast.error('Gagal menghapus media');
      }
    }
  };

  if (loading) return <LoadingSpinner fullScreen />;

  const files = media.files && media.files.length > 0
    ? media.files
    : [{ id: 0, file_path: media.file_path, file_name: media.file_name, file_type: media.file_type, file_size: media.file_size }];

  const activeFile = files[activeIndex];

  const renderPreview = (file, className = '') => {
    if (file.file_type.startsWith('image/')) {
      return <img src={`/storage/${file.file_path}`} alt={file.file_name} className={`w-full h-auto rounded ${className}`} />;
    }
    if (file.file_type.startsWith('video/')) {
      return <video src={`/storage/${file.file_path}`} controls className={`w-full h-auto rounded ${className}`} />;
    }
    return (
      <div className={`aspect-video bg-slate-100 flex flex-col items-center justify-center rounded ${className}`}>
        <span className="text-6xl mb-4">
          {file.file_type === 'application/pdf' ? '📄' : '📁'}
        </span>
        <p className="text-slate-500 text-sm">{file.file_name}</p>
      </div>
    );
  };

  const renderThumbnail = (file) => {
    if (file.file_type.startsWith('image/')) {
      return <img src={`/storage/${file.file_path}`} alt={file.file_name} className="w-full h-full object-cover rounded" />;
    }
    if (file.file_type.startsWith('video/')) {
      return (
        <div className="w-full h-full bg-slate-800 flex items-center justify-center rounded">
          <span className="text-white text-2xl">▶</span>
        </div>
      );
    }
    return (
      <div className="w-full h-full bg-slate-100 flex items-center justify-center rounded">
        <span className="text-2xl">{file.file_type === 'application/pdf' ? '📄' : '📁'}</span>
      </div>
    );
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <button onClick={() => navigate(-1)} className="text-sm text-blue-600 hover:underline">← Kembali</button>
        <div className="space-x-2">
          { (media.uploaded_by === user.id || hasRole(['SUPERADMIN', 'CORSEC'])) && (
            <a href={`/media/${id}/edit`} className="bg-white border border-slate-300 text-slate-700 px-3 py-1.5 rounded text-sm hover:bg-slate-50 transition">
              Edit
            </a>
          )}
          <button onClick={handleDownload} className="bg-blue-600 text-white px-3 py-1.5 rounded text-sm hover:bg-blue-700 transition">
            Download
          </button>
          { (media.uploaded_by === user.id || hasRole(['SUPERADMIN', 'CORSEC'])) && (
            <button onClick={handleDelete} className="bg-red-600 text-white px-3 py-1.5 rounded text-sm hover:bg-red-700 transition">
              Hapus
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {files.length > 1 && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500">{files.length} file</span>
              <div className="flex space-x-1">
                <button
                  onClick={() => setViewMode('slide')}
                  className={`px-3 py-1 text-xs rounded ${viewMode === 'slide' ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600'}`}
                >
                  Slide
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-3 py-1 text-xs rounded ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600'}`}
                >
                  Grid
                </button>
              </div>
            </div>
          )}

          {viewMode === 'slide' ? (
            <div className="space-y-3">
              <div className="bg-white p-2 rounded-lg shadow-sm border border-slate-200 relative">
                {renderPreview(activeFile)}
                {files.length > 1 && (
                  <>
                    <button
                      onClick={() => setActiveIndex((prev) => (prev - 1 + files.length) % files.length)}
                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 text-white w-8 h-8 rounded-full flex items-center justify-center hover:bg-black/70"
                    >
                      ‹
                    </button>
                    <button
                      onClick={() => setActiveIndex((prev) => (prev + 1) % files.length)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 text-white w-8 h-8 rounded-full flex items-center justify-center hover:bg-black/70"
                    >
                      ›
                    </button>
                  </>
                )}
              </div>
              {files.length > 1 && (
                <div className="flex space-x-2 overflow-x-auto pb-2">
                  {files.map((file, idx) => (
                    <button
                      key={file.id}
                      onClick={() => setActiveIndex(idx)}
                      className={`w-16 h-16 flex-shrink-0 rounded border-2 overflow-hidden ${idx === activeIndex ? 'border-blue-600' : 'border-slate-200'}`}
                    >
                      {renderThumbnail(file)}
                    </button>
                  ))}
                </div>
              )}
              <p className="text-xs text-slate-500 text-center">
                {activeFile.file_name} ({formatFileSize(activeFile.file_size)})
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {files.map((file) => (
                <div key={file.id} className="bg-white p-2 rounded-lg shadow-sm border border-slate-200">
                  <div className="aspect-square overflow-hidden rounded mb-2">
                    {renderThumbnail(file)}
                  </div>
                  <p className="text-xs text-slate-600 truncate" title={file.file_name}>{file.file_name}</p>
                  <p className="text-xs text-slate-400">{formatFileSize(file.file_size)}</p>
                </div>
              ))}
            </div>
          )}

          <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 space-y-4">
            <h1 className="text-2xl font-bold text-slate-800">{media.title}</h1>
            <p className="text-slate-700 whitespace-pre-wrap">{media.description || 'Tidak ada deskripsi.'}</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
            <h3 className="font-semibold text-slate-800 mb-4 pb-2 border-b border-slate-100">Informasi Media</h3>
            <div className="space-y-3">
              <DetailRow label="Departemen" value={media.department?.name} />
              <DetailRow label="Kategori" value={media.category?.name} />
              <DetailRow label="Tanggal Kegiatan" value={formatDate(media.event_date)} />
              <DetailRow label="Pengunggah" value={media.uploader?.name} />
              <DetailRow label="Waktu Unggah" value={formatDateTime(media.created_at)} />
              <DetailRow label="Jumlah File" value={`${files.length} file`} />
              <DetailRow label="Total Ukuran" value={formatFileSize(media.file_size)} />
            </div>
          </div>

          {files.length > 1 && (
            <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
              <h3 className="font-semibold text-slate-800 mb-4 pb-2 border-b border-slate-100">Daftar File</h3>
              <ul className="space-y-2">
                {files.map((file, idx) => (
                  <li
                    key={file.id}
                    className={`flex items-center justify-between p-2 rounded text-sm ${idx === activeIndex ? 'bg-blue-50 text-blue-700' : 'hover:bg-slate-50 text-slate-600'}`}
                  >
                    <button
                      onClick={() => { setActiveIndex(idx); setViewMode('slide'); }}
                      className="flex items-center justify-between flex-1 min-w-0 text-left"
                    >
                      <span className="truncate flex-1 min-w-0" title={file.file_name}>{file.file_name}</span>
                      <span className="text-xs text-slate-400 ml-2">{formatFileSize(file.file_size)}</span>
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDownloadFile(file); }}
                      className="ml-3 text-blue-600 hover:text-blue-800 text-xs font-medium whitespace-nowrap"
                    >
                      Download
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function DetailRow({ label, value }) {
  return (
    <div>
      <p className="text-xs text-slate-500 uppercase tracking-wider">{label}</p>
      <p className="text-sm font-medium text-slate-800">{value || '-'}</p>
    </div>
  );
}
