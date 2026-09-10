export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-xl font-bold text-slate-800 text-center">Registrasi</h1>
        <p className="text-slate-500 text-center mt-2 mb-6">Hubungi Superadmin untuk membuat akun baru</p>
        <a href="/login" className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md text-center transition-colors">
          Kembali ke Login
        </a>
      </div>
    </div>
  );
}