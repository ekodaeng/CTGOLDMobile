import { Link } from 'react-router-dom';
import { ArrowLeft, HelpCircle, ChevronDown } from 'lucide-react';
import { useState } from 'react';

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    {
      question: 'Apa itu CTGOLD?',
      answer:
        'CTGOLD adalah komunitas trading emas profesional yang menyediakan signal, edukasi, dan tools untuk membantu member trading emas secara menguntungkan.',
    },
    {
      question: 'Bagaimana cara bergabung?',
      answer:
        'Anda dapat mendaftar melalui halaman registrasi, mengisi form, dan menunggu approval dari admin kami.',
    },
    {
      question: 'Apakah ada biaya keanggotaan?',
      answer:
        'Informasi biaya keanggotaan akan dijelaskan saat proses registrasi. Silakan hubungi admin untuk detail lebih lanjut.',
    },
    {
      question: 'Apa keuntungan menjadi member?',
      answer:
        'Member mendapat akses ke signal trading real-time, edukasi lengkap, community support, dan berbagai tools trading premium.',
    },
    {
      question: 'Berapa minimal modal untuk trading?',
      answer:
        'Minimal modal trading tergantung broker yang Anda gunakan. Kami menyarankan minimal $100-$500 untuk memulai.',
    },
    {
      question: 'Apakah ada garansi profit?',
      answer:
        'Trading memiliki risiko. Kami memberikan edukasi dan signal terbaik, namun profit tetap tergantung pada eksekusi dan manajemen risiko Anda.',
    },
  ];

  return (
    <div className="px-4 pt-6 pb-20">
      <Link to="/" className="inline-flex items-center gap-2 text-amber-500 hover:text-amber-400 mb-6">
        <ArrowLeft size={20} />
        <span>Kembali</span>
      </Link>

      <div className="flex items-center gap-3 mb-6">
        <HelpCircle className="text-amber-500" size={32} />
        <h1 className="text-3xl font-bold text-white">FAQ</h1>
      </div>

      <div className="space-y-3">
        {faqs.map((faq, idx) => (
          <div key={idx} className="bg-gray-800 rounded-lg overflow-hidden">
            <button
              onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
              className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-750 transition-colors"
            >
              <span className="text-white font-semibold">{faq.question}</span>
              <ChevronDown
                className={`text-amber-500 transition-transform ${
                  openIndex === idx ? 'rotate-180' : ''
                }`}
                size={20}
              />
            </button>
            {openIndex === idx && (
              <div className="px-6 pb-4 text-gray-300 leading-relaxed">{faq.answer}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
