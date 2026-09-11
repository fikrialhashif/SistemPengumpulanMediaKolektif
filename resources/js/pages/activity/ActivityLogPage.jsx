import { useEffect, useState } from 'react';
import { activityLogService } from '../../services';
import LoadingSpinner from '../../components/LoadingSpinner';
import { formatDateTime } from '../../utils/format';

export default function ActivityLogPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState({});
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchLogs(page);
  }, [page]);

  const fetchLogs = (p) => {
    setLoading(true);
    activityLogService.list({ page: p }).then((res) => {
      setLogs(res.data.data);
      setMeta(res.data.meta);
    }).catch(console.error)
    .finally(() => {
      setLoading(false);
    });
  };

  if (loading && logs.length === 0) return <LoadingSpinner fullScreen />;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Activity Log</h2>
        <p className="text-slate-500">Log aktivitas sistem terpusat</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left font-medium text-slate-500 uppercase tracking-wider">Waktu</th>
              <th className="px-6 py-3 text-left font-medium text-slate-500 uppercase tracking-wider">User</th>
              <th className="px-6 py-3 text-left font-medium text-slate-500 uppercase tracking-wider">Aksi</th>
              <th className="px-6 py-3 text-left font-medium text-slate-500 uppercase tracking-wider">Keterangan</th>
              <th className="px-6 py-3 text-left font-medium text-slate-500 uppercase tracking-wider">IP Address</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {logs.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-10 text-center text-slate-500">
                  Belum ada log aktivitas
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-slate-500">
                    {formatDateTime(log.created_at)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-slate-900">{log.user?.name || 'System'}</div>
                    <div className="text-slate-500 text-xs">{log.user?.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      (log.action || '').includes('DELETE') ? 'bg-red-100 text-red-700' : 
                      (log.action || '').includes('UPLOAD') ? 'bg-green-100 text-green-700' :
                      (log.action || '').includes('LOGIN') ? 'bg-blue-100 text-blue-700' :
                      'bg-slate-100 text-slate-700'
                    }`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-700 max-w-xs truncate">
                    {log.description}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-slate-500">
                    {log.ip_address}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      {meta.last_page > 1 && (
        <div className="flex justify-center space-x-2">
          {Array.from({ length: meta.last_page }, (_, i) => i + 1).map(p => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`px-3 py-1 rounded border ${p === page ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-600 border-slate-300'}`}
            >
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}