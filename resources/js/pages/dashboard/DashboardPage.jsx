import { useAuth } from '../../contexts/AuthContext';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { dashboardService } from '../../services';
import LoadingSpinner from '../../components/LoadingSpinner';
import { formatDateTime, formatTime } from '../../utils/format';

export default function DashboardPage() {
  const { user, hasRole } = useAuth();
  const navigate = useNavigate();
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
    <div className="space-y-8 pb-8">
      {/* Cards Top Row */}
      {hasRole('USER') && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <DashboardCard 
            title="Total Media Saya" 
            value={data.total_media} 
            icon="📁"
            color="emerald"
          />
          <DashboardCard 
            title="Disetujui (Approved)" 
            value={data.total_approved || 0} 
            icon="✅"
            color="teal"
          />
          <DashboardCard 
            title="Ditolak (Unapproved)" 
            value={data.total_unapproved || 0} 
            icon="❌"
            color="red"
          />
          <DashboardCard 
            title="Menunggu Review" 
            value={data.total_pending || 0} 
            icon="⏳"
            color="yellow"
          />
        </div>
      )}

      {hasRole('MANAGER') && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <DashboardCard 
              title="Media Departemen" 
              value={data.total_media} 
              icon="🏢"
              color="emerald"
            />
            <DashboardCard 
              title="Menunggu Review" 
              value={data.total_pending || 0} 
              icon="⏳"
              color="yellow"
            />
            <DashboardCard 
              title="Telah Disetujui" 
              value={data.total_approved || 0} 
              icon="✅"
              color="teal"
            />
            <DashboardCard 
              title="Ditolak / Revisi" 
              value={data.total_unapproved || 0} 
              icon="❌"
              color="red"
            />
          </div>
        </>
      )}

      {hasRole('CORSEC') && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <DashboardCard title="Total Media Departemen" value={data.total_media} icon="📊" color="emerald" />
            <DashboardCard title="Jumlah Departemen" value={data.media_by_department?.length || 0} icon="🏢" color="yellow" />
            <DashboardCard title="Media Terbaru" value={data.recent_media?.length || 0} icon="✨" color="teal" />
          </div>

          <BarChartCard
            title="Ringkasan Media"
            icon="📊"
            bars={[
              { label: 'Total Media Departemen', value: data.total_media, color: 'emerald' },
              { label: 'Jumlah Departemen', value: data.media_by_department?.length || 0, color: 'yellow' },
              { label: 'Media Terbaru', value: data.recent_media?.length || 0, color: 'teal' },
            ]}
          />
        </>
      )}

      {hasRole('SUPERADMIN') && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <DashboardCard title="Total User Aktif" value={data.total_users} icon="👥" color="emerald" />
          <DashboardCard title="Total Departemen" value={data.total_departments} icon="🏢" color="yellow" />
          <DashboardCard title="Total Media" value={data.total_media} icon="📁" color="teal" />
          <DashboardCard title="Media Terhapus" value={data.total_deleted_media} icon="🗑️" color="red" />
        </div>
      )}

      {/* Content Area */}
      {hasRole('MANAGER') && (
        <div className="mt-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-800">Media Departemen Anda (Perlu Review)</h3>
            <button 
              onClick={() => navigate('/media')}
              className="text-sm font-medium text-emerald-600 hover:text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg transition-colors"
            >
              Buka Pustaka Media
            </button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {data.recent_media?.map((m) => (
              <div
                key={m.id}
                className="bg-white rounded-xl shadow-sm border border-emerald-100/50 hover:shadow-md hover:-translate-y-1 hover:border-emerald-300 transition-all duration-300 cursor-pointer overflow-hidden group"
                onClick={() => navigate(`/media/${m.id}`)}
              >
                <div className="relative h-40 overflow-hidden bg-slate-100">
                  {m.file_type.startsWith('image/') ? (
                    <img
                      src={`/storage/${m.file_path}`}
                      alt={m.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <div className="bg-emerald-50/50 h-full flex items-center justify-center">
                      <span className="text-4xl">{m.file_type.startsWith('video/') ? '🎬' : '📄'}</span>
                    </div>
                  )}
                  <div className="absolute top-2 left-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded shadow-sm text-white ${
                      m.approval_status === 'APPROVED' ? 'bg-emerald-600' : m.approval_status === 'UNAPPROVED' ? 'bg-rose-600' : 'bg-amber-600'
                    }`}>
                      {m.approval_status || 'PENDING'}
                    </span>
                  </div>
                </div>
                <div className="p-4 bg-white">
                  <h3 className="font-bold text-slate-800 line-clamp-1 mb-1 text-sm group-hover:text-emerald-600" title={m.title}>{m.title}</h3>
                  <p className="text-xs text-slate-500">Oleh: {m.uploader?.name || '-'}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {hasRole('USER') && (
        <div className="mt-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-800">Media Terbaru Anda</h3>
            <button 
              onClick={() => navigate('/media')}
              className="text-sm font-medium text-emerald-600 hover:text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg transition-colors"
            >
              Lihat Semua
            </button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {data.my_media?.map((m) => (
              <div
                key={m.id}
                className="bg-white rounded-xl shadow-sm border border-emerald-100/50 hover:shadow-md hover:-translate-y-1 hover:border-emerald-300 transition-all duration-300 cursor-pointer overflow-hidden group"
                onClick={() => navigate(`/media/${m.id}`)}
              >
                {m.file_type.startsWith('image/') ? (
                  <div className="relative h-40 overflow-hidden">
                    <img
                      src={`/storage/${m.file_path}`}
                      alt={m.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                ) : (
                  <div className="bg-emerald-50/50 h-40 flex items-center justify-center group-hover:bg-emerald-100/50 transition-colors">
                    <span className="text-5xl transform group-hover:scale-110 transition-transform duration-300">
                      {m.file_type.startsWith('video/') ? '🎬' : m.file_type === 'application/pdf' ? '📄' : '📁'}
                    </span>
                  </div>
                )}
                <div className="p-4 bg-white relative">
                  <div className="absolute -top-3 right-3 bg-white px-2 py-0.5 rounded-full text-[10px] font-bold text-emerald-600 border border-emerald-100 shadow-sm">
                    {m.category?.name || '-'}
                  </div>
                  <h3 className="font-bold text-slate-800 line-clamp-1 mb-1 group-hover:text-emerald-600 transition-colors" title={m.title}>{m.title}</h3>
                  <p className="text-xs text-slate-500">{formatDateTime(m.created_at).split(' ')[0]}</p>
                </div>
              </div>
            ))}
            {(!data.my_media || data.my_media.length === 0) && (
              <div className="col-span-full bg-white rounded-xl border border-dashed border-emerald-200 p-12 text-center flex flex-col items-center justify-center">
                <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center text-2xl mb-4">📭</div>
                <h3 className="text-lg font-bold text-slate-700 mb-1">Belum Ada Media</h3>
                <p className="text-slate-500 text-sm mb-4">Anda belum mengunggah media apapun ke dalam sistem.</p>
                <button 
                  onClick={() => navigate('/media/upload')}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-lg font-medium shadow-sm transition-colors"
                >
                  Upload Media Pertama
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {hasRole('SUPERADMIN') && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
          <Card title="Upload Media Terbaru" icon="✨">
            <ul className="divide-y divide-emerald-50">
              {data.recent_media?.map((m) => (
                <li key={m.id} className="py-3 group hover:bg-emerald-50/50 px-2 rounded-lg transition-colors -mx-2 flex justify-between items-center">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center text-emerald-600">
                      {m.file_type.startsWith('image/') ? '🖼️' : m.file_type.startsWith('video/') ? '🎬' : '📄'}
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-slate-800 group-hover:text-emerald-700 transition-colors">{m.title}</p>
                      <p className="text-xs text-emerald-600/80 font-medium">{m.department?.name || '-'}</p>
                    </div>
                  </div>
                  <span className="text-xs text-slate-400 bg-white px-2 py-1 border border-slate-100 rounded-md">
                    {formatDateTime(m.created_at).split(' ')[0]}
                  </span>
                </li>
              ))}
            </ul>
          </Card>

          <Card title="Aktivitas Sistem Terkini" icon="📈">
            <ul className="divide-y divide-emerald-50">
              {data.recent_activities?.map((a) => (
                <li key={a.id} className="py-3 flex justify-between items-start group hover:bg-emerald-50/50 px-2 rounded-lg transition-colors -mx-2">
                  <div className="flex items-start space-x-3">
                    <div className="mt-0.5 w-2 h-2 rounded-full bg-yellow-400"></div>
                    <div className="flex flex-col">
                      <span className="font-semibold text-sm text-slate-800">
                        {a.user?.role?.name === 'SUPERADMIN' ? 'SUPERADMIN' : a.user?.department?.code || 'Sistem'}
                      </span>
                      <span className="text-slate-500 text-xs mt-0.5">{a.action}</span>
                    </div>
                  </div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                    {formatDateTime(a.created_at)}
                  </span>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      )}
    </div>
  );
}

function DashboardCard({ title, value, icon, color = 'emerald' }) {
  const colorStyles = {
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    yellow: 'bg-yellow-50 text-yellow-600 border-yellow-100',
    teal: 'bg-teal-50 text-teal-600 border-teal-100',
    red: 'bg-red-50 text-red-600 border-red-100',
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow relative overflow-hidden group">
      <div className="absolute -right-6 -top-6 w-24 h-24 bg-slate-50 rounded-full group-hover:scale-110 transition-transform duration-500"></div>
      <div className="relative flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
          <p className="text-4xl font-extrabold text-slate-800 tracking-tight">{value}</p>
        </div>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${colorStyles[color]} shadow-sm`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

function Card({ title, icon, children }) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
      <div className="flex items-center space-x-2 mb-6 pb-4 border-b border-slate-50">
        {icon && <span className="text-xl">{icon}</span>}
        <h3 className="text-lg font-bold text-slate-800">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function BarChartCard({ title, icon, bars }) {
  const colorClasses = {
    emerald: 'bg-emerald-500',
    yellow: 'bg-yellow-500',
    teal: 'bg-teal-500',
    red: 'bg-red-500',
  };

  const maxValue = Math.max(...bars.map(b => b.value), 1);

  return (
    <Card title={title} icon={icon}>
      <div className="space-y-6">
        {bars.map((bar, idx) => (
          <div key={bar.label}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-600">{bar.label}</span>
              <span className="text-sm font-bold text-slate-800">{bar.value}</span>
            </div>
            <div className="relative">
              <div className="h-8 bg-slate-100 rounded-lg overflow-hidden">
                <div
                  className={`h-full rounded-lg ${colorClasses[bar.color] || 'bg-emerald-500'} transition-all duration-500 flex items-center justify-end pr-2`}
                  style={{ width: `${(bar.value / maxValue) * 100}%` }}
                >
                  <span className="text-white text-xs font-bold">{bar.value}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
