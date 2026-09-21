import { useAuth } from '../contexts/AuthContext';
import { useState, useEffect } from 'react';
import AccountSettingsModal from './AccountSettingsModal';

export default function Navbar() {
  const { user } = useAuth();
  const [greeting, setGreeting] = useState('');
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Selamat Pagi');
    else if (hour < 15) setGreeting('Selamat Siang');
    else if (hour < 18) setGreeting('Selamat Sore');
    else setGreeting('Selamat Malam');
  }, []);

  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-emerald-100/50 px-8 py-4 flex items-center justify-between shadow-sm sticky top-0 z-10">
      <div className="flex items-center space-x-3">
        <div>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">Sistem Pengumpulan Media Kolektif</h1>
          <div className="flex items-center gap-2 mt-0.5">
            <p className="text-sm font-medium text-emerald-600">{greeting}, {user?.name?.split(' ')[0]} 👋</p>
            {/* <span className="text-slate-300">•</span> */}
            {/* <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1 border border-emerald-200/60"
            >
              <span>🔑</span>
              <span>Ganti Password & Username</span>
            </button> */}
          </div>
        </div>
      </div>
      
      <div className="flex items-center space-x-4">
        <div className="hidden sm:block text-right mr-2">
          <p className="text-sm font-bold text-slate-800">{user?.name}</p>
          <p className="text-xs font-medium text-emerald-600 uppercase tracking-wider">{user?.role?.name}</p>
        </div>
        
        <div className="relative">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-white flex items-center justify-center text-lg font-bold shadow-md shadow-emerald-200 ring-2 ring-white cursor-pointer hover:scale-105 transition-transform duration-200">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full"></div>
        </div>
      </div>

      <AccountSettingsModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </header>
  );
}