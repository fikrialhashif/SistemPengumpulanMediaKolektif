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

  useEffect(() => {
    mediaService.get(id)
      .then((res) => {
        setMedia(res.data.data);
        setLoading(false);
      })
      .catch((err) => {
        toast.error('Gagal mengambil data media');
        navigate('/media');
      });
  }, [id]);

  const handleDownload = async () => {
    try {
      const res = await mediaService.download(id);
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', media.file_name);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (e) {
      toast.error('Gagal mendownload media');
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
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-2 rounded-lg shadow-sm border border-slate-200">
            {media.file_type.startsWith('image/') ? (
              <img src={`/storage/${media.file_path}`} alt={media.title} className="w-full h-auto rounded" />
            ) : media.file_type.startsWith('video/') ? (
              <video src={`/storage/${media.file_path}`} controls className="w-full h-auto rounded" />
            ) : (
              <div className="aspect-video bg-slate-100 flex flex-col items-center justify-center rounded">
                <span className="text-6xl mb-4">
                  {media.file_type === 'application/pdf' ? '📄' : '📁'}
                </span>
                <p className="text-slate-500">{media.file_name}</p>
                <button onClick={handleDownload} className="mt-4 text-blue-600 font-medium">Download untuk melihat</button>
              </div>
            )}
          </div>
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
              <DetailRow label="Ukuran File" value={formatFileSize(media.file_size)} />
              <DetailRow label="Tipe File" value={media.file_type} />
            </div>
          </div>
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
