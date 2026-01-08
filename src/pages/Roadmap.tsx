import { Link } from 'react-router-dom';
import { ArrowLeft, Map, CheckCircle2, Circle } from 'lucide-react';

export default function Roadmap() {
  const phases = [
    {
      quarter: 'Q1 2026',
      title: 'Launch & Foundation',
      items: [
        { text: 'Platform launch', completed: true },
        { text: 'Member registration system', completed: true },
        { text: 'Basic trading signals', completed: false },
      ],
    },
    {
      quarter: 'Q2 2026',
      title: 'Feature Expansion',
      items: [
        { text: 'Advanced analytics dashboard', completed: false },
        { text: 'Mobile app development', completed: false },
        { text: 'Automated trading tools', completed: false },
      ],
    },
    {
      quarter: 'Q3 2026',
      title: 'Community Growth',
      items: [
        { text: 'Referral program', completed: false },
        { text: 'Educational content library', completed: false },
        { text: 'Weekly webinars', completed: false },
      ],
    },
    {
      quarter: 'Q4 2026',
      title: 'Global Expansion',
      items: [
        { text: 'Multi-language support', completed: false },
        { text: 'International partnerships', completed: false },
        { text: 'API for third-party integrations', completed: false },
      ],
    },
  ];

  return (
    <div className="px-4 pt-6 pb-20">
      <Link to="/" className="inline-flex items-center gap-2 text-amber-500 hover:text-amber-400 mb-6">
        <ArrowLeft size={20} />
        <span>Kembali</span>
      </Link>

      <div className="flex items-center gap-3 mb-6">
        <Map className="text-amber-500" size={32} />
        <h1 className="text-3xl font-bold text-white">Roadmap</h1>
      </div>

      <div className="space-y-6">
        {phases.map((phase, idx) => (
          <div key={idx} className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-amber-500 font-semibold">{phase.quarter}</span>
              <h2 className="text-xl font-bold text-white">{phase.title}</h2>
            </div>
            <ul className="space-y-2">
              {phase.items.map((item, itemIdx) => (
                <li key={itemIdx} className="flex items-center gap-3">
                  {item.completed ? (
                    <CheckCircle2 className="text-green-500" size={20} />
                  ) : (
                    <Circle className="text-gray-500" size={20} />
                  )}
                  <span className={item.completed ? 'text-gray-300' : 'text-gray-400'}>
                    {item.text}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
