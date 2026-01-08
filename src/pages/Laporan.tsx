import { useEffect, useState } from 'react';
import { FileText, Flame, TrendingUp, Calendar, ArrowDownCircle } from 'lucide-react';
import Card from '../components/Card';
import { supabase } from '@/lib/supabaseClient';
import type { Database } from '../lib/database.types';

type Report = Database['public']['Tables']['reports']['Row'];

export default function Laporan() {
  const [reports, setReports] = useState<Report[]>([]);
  const [filter, setFilter] = useState<'all' | 'buyback' | 'burn' | 'trading'>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReports();
  }, [filter]);

  const fetchReports = async () => {
    let query = supabase.from('reports').select('*').order('date', { ascending: false });

    if (filter !== 'all') {
      query = query.eq('type', filter);
    }

    const { data } = await query;
    if (data) setReports(data);
    setLoading(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const getReportIcon = (type: string) => {
    switch (type) {
      case 'buyback':
        return <ArrowDownCircle className="text-blue-400" size={20} />;
      case 'burn':
        return <Flame className="text-orange-400" size={20} />;
      case 'trading':
        return <TrendingUp className="text-green-400" size={20} />;
      default:
        return <FileText className="text-gray-400" size={20} />;
    }
  };

  const getReportBgColor = (type: string) => {
    switch (type) {
      case 'buyback':
        return 'bg-blue-500/20';
      case 'burn':
        return 'bg-orange-500/20';
      case 'trading':
        return 'bg-green-500/20';
      default:
        return 'bg-gray-500/20';
    }
  };

  const getReportBadgeColor = (type: string) => {
    switch (type) {
      case 'buyback':
        return 'bg-blue-500/20 text-blue-400';
      case 'burn':
        return 'bg-orange-500/20 text-orange-400';
      case 'trading':
        return 'bg-green-500/20 text-green-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  const getReportLabel = (type: string) => {
    switch (type) {
      case 'buyback':
        return 'Buyback CTGOLD';
      case 'burn':
        return 'Burn CTGOLD';
      case 'trading':
        return 'Trading';
      default:
        return type;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] pb-20">
        <div className="animate-pulse text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20 animate-fade-in">
      <div className="text-center space-y-2 animate-slide-up">
        <h1 className="text-3xl font-bold ctgold-gold">Laporan</h1>
        <p className="text-gray-400 text-sm">
          Transparansi Buyback, Burn & Trading
        </p>
      </div>

      <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-hide animate-slide-up stagger-1">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-150 whitespace-nowrap active:scale-95 ${
            filter === 'all'
              ? 'bg-ctgold-gold text-gray-900'
              : 'bg-gray-800 text-gray-400 hover:bg-gray-700 active:bg-gray-600'
          }`}
        >
          Semua
        </button>
        <button
          onClick={() => setFilter('buyback')}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-150 whitespace-nowrap active:scale-95 ${
            filter === 'buyback'
              ? 'bg-ctgold-gold text-gray-900'
              : 'bg-gray-800 text-gray-400 hover:bg-gray-700 active:bg-gray-600'
          }`}
        >
          Buyback CTGOLD
        </button>
        <button
          onClick={() => setFilter('burn')}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-150 whitespace-nowrap active:scale-95 ${
            filter === 'burn'
              ? 'bg-ctgold-gold text-gray-900'
              : 'bg-gray-800 text-gray-400 hover:bg-gray-700 active:bg-gray-600'
          }`}
        >
          Burn CTGOLD
        </button>
        <button
          onClick={() => setFilter('trading')}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-150 whitespace-nowrap active:scale-95 ${
            filter === 'trading'
              ? 'bg-ctgold-gold text-gray-900'
              : 'bg-gray-800 text-gray-400 hover:bg-gray-700 active:bg-gray-600'
          }`}
        >
          Trading
        </button>
      </div>

      <div className="space-y-4">
        {reports.length === 0 ? (
          <Card className="animate-slide-up stagger-2">
            <p className="text-gray-400 text-center py-8">
              Tidak ada laporan tersedia
            </p>
          </Card>
        ) : (
          reports.map((report, index) => (
            <Card key={report.id} className={`animate-slide-up stagger-${Math.min(index + 2, 6)}`}>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className={`p-2 rounded-lg flex-shrink-0 ${getReportBgColor(report.type)}`}>
                    {getReportIcon(report.type)}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-white mb-1">{report.title}</h3>
                    <p className="text-gray-400 text-sm">{report.description}</p>
                  </div>
                </div>

                {report.image_url && (
                  <div className="bg-gray-700/30 rounded-xl h-48 flex items-center justify-center border border-gray-700">
                    <FileText className="text-gray-600" size={48} />
                  </div>
                )}

                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-1 text-gray-500">
                    <Calendar size={14} />
                    <span>{formatDate(report.date)}</span>
                  </div>
                  <span className={`px-3 py-1 rounded-full ${getReportBadgeColor(report.type)}`}>
                    {getReportLabel(report.type)}
                  </span>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      <Card className="bg-gradient-to-br from-ctgold-gold-soft to-orange-500/10 border-ctgold-gold-soft animate-slide-up stagger-6">
        <div className="text-center space-y-2">
          <p className="text-gray-300 text-sm leading-relaxed">
            Semua laporan diupdate secara berkala untuk transparansi penuh kepada
            komunitas CTGOLD.
          </p>
        </div>
      </Card>
    </div>
  );
}
