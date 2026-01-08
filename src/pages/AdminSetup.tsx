import { useState } from 'react';
import { Shield, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import Card from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { apiConfig, getAuthHeaders } from '../lib/api';

export default function AdminSetup() {
  const [formData, setFormData] = useState({
    email: 'ctgold@gmail.com',
    password: '',
    fullName: 'Ekho Daeng',
    secretKey: 'CTGOLD_ADMIN_SETUP_2026',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setResult(null);

    try {
      const apiUrl = apiConfig.endpoints.setupAdminAuth();

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setResult({
          success: true,
          message: data.message || 'Admin berhasil disetup dengan auth user!',
        });
      } else {
        setResult({
          success: false,
          message: data.error || 'Gagal setup admin',
        });
      }
    } catch (error: any) {
      console.error('Setup error:', error);
      setResult({
        success: false,
        message: error?.message || 'Terjadi kesalahan saat setup admin',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#070A0F] via-[#0A0D15] to-[#0B0F1A] px-4 py-8 flex items-center justify-center">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 rounded-[20px] bg-gradient-to-br from-[#F5C542] to-[#D6B25E] flex items-center justify-center shadow-xl shadow-[#F5C542]/25">
              <Shield size={40} className="text-[#0B0F1A]" strokeWidth={2.5} />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Setup Admin Auth</h1>
          <p className="text-gray-400 text-sm">
            Create auth user dan link dengan admin record
          </p>
        </div>

        <Card className="bg-black/20 backdrop-blur-xl border border-[#D6B25E]/15">
          <form onSubmit={handleSubmit} className="space-y-4">
            {result && (
              <div
                className={`p-4 rounded-xl flex items-start space-x-3 ${
                  result.success
                    ? 'bg-green-500/10 border border-green-500/30'
                    : 'bg-red-500/10 border border-red-500/30'
                }`}
              >
                {result.success ? (
                  <CheckCircle className="text-green-400 flex-shrink-0 mt-0.5" size={20} />
                ) : (
                  <AlertCircle className="text-red-400 flex-shrink-0 mt-0.5" size={20} />
                )}
                <div className="flex-1">
                  <p
                    className={`text-sm font-medium ${
                      result.success ? 'text-green-400' : 'text-red-400'
                    }`}
                  >
                    {result.message}
                  </p>
                  {result.success && (
                    <a
                      href="/admin/login"
                      className="text-[#F5C542] text-sm underline mt-2 inline-block hover:text-[#D6B25E]"
                    >
                      Go to Admin Login →
                    </a>
                  )}
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email Admin
              </label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <Input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                minLength={8}
                placeholder="Minimal 8 karakter"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Full Name
              </label>
              <Input
                type="text"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Secret Key
              </label>
              <Input
                type="password"
                value={formData.secretKey}
                onChange={(e) => setFormData({ ...formData, secretKey: e.target.value })}
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Gunakan: CTGOLD_ADMIN_SETUP_2026
              </p>
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-[#F5C542] to-[#D6B25E] text-[#0B0F1A] font-semibold py-3 hover:opacity-90 disabled:opacity-50"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center space-x-2">
                  <Loader className="animate-spin" size={18} />
                  <span>Setting up...</span>
                </span>
              ) : (
                'Setup Admin Auth'
              )}
            </Button>
          </form>

          <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
            <h3 className="text-sm font-semibold text-blue-400 mb-2">ℹ️ Info</h3>
            <ul className="text-xs text-blue-300 space-y-1">
              <li>• Function ini akan create auth user untuk admin</li>
              <li>• Jika admin record sudah ada, akan di-link dengan auth user baru</li>
              <li>• Jika auth user sudah ada, akan return message bahwa user sudah terdaftar</li>
              <li>• Setelah berhasil, silakan login di halaman admin login</li>
            </ul>
          </div>
        </Card>
      </div>
    </div>
  );
}
