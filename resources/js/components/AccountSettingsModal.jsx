import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { authService } from '../services';

export default function AccountSettingsModal({ open, onClose }) {
  const { user, updateUser } = useAuth();
  const toast = useToast();

  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (open) {
      setEmail(user?.email || '');
      setCurrentPassword('');
      setPassword('');
      setPasswordConfirmation('');
      setErrors({});
    }
  }, [open]);

  if (!open) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    const payload = {
      email: email.trim(),
    };

    if (password) {
      payload.current_password = currentPassword;
      payload.password = password;
      payload.password_confirmation = passwordConfirmation;
    }

    try {
      const res = await authService.updateAccount(payload);
      if (res.data?.success) {
        updateUser(res.data.data);
        toast.success(res.data.message || 'Akun berhasil diperbarui.');
        onClose();
      }
    } catch (err) {
      const resp = err.response?.data;
      if (resp?.errors) {
        setErrors(resp.errors);
      }
      toast.error(resp?.message || 'Gagal memperbarui akun.');
    } finally {
      setLoading(false);
    }
  };

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
        onClick={loading ? undefined : onClose}
      />

      {/* Modal Dialog */}
      <div className="relative bg-white rounded-2xl max-w-md w-full shadow-2xl border border-emerald-50 overflow-hidden z-10">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-4 flex items-center justify-between text-white">
          <div className="flex items-center space-x-2.5">
            <span className="text-2xl">⚙️</span>
            <div>
              <h3 className="font-bold text-base leading-tight">Pengaturan Akun</h3>
              <p className="text-xs text-emerald-100">Ubah username (email) & kata sandi</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="text-emerald-100 hover:text-white text-xl leading-none px-2 py-1 rounded-lg hover:bg-white/10 transition"
          >
            ✕
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
              Username / Email <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-slate-400 text-sm pointer-events-none select-none">✉️</span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@email.com"
                className={`w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border rounded-xl outline-none transition focus:bg-white focus:ring-2 ${
                  errors.email
                    ? 'border-rose-300 focus:ring-rose-400 focus:border-rose-400'
                    : 'border-slate-200 focus:ring-emerald-500 focus:border-emerald-500'
                }`}
              />
            </div>
            {errors.email && <p className="text-xs text-rose-500 mt-1">{errors.email[0]}</p>}
          </div>

          <div className="pt-2 border-t border-slate-100">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Ubah Kata Sandi (Opsional)
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Password Saat Ini {password ? <span className="text-rose-500">*</span> : ''}
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-400 text-sm pointer-events-none select-none">🔒</span>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Masukkan password saat ini"
                    className={`w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border rounded-xl outline-none transition focus:bg-white focus:ring-2 ${
                      errors.current_password
                        ? 'border-rose-300 focus:ring-rose-400 focus:border-rose-400'
                        : 'border-slate-200 focus:ring-emerald-500 focus:border-emerald-500'
                    }`}
                  />
                </div>
                {errors.current_password && (
                  <p className="text-xs text-rose-500 mt-1">{errors.current_password[0]}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Password Baru</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-400 text-sm pointer-events-none select-none">🔑</span>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimal 6 karakter"
                    className={`w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border rounded-xl outline-none transition focus:bg-white focus:ring-2 ${
                      errors.password
                        ? 'border-rose-300 focus:ring-rose-400 focus:border-rose-400'
                        : 'border-slate-200 focus:ring-emerald-500 focus:border-emerald-500'
                    }`}
                  />
                </div>
                {errors.password && <p className="text-xs text-rose-500 mt-1">{errors.password[0]}</p>}
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Konfirmasi Password Baru
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-400 text-sm pointer-events-none select-none">🔑</span>
                  <input
                    type="password"
                    value={passwordConfirmation}
                    onChange={(e) => setPasswordConfirmation(e.target.value)}
                    placeholder="Ulangi password baru"
                    className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none transition focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="pt-3 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 rounded-xl shadow-md shadow-emerald-200 transition"
            >
              {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
