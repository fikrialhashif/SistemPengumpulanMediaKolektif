import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import logo1 from '../../../assets/logo1.png';

export default function Sidebar() {
  const { user, hasRole, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMasterOpen, setIsMasterOpen] = useState(
    ['/master/departments', '/master/media-categories'].includes(location.pathname)
  );

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  const linkClass = (active) =>
    `flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
      active 
        ? 'bg-emerald-600 text-white shadow-md' 
        : 'text-emerald-100 hover:bg-emerald-700/50 hover:text-white'
    }`;

  return (
    <aside className="w-64 bg-emerald-900 text-white min-h-screen flex flex-col shadow-xl z-20">
      {/* Brand & User Profile */}
      <div className="p-6 bg-emerald-950/30">
        <div className="flex justify-center mb-6">
          <img src={logo1} alt="Logo" className="w-40 h-17.5 rounded-xl object-cover shadow-lg" />
        </div>
        
        {user && (
          <div className="bg-emerald-800/50 p-4 rounded-xl border border-emerald-700/50 backdrop-blur-sm">
            <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
            <p className="text-xs text-emerald-300 truncate mb-2">{user?.email}</p>
            <div className="inline-block px-2 py-1 bg-emerald-950 rounded-md">
              <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">
                {user?.role?.name === 'SUPERADMIN' ? 'SUPERADMIN' : `${user?.role?.name} - ${user?.department?.name}`}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        <p className="px-4 text-xs font-bold text-emerald-500 uppercase tracking-wider mb-2">Menu Utama</p>
        
        <a href="/dashboard" className={linkClass(isActive('/dashboard'))}>
          <svg className="w-5 h-5 mr-3 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg>
          Dashboard
        </a>
        
        <a href="/media" className={linkClass(isActive('/media'))}>
          <svg className="w-5 h-5 mr-3 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
          {hasRole('USER') ? 'Media Saya' : 'Semua Media'}
        </a>

        {!hasRole('SUPERADMIN') && (
          <a href="/media/upload" className={linkClass(isActive('/media/upload'))}>
            <svg className="w-5 h-5 mr-3 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
            Upload Media
          </a>
        )}

        <div className="pt-6 mt-4 border-t border-emerald-800/50">
          <p className="px-4 text-xs font-bold text-emerald-500 uppercase tracking-wider mb-2">Pengaturan</p>
          
          {hasRole(['SUPERADMIN', 'CORSEC']) && (
            <>
              <div className="mb-1">
                <button
                  onClick={() => setIsMasterOpen(!isMasterOpen)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isMasterOpen || ['/master/departments', '/master/media-categories'].includes(location.pathname)
                      ? 'bg-emerald-700/60 text-white'
                      : 'text-emerald-100 hover:bg-emerald-700/50 hover:text-white'
                  }`}
                >
                  <span className="flex items-center">
                    <svg className="w-5 h-5 mr-3 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z"></path></svg>
                    Master Data
                  </span>
                  <svg className={`w-4 h-4 transition-transform duration-200 ${isMasterOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </button>
                {isMasterOpen && (
                  <div className="ml-6 mt-1 space-y-1">
                    <a
                      href="/master/departments"
                      className={`block px-4 py-2.5 rounded-lg text-sm transition-all duration-200 ${
                        isActive('/master/departments')
                          ? 'bg-emerald-600 text-white shadow-md'
                          : 'text-emerald-100 hover:bg-emerald-700/50 hover:text-white'
                      }`}
                    >
                      Master Departemen
                    </a>
                    <a
                      href="/master/media-categories"
                      className={`block px-4 py-2.5 rounded-lg text-sm transition-all duration-200 ${
                        isActive('/master/media-categories')
                          ? 'bg-emerald-600 text-white shadow-md'
                          : 'text-emerald-100 hover:bg-emerald-700/50 hover:text-white'
                      }`}
                    >
                      Master Media Category
                    </a>
                  </div>
                )}
              </div>
            </>
          )}

          {hasRole('SUPERADMIN') && (
            <>
              <a href="/trash" className={linkClass(isActive('/trash'))}>
                <svg className="w-5 h-5 mr-3 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
                Recycle Bin
              </a>
              <a href="/users" className={linkClass(isActive('/users'))}>
                <svg className="w-5 h-5 mr-3 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
                Manajemen Pengguna
              </a>
            </>
          )}

          <a href="/profile" className={linkClass(isActive('/profile'))}>
            <svg className="w-5 h-5 mr-3 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
            Profil Akun
          </a>
        </div>
      </nav>

      <div className="p-4 bg-emerald-950/30 border-t border-emerald-800">
        <button
          onClick={handleLogout}
          className="flex items-center justify-center w-full px-4 py-2.5 rounded-lg text-sm font-bold text-emerald-100 bg-emerald-800 hover:bg-red-500 hover:text-white transition-all duration-200"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
          Keluar Sistem
        </button>
      </div>
    </aside>
  );
}