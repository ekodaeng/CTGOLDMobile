import { Link } from 'react-router-dom';
import { ArrowLeft, FileText } from 'lucide-react';

export default function Whitepaper() {
  return (
    <div className="px-4 pt-6 pb-20">
      <Link to="/" className="inline-flex items-center gap-2 text-amber-500 hover:text-amber-400 mb-6">
        <ArrowLeft size={20} />
        <span>Kembali</span>
      </Link>

      <div className="flex items-center gap-3 mb-6">
        <FileText className="text-amber-500" size={32} />
        <h1 className="text-3xl font-bold text-white">Whitepaper</h1>
      </div>

      <div className="bg-gray-800 rounded-lg p-6 space-y-4">
        <section>
          <h2 className="text-xl font-semibold text-amber-500 mb-3">CTGOLD Vision</h2>
          <p className="text-gray-300 leading-relaxed">
            CTGOLD adalah komunitas trading emas profesional yang berkomitmen untuk memberikan edukasi,
            tools, dan support kepada member dalam trading emas global.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-amber-500 mb-3">Mission</h2>
          <p className="text-gray-300 leading-relaxed">
            Memberdayakan trader Indonesia dengan pengetahuan, strategi, dan sistem yang terbukti
            untuk meraih profit konsisten di pasar emas internasional.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-amber-500 mb-3">Key Features</h2>
          <ul className="list-disc list-inside text-gray-300 space-y-2">
            <li>Signal trading real-time</li>
            <li>Edukasi komprehensif dari basic hingga advanced</li>
            <li>Community support 24/7</li>
            <li>Sistem buyback dan burn token</li>
            <li>Portfolio tracking tools</li>
          </ul>
        </section>
      </div>
    </div>
  );
}
