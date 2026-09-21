import { useEffect, useState } from 'react';
import { mediaService } from '../../services';
import LoadingSpinner from '../../components/LoadingSpinner';
import { formatDate, formatFileSize } from '../../utils/format';
import { useToast } from '../../contexts/ToastContext';
import ConfirmModal from '../../components/ConfirmModal';

export default function TrashPage() {
  const [medias, setMedias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const toast = useToast();

  useEffect(() => {
    fetchTrash();
  }, []);

  const fetchTrash = () => {
    setLoading(true);
    mediaService.trash().then((res) => {
      setMedias(res.data.data);
    }).catch(() => {
      toast.error('Gagal memuat data recycle bin');
    }).finally(() => {
      setLoading(false);
    });
  };

  const handleRestore = async (id) => {
    try {
      await mediaService.restore(id);
      toast.success('Media berhasil dipulihkan');
      fetchTrash();
    } catch (e) {
      toast.error('Gagal memulihkan media');
    }
  };

  const handleForceDelete = async (id) => {
    setDeleting(true);
    try {
      await mediaService.forceDelete(id);
      toast.success('Media dihapus permanen');
      fetchTrash();
    } catch (e) {
      toast.error('Gagal menghapus media');
    } finally {
      setDeleting(false);
      setConfirmDeleteId(null);
    }
  };

  if (loading) return <LoadingSpinner fullScreen />;

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Recycle Bin</h2>
        <p className="text-slate-500">Media yang telah dihapus (Soft Delete)</p>
      </div>

      <div className="bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-100">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Aksi</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Media</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Departemen</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Dihapus Pada</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {medias.length === 0 ? (
              <tr>
                <td colSpan="4" className="px-4 py-8 text-center text-slate-500">Recycle bin kosong</td>
              </tr>
            ) : (
              medias.map((media) => (
                <tr key={media.id}>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <button onClick={() => handleRestore(media.id)} className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold bg-white border border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:border-emerald-300 shadow-sm transition-all">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                        Pulihkan
                      </button>
                      <button onClick={() => setConfirmDeleteId(media.id)} className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold bg-white border border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 shadow-sm transition-all">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                        Hapus
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="text-sm font-medium text-slate-800">{media.title}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                    {media.department?.name || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                    {formatDate(media.deleted_at)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <ConfirmModal
        open={confirmDeleteId !== null}
        title="Hapus Permanen?"
        message="Apakah Anda yakin ingin menghapus media ini secara PERMANEN? File akan dihapus selamanya dan tidak dapat dipulihkan kembali."
        confirmText="Ya, Hapus Permanen"
        icon="💥"
        danger
        loading={deleting}
        onConfirm={() => handleForceDelete(confirmDeleteId)}
        onCancel={() => setConfirmDeleteId(null)}
      />
    </div>
  );
}