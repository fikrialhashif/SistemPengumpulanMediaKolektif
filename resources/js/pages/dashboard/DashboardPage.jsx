import { useAuth } from '../../contexts/AuthContext';
import { useEffect, useState } from 'react';
import { dashboardService } from '../../services';
import LoadingSpinner from '../../components/LoadingSpinner';
import { formatFileSize, formatDateTime } from '../../utils/format';

export default function DashboardPage() {
  const { user, hasRole } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardService.stats().then((res) => {
      setData(res.data.data);
      setLoading(false);
    });
  }, []);

  if (loading) return <LoadingSpinner fullScreen />;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Dashboard</h2>
        <p className="text-slate-500">Selamat datang, {user?.name}</p>
      </div>

      {hasRole('USER') && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <DashboardCard title="Total Media" value={data.total_media} />
          <DashboardCard title="Kategori" value={data.media_by_category?.length || 0} />
          <DashboardCard title="Media Terbaru" value={data.recent_media?.length || 0} />
        </div>
      )}

      {hasRole('CORSEC') && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <DashboardCard title="Total Media Seluruh Departemen" value={data.total_media} />
          <DashboardCard title="Jumlah Departemen" value={data.media_by_department?.length || 0} />
          <DashboardCard title="Media Terbaru" value={data.recent_media?.length || 0} />
        </div>
      )}

      {hasRole('SUPERADMIN') && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <DashboardCard title="Total User" value={data.total_users} />
            <DashboardCard title="Total Departemen" value={data.total_departments} />
            <DashboardCard title="Total Media" value={data.total_media} />
            <DashboardCard title="Media Terhapus" value={data.total_deleted_media} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card title="Media Terbaru">
              <ul className="divide-y divide-slate-100">
                {data.recent_media?.map((m) => (
                  <li key={m.id} className="py-2 text-sm">
                    <span className="font-medium">{m.title}</span>
                    <span className="text-slate-500 ml-2">- {m.department?.name}</span>
                  </li>
                ))}
              </ul>
            </Card>

            <Card title="Aktivitas Terbaru">
              <ul className="divide-y divide-slate-100">
                {data.recent_activities?.map((a) => (
                  <li key={a.id} className="py-2 text-sm flex justify-between items-center">
                    <div className="flex flex-col">
                      <div>
                        <span className="font-medium">
                          {a.user?.role?.name === 'SUPERADMIN' ? 'SUPERADMIN' : a.user?.department?.code || 'SUPERADMIN'}
                        </span>
                      </div>
                      <span className="text-slate-500 text-xs">{a.action}</span>
                    </div>
                    <span className="text-slate-500">{formatDateTime(a.created_at)}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}

function DashboardCard({ title, value }) {
  return (
    <div className="bg-white p-5 rounded-lg shadow-sm border border-slate-200">
      <p className="text-sm text-slate-500">{title}</p>
      <p className="text-3xl font-bold text-slate-800 mt-1">{value}</p>
    </div>
  );
}

function Card({ title, children }) {
  return (
    <div className="bg-white p-5 rounded-lg shadow-sm border border-slate-200">
      <h3 className="text-lg font-semibold text-slate-800 mb-3">{title}</h3>
      {children}
    </div>
  );
}
