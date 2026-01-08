import { Link } from 'react-router-dom';
import { ArrowLeft, BookOpen, Play } from 'lucide-react';

export default function Tutorial() {
  const tutorials = [
    {
      title: 'Cara Registrasi Member',
      duration: '5 menit',
      description: 'Panduan lengkap mendaftar sebagai member CTGOLD',
    },
    {
      title: 'Dasar-dasar Trading Emas',
      duration: '15 menit',
      description: 'Memahami konsep fundamental trading emas',
    },
    {
      title: 'Membaca Signal Trading',
      duration: '10 menit',
      description: 'Cara membaca dan mengeksekusi signal dengan tepat',
    },
    {
      title: 'Money Management',
      duration: '12 menit',
      description: 'Strategi mengelola modal dan risiko trading',
    },
    {
      title: 'Technical Analysis Basic',
      duration: '20 menit',
      description: 'Pengenalan indikator dan chart pattern',
    },
  ];

  return (
    <div className="px-4 pt-6 pb-20">
      <Link to="/" className="inline-flex items-center gap-2 text-amber-500 hover:text-amber-400 mb-6">
        <ArrowLeft size={20} />
        <span>Kembali</span>
      </Link>

      <div className="flex items-center gap-3 mb-6">
        <BookOpen className="text-amber-500" size={32} />
        <h1 className="text-3xl font-bold text-white">Tutorial</h1>
      </div>

      <div className="space-y-4">
        {tutorials.map((tutorial, idx) => (
          <div
            key={idx}
            className="bg-gray-800 rounded-lg p-6 hover:bg-gray-750 transition-colors cursor-pointer"
          >
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-amber-500/20 rounded-full flex items-center justify-center">
                <Play className="text-amber-500" size={24} />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white mb-1">{tutorial.title}</h3>
                <p className="text-gray-400 text-sm mb-2">{tutorial.description}</p>
                <span className="text-amber-500 text-sm font-medium">{tutorial.duration}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
