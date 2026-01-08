import { useState } from 'react';
import { FileText, Save, AlertCircle } from 'lucide-react';

export default function AdminContent() {
  const [content, setContent] = useState({
    homeTitle: 'CTGOLD - Community Token Gold',
    homeDescription: 'Platform trading emas digital terpercaya',
    aboutTitle: 'Tentang CTGOLD',
    aboutDescription: 'CTGOLD adalah komunitas trading emas digital yang profesional',
    announcementTitle: 'Pengumuman Terbaru',
    announcementText: 'Platform sedang dalam tahap pengembangan',
  });

  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    console.log('Saving content:', content);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
    alert('Konten berhasil disimpan (dummy - belum tersimpan ke database)');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-100 mb-2">Konten Website</h1>
        <p className="text-slate-400">Kelola konten yang ditampilkan di website CTGOLD</p>
      </div>

      <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
        <div className="flex items-start space-x-3">
          <AlertCircle className="text-yellow-400 flex-shrink-0 mt-0.5" size={20} />
          <div>
            <p className="text-sm text-yellow-400 font-medium">Mode Development</p>
            <p className="text-xs text-slate-400 mt-1">
              Fitur ini dalam tahap pengembangan. Perubahan yang disimpan bersifat dummy dan belum
              terintegrasi dengan database.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
          <div className="flex items-center space-x-3 mb-6">
            <FileText className="text-yellow-500" size={24} />
            <h2 className="text-xl font-bold text-slate-100">Homepage Content</h2>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Judul Homepage
              </label>
              <input
                type="text"
                value={content.homeTitle}
                onChange={(e) => setContent({ ...content, homeTitle: e.target.value })}
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Deskripsi Homepage
              </label>
              <textarea
                value={content.homeDescription}
                onChange={(e) => setContent({ ...content, homeDescription: e.target.value })}
                rows={3}
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500"
              />
            </div>
          </div>
        </div>

        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
          <h2 className="text-xl font-bold text-slate-100 mb-6">About Page Content</h2>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Judul About
              </label>
              <input
                type="text"
                value={content.aboutTitle}
                onChange={(e) => setContent({ ...content, aboutTitle: e.target.value })}
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Deskripsi About
              </label>
              <textarea
                value={content.aboutDescription}
                onChange={(e) => setContent({ ...content, aboutDescription: e.target.value })}
                rows={4}
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500"
              />
            </div>
          </div>
        </div>

        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
          <h2 className="text-xl font-bold text-slate-100 mb-6">Pengumuman</h2>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Judul Pengumuman
              </label>
              <input
                type="text"
                value={content.announcementTitle}
                onChange={(e) => setContent({ ...content, announcementTitle: e.target.value })}
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Isi Pengumuman
              </label>
              <textarea
                value={content.announcementText}
                onChange={(e) => setContent({ ...content, announcementText: e.target.value })}
                rows={4}
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <button
            onClick={handleSave}
            className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-slate-900 font-semibold rounded-lg transition-all transform hover:scale-105 shadow-lg"
          >
            <Save size={20} />
            <span>Simpan Perubahan</span>
          </button>
        </div>

        {saved && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4">
            <p className="text-emerald-400 text-sm text-center font-medium">
              Perubahan berhasil disimpan!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
