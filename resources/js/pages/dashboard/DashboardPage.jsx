import { useAuth } from '../../contexts/AuthContext';
import { useEffect, useState, useId } from 'react';
import { useNavigate } from 'react-router-dom';
import { dashboardService } from '../../services';
import LoadingSpinner from '../../components/LoadingSpinner';
import { formatDateTime, formatTime, formatFileSize } from '../../utils/format';

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
          <DashboardCard 
            title="Total Ukuran Media" 
            value={formatFileSize(data.total_size || 0)} 
            icon="💾"
            color="indigo"
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <DashboardCard title="Total Media Approved" value={data.total_media} icon="📊" color="emerald" />
            <DashboardCard title="Jumlah Departemen" value={data.media_by_department?.length || 0} icon="🏢" color="yellow" />
            <DashboardCard title="Media Baru (30 Hari)" value={data.new_media_30d || 0} icon="✨" color="teal" />
            <DashboardCard title="Total Ukuran Media" value={formatFileSize(data.total_size || 0)} icon="💾" color="indigo" />
            <DashboardCard title="Total Unduhan" value={data.total_downloads || 0} icon="⬇️" color="red" />
            <DashboardCard title="Jumlah Kategori" value={data.media_by_category?.length || 0} icon="🏷️" color="emerald" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
            <LineChartCard
              title="Media per Departemen"
              icon="🏢"
              color="emerald"
              emptyText="Belum ada media yang disetujui."
              points={(data.media_by_department || []).map((d) => ({
                label: d.department?.name || d.department?.code || 'Tanpa Dept',
                value: Number(d.total) || 0,
              }))}
            />

            <LineChartCard
              title="Media per Kategori"
              icon="🏷️"
              color="teal"
              emptyText="Belum ada media yang disetujui."
              points={(data.media_by_category || []).map((c) => ({
                label: c.category?.name || 'Tanpa Kategori',
                value: Number(c.total) || 0,
              }))}
            />
          </div>
        </>
      )}

      {hasRole('SUPERADMIN') && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <DashboardCard title="Total User Aktif" value={data.total_users} icon="👥" color="emerald" />
          <DashboardCard title="Total Departemen" value={data.total_departments} icon="🏢" color="yellow" />
          <DashboardCard title="Total Media" value={data.total_media} icon="📁" color="teal" />
          <DashboardCard title="Media Terhapus=" value={data.total_deleted_media} icon="🗑️" color="red" />
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

      {hasRole('USER') && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
          <LineChartCard
            title="Media Saya per Kategori"
            icon="🏷️"
            color="emerald"
            emptyText="Anda belum mengunggah media."
            points={(data.media_by_category || []).map((c) => ({
              label: c.category?.name || 'Tanpa Kategori',
              value: Number(c.total) || 0,
            }))}
          />

          <Card title="Aktivitas Terakhir Saya" icon="🕒">
            <ul className="divide-y divide-emerald-50">
              {(data.recent_activities || []).map((a) => (
                <li key={a.id} className="py-3 flex justify-between items-start group hover:bg-emerald-50/50 px-2 rounded-lg transition-colors -mx-2">
                  <div className="flex items-start space-x-3">
                    <div className="mt-0.5 w-2 h-2 rounded-full bg-emerald-400"></div>
                    <div className="flex flex-col">
                      <span className="font-semibold text-sm text-slate-800">{a.action}</span>
                      {a.media?.title && (
                        <span className="text-slate-500 text-xs mt-0.5 line-clamp-1">{a.media.title}</span>
                      )}
                    </div>
                  </div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 whitespace-nowrap ml-2">
                    {formatDateTime(a.created_at)}
                  </span>
                </li>
              ))}
              {(!data.recent_activities || data.recent_activities.length === 0) && (
                <li className="py-8 text-center text-sm text-slate-400">Belum ada aktivitas tercatat.</li>
              )}
            </ul>
          </Card>
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
    indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100',
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow relative overflow-hidden group">
      <div className="absolute -right-6 -top-6 w-24 h-24 bg-slate-50 rounded-full group-hover:scale-110 transition-transform duration-500"></div>
      <div className="relative flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
          <p className={`font-extrabold text-slate-800 tracking-tight ${typeof value === 'number' ? 'text-4xl' : 'text-2xl'}`}>{value}</p>
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

function LineChartCard({ title, icon, color = 'emerald', points = [], emptyText = 'Belum ada data.' }) {
  const gradientId = useId().replace(/:/g, '');

  const strokeMap = {
    emerald: '#10b981',
    teal: '#14b8a6',
    indigo: '#6366f1',
    yellow: '#f59e0b',
    red: '#f43f5e',
  };
  const stroke = strokeMap[color] || strokeMap.emerald;

  const data = points.filter((p) => p && p.value != null);

  const W = 600;
  const H = 260;
  const padL = 34;
  const padR = 18;
  const padT = 24;
  const padB = 54;
  const innerW = W - padL - padR;
  const innerH = H - padT - padB;
  const stepY = Math.max(1, Math.ceil(Math.max(...data.map((d) => d.value), 1) / 4));
  const top = stepY * 4;

  const x = (i) => (data.length <= 1 ? padL + innerW / 2 : padL + (innerW * i) / (data.length - 1));
  const y = (v) => padT + innerH * (1 - v / top);
  const baseY = padT + innerH;

  const linePts = data.map((d, i) => `${x(i).toFixed(1)},${y(d.value).toFixed(1)}`).join(' ');
  const areaPath =
    data.length === 0
      ? ''
      : `M ${x(0).toFixed(1)},${baseY.toFixed(1)} ` +
        data.map((d, i) => `L ${x(i).toFixed(1)},${y(d.value).toFixed(1)}`).join(' ') +
        ` L ${x(data.length - 1).toFixed(1)},${baseY.toFixed(1)} Z`;

  const truncate = (s, n = 9) => (s.length > n ? s.slice(0, n - 1) + '…' : s);
  const rotateLabels = data.length > 4;

  return (
    <Card title={title} icon={icon}>
      {data.length === 0 ? (
        <div className="py-8 text-center text-sm text-slate-400">{emptyText}</div>
      ) : (
        <div className="w-full">
          <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" preserveAspectRatio="xMidYMid meet" role="img" aria-label={title}>
            <defs>
              <linearGradient id={`grad-${gradientId}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={stroke} stopOpacity="0.28" />
                <stop offset="100%" stopColor={stroke} stopOpacity="0" />
              </linearGradient>
            </defs>

            {[0, 1, 2, 3, 4].map((k) => {
              const val = stepY * k;
              const gy = y(val);
              return (
                <g key={k}>
                  <line x1={padL} y1={gy} x2={W - padR} y2={gy} stroke="#e2e8f0" strokeWidth="1" strokeDasharray={k === 0 ? '0' : '4 4'} />
                  <text x={padL - 8} y={gy + 4} textAnchor="end" fontSize="11" fill="#94a3b8">{val}</text>
                </g>
              );
            })}

            {areaPath && <path d={areaPath} fill={`url(#grad-${gradientId})`} />}
            {data.length > 1 && <polyline points={linePts} fill="none" stroke={stroke} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />}

            {data.map((d, i) => (
              <g key={d.label + i}>
                <circle cx={x(i)} cy={y(d.value)} r="4.5" fill="#ffffff" stroke={stroke} strokeWidth="2.5">
                  <title>{`${d.label}: ${d.value}`}</title>
                </circle>
                <text x={x(i)} y={y(d.value) - 12} textAnchor="middle" fontSize="11" fontWeight="700" fill="#334155">{d.value}</text>
                <text
                  x={x(i)}
                  y={baseY + 18}
                  textAnchor={rotateLabels ? 'end' : 'middle'}
                  fontSize="10.5"
                  fill="#64748b"
                  transform={rotateLabels ? `rotate(-35 ${x(i)} ${baseY + 18})` : undefined}
                >
                  {truncate(String(d.label), rotateLabels ? 14 : 10)}
                </text>
              </g>
            ))}
          </svg>
        </div>
      )}
    </Card>
  );
}
