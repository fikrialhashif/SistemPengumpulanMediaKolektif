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
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Media</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Departemen</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Dihapus Pada</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Aksi</th>
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
                  <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium space-x-3">
                    <button onClick={() => handleRestore(media.id)} className="text-emerald-600 hover:text-emerald-900">Restore</button>
                    <button onClick={() => setConfirmDeleteId(media.id)} className="text-red-600 hover:text-red-900">Hapus Permanen</button>
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