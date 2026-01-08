import { useState } from 'react';
import { Settings as SettingsIcon, Save, AlertTriangle, Shield } from 'lucide-react';

export default function AdminSettings() {
  const [settings, setSettings] = useState({
    appName: 'CTGOLD Admin',
    adminEmail: 'email@ctgold.io',
    maintenanceMode: false,
    allowRegistration: true,
    requireEmailVerification: false,
    maxLoginAttempts: 5,
    sessionTimeout: 30,
  });

  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    console.log('Saving settings:', settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
    alert('Pengaturan berhasil disimpan (dummy - belum tersimpan ke database)');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-100 mb-2">Pengaturan Sistem</h1>
        <p className="text-slate-400">Konfigurasi sistem dan keamanan CTGOLD</p>
      </div>

      <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
        <div className="flex items-start space-x-3">
          <AlertTriangle className="text-yellow-400 flex-shrink-0 mt-0.5" size={20} />
          <div>
            <p className="text-sm text-yellow-400 font-medium">Mode Development</p>
            <p className="text-xs text-slate-400 mt-1">
              Fitur ini dalam tahap pengembangan. Perubahan yang disimpan bersifat dummy dan belum
              terintegrasi dengan sistem.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
          <div className="flex items-center space-x-3 mb-6">
            <SettingsIcon className="text-yellow-500" size={24} />
            <h2 className="text-xl font-bold text-slate-100">Pengaturan Umum</h2>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Nama Aplikasi
              </label>
              <input
                type="text"
                value={settings.appName}
                onChange={(e) => setSettings({ ...settings, appName: e.target.value })}
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Email Admin</label>
              <input
                type="email"
                value={settings.adminEmail}
                onChange={(e) => setSettings({ ...settings, adminEmail: e.target.value })}
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500"
              />
            </div>

            <div>
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-sm font-medium text-slate-300">Mode Maintenance</span>
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={settings.maintenanceMode}
                    onChange={(e) =>
                      setSettings({ ...settings, maintenanceMode: e.target.checked })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-yellow-500/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-600"></div>
                </div>
              </label>
              <p className="text-xs text-slate-500 mt-1">
                Jika diaktifkan, website akan menampilkan halaman maintenance
              </p>
            </div>
          </div>
        </div>

        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
          <div className="flex items-center space-x-3 mb-6">
            <Shield className="text-blue-500" size={24} />
            <h2 className="text-xl font-bold text-slate-100">Keamanan</h2>
          </div>

          <div className="space-y-6">
            <div>
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-sm font-medium text-slate-300">Izinkan Registrasi</span>
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={settings.allowRegistration}
                    onChange={(e) =>
                      setSettings({ ...settings, allowRegistration: e.target.checked })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-yellow-500/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                </div>
              </label>
              <p className="text-xs text-slate-500 mt-1">
                Izinkan user baru mendaftar sebagai member
              </p>
            </div>

            <div>
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-sm font-medium text-slate-300">Verifikasi Email</span>
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={settings.requireEmailVerification}
                    onChange={(e) =>
                      setSettings({ ...settings, requireEmailVerification: e.target.checked })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-yellow-500/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                </div>
              </label>
              <p className="text-xs text-slate-500 mt-1">
                Wajibkan verifikasi email saat registrasi
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Maksimal Percobaan Login
              </label>
              <input
                type="number"
                min="3"
                max="10"
                value={settings.maxLoginAttempts}
                onChange={(e) =>
                  setSettings({ ...settings, maxLoginAttempts: parseInt(e.target.value) })
                }
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500"
              />
              <p className="text-xs text-slate-500 mt-1">
                Jumlah percobaan login gagal sebelum akun diblokir sementara
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Session Timeout (menit)
              </label>
              <input
                type="number"
                min="15"
                max="120"
                value={settings.sessionTimeout}
                onChange={(e) =>
                  setSettings({ ...settings, sessionTimeout: parseInt(e.target.value) })
                }
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500"
              />
              <p className="text-xs text-slate-500 mt-1">
                Durasi sesi login sebelum otomatis logout
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
        <h2 className="text-xl font-bold text-slate-100 mb-6">Info Sistem</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p className="text-xs text-slate-500 mb-1">Versi Aplikasi</p>
            <p className="text-sm font-semibold text-slate-200">v1.0.0</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-1">Database Status</p>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
              <p className="text-sm font-semibold text-emerald-400">Connected</p>
            </div>
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-1">Server Status</p>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
              <p className="text-sm font-semibold text-emerald-400">Online</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-4">
        <button
          onClick={handleSave}
          className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-slate-900 font-semibold rounded-lg transition-all transform hover:scale-105 shadow-lg"
        >
          <Save size={20} />
          <span>Simpan Pengaturan</span>
        </button>
      </div>

      {saved && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4">
          <p className="text-emerald-400 text-sm text-center font-medium">
            Pengaturan berhasil disimpan!
          </p>
        </div>
      )}
    </div>
  );
}
