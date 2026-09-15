export default function ConfirmModal({
  open,
  title,
  message,
  confirmText = 'Ya, Lanjutkan',
  cancelText = 'Batal',
  icon = '⚠️',
  danger = true,
  loading,
  onConfirm,
  onCancel,
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-emerald-950/60 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]"
        onClick={onCancel}
      ></div>
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-emerald-100 animate-[slideUp_0.25s_ease-out]">
        <div className="p-8">
          <div className={`w-16 h-16 mx-auto rounded-2xl flex items-center justify-center text-3xl mb-5 ${
            danger ? 'bg-red-50 border border-red-100' : 'bg-emerald-50 border border-emerald-100'
          }`}>
            {icon}
          </div>
          <h3 className="text-xl font-extrabold text-slate-800 text-center mb-2 tracking-tight">{title}</h3>
          <p className="text-slate-500 text-center text-sm leading-relaxed mb-8">{message}</p>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="px-4 py-3 rounded-xl text-sm font-bold text-slate-600 bg-slate-100 border-2 border-transparent hover:border-slate-200 hover:bg-white transition-all duration-200 disabled:opacity-50"
            >
              {cancelText}
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={loading}
              className={`px-4 py-3 rounded-xl text-sm font-bold text-white flex items-center justify-center transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 ${
                danger
                  ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700'
                  : 'bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700'
              }`}
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Memproses...
                </>
              ) : (
                confirmText
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}