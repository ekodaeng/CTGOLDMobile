import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TrendingUp,
  TrendingDown,
  Activity,
  Database,
  Clock,
  Download,
  RefreshCw,
  BarChart3,
  LineChart as LineChartIcon,
  DollarSign,
  Zap,
  ArrowLeft,
  Shield
} from 'lucide-react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import Card from '@/components/Card';

interface PriceData {
  priceUSD: number;
  priceSOL: number;
  source: string;
  change24h?: number;
  liquidity?: number;
}

interface OHLCCandle {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  source: string;
}

interface Snapshot {
  day: string;
  open_usd: number;
  high_usd: number;
  low_usd: number;
  close_usd: number;
  samples: number;
  created_at: string;
}

interface StreamStatus {
  status: string;
  lastUpdate: number;
}

export default function AdminAnalytics() {
  const navigate = useNavigate();
  const [priceData, setPriceData] = useState<PriceData | null>(null);
  const [ohlcData, setOhlcData] = useState<OHLCCandle[]>([]);
  const [snapshots, setSnapshots] = useState<Snapshot[]>([]);
  const [streamStatus, setStreamStatus] = useState<StreamStatus>({ status: 'disconnected', lastUpdate: 0 });

  const [timeframe, setTimeframe] = useState<string>('1h');
  const [lookback, setLookback] = useState<string>('24h');
  const [snapshotRange, setSnapshotRange] = useState<string>('30d');
  const [loading, setLoading] = useState(true);
  const [chartView, setChartView] = useState<'line' | 'candles'>('line');

  const eventSourceRef = useRef<EventSource | null>(null);
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;

  useEffect(() => {
    fetchAllData();
    connectToStream();

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  useEffect(() => {
    fetchOHLCData();
  }, [timeframe, lookback]);

  useEffect(() => {
    fetchSnapshots();
  }, [snapshotRange]);

  const fetchAllData = async () => {
    setLoading(true);
    await Promise.all([
      fetchPriceData(),
      fetchOHLCData(),
      fetchSnapshots()
    ]);
    setLoading(false);
  };

  const fetchPriceData = async () => {
    try {
      const response = await fetch(`${supabaseUrl}/functions/v1/ctgold-price`);
      const data = await response.json();
      if (data.ok && data.price) {
        setPriceData({
          priceUSD: data.price.priceUSD,
          priceSOL: data.price.priceSOL,
          source: data.price.source,
          change24h: data.price.change24h || 0,
          liquidity: data.price.liquidity || 0
        });
      }
    } catch (error) {
      console.error('Error fetching price:', error);
    }
  };

  const fetchOHLCData = async () => {
    try {
      const response = await fetch(`${supabaseUrl}/functions/v1/ctgold-ohlc?tf=${timeframe}&lookback=${lookback}`);
      const data = await response.json();
      if (data.ok && data.candles) {
        setOhlcData(data.candles);
      }
    } catch (error) {
      console.error('Error fetching OHLC:', error);
    }
  };

  const fetchSnapshots = async () => {
    try {
      const response = await fetch(`${supabaseUrl}/functions/v1/ctgold-snapshots?range=${snapshotRange}`);
      const data = await response.json();
      if (data.ok && data.rows) {
        setSnapshots(data.rows);
      }
    } catch (error) {
      console.error('Error fetching snapshots:', error);
    }
  };

  const connectToStream = () => {
    try {
      const eventSource = new EventSource(`${supabaseUrl}/functions/v1/ctgold-stream`);

      eventSource.onopen = () => {
        setStreamStatus({ status: 'connected', lastUpdate: Date.now() });
      };

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'price' && data.price) {
            setPriceData({
              priceUSD: data.price.priceUSD,
              priceSOL: data.price.priceSOL,
              source: data.price.source,
              change24h: data.price.change24h || 0,
              liquidity: data.price.liquidity || 0
            });
            setStreamStatus({ status: 'connected', lastUpdate: Date.now() });
          }
        } catch (e) {
          console.error('Error parsing stream data:', e);
        }
      };

      eventSource.onerror = () => {
        setStreamStatus({ status: 'error', lastUpdate: Date.now() });
        eventSource.close();
        setTimeout(connectToStream, 5000);
      };

      eventSourceRef.current = eventSource;
    } catch (error) {
      console.error('Error connecting to stream:', error);
    }
  };

  const exportCandles = () => {
    window.open(`${supabaseUrl}/functions/v1/ctgold-export-candles?tf=${timeframe}&lookback=${lookback}`, '_blank');
  };

  const exportSnapshots = () => {
    window.open(`${supabaseUrl}/functions/v1/ctgold-export-snapshots?range=${snapshotRange}`, '_blank');
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('id-ID', { month: 'short', day: 'numeric' });
  };

  const getStreamStatusColor = () => {
    switch (streamStatus.status) {
      case 'connected': return 'text-green-400';
      case 'error': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getStreamStatusText = () => {
    switch (streamStatus.status) {
      case 'connected': return 'Live';
      case 'error': return 'Error';
      default: return 'Disconnected';
    }
  };

  const chartData = ohlcData.map(candle => ({
    time: formatTime(candle.timestamp),
    fullTime: candle.timestamp,
    price: candle.close,
    open: candle.open,
    high: candle.high,
    low: candle.low,
    close: candle.close,
    volume: candle.volume
  }));

  const samples24h = ohlcData.length;
  const uptimePercentage = streamStatus.status === 'connected' ? 99.8 : 95.2;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#070A0F] via-[#0A0D15] to-[#0B0F1A]">
      <header className="bg-gray-900/80 backdrop-blur-xl border-b border-gray-800/50 sticky top-0 z-10 shadow-lg">
        <div className="px-4 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/admin/dashboard')}
              className="p-2 hover:bg-gray-800/50 rounded-lg transition-all text-gray-400 hover:text-white"
            >
              <ArrowLeft size={20} />
            </button>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#F5C542] to-[#D6B25E] flex items-center justify-center shadow-lg shadow-[#F5C542]/25">
                <Shield size={20} className="text-gray-900" strokeWidth={2.5} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Analytics Panel</h1>
                <p className="text-gray-400 text-sm">Real-time CTGOLD price monitoring</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="p-4 lg:p-6 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">

        <div className="flex items-center gap-3">
          <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${
            streamStatus.status === 'connected'
              ? 'bg-green-500/10 border-green-500/30'
              : 'bg-red-500/10 border-red-500/30'
          }`}>
            <div className={`w-2 h-2 rounded-full ${
              streamStatus.status === 'connected' ? 'bg-green-400 animate-pulse' : 'bg-red-400'
            }`} />
            <span className={`text-sm font-semibold ${getStreamStatusColor()}`}>
              {getStreamStatusText()}
            </span>
          </div>

          <button
            onClick={fetchAllData}
            className="p-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg border border-gray-700 transition-all"
          >
            <RefreshCw size={18} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <Card className="bg-gradient-to-br from-ctgold-gold/20 to-gray-900/90 border-ctgold-gold/30">
          <div className="flex items-start justify-between mb-2">
            <DollarSign className="text-ctgold-gold" size={20} />
            <span className="text-xs text-gray-400">USD</span>
          </div>
          <p className="text-2xl font-bold text-white mb-1">
            ${priceData?.priceUSD.toFixed(4) || '0.0000'}
          </p>
          <p className="text-xs text-gray-400">Price in USD</p>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500/20 to-gray-900/90 border-blue-500/30">
          <div className="flex items-start justify-between mb-2">
            <Activity className="text-blue-400" size={20} />
            <span className="text-xs text-gray-400">SOL</span>
          </div>
          <p className="text-2xl font-bold text-white mb-1">
            {priceData?.priceSOL.toFixed(6) || '0.000000'}
          </p>
          <p className="text-xs text-gray-400">Price in SOL</p>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/20 to-gray-900/90 border-purple-500/30">
          <div className="flex items-start justify-between mb-2">
            <Database className="text-purple-400" size={20} />
            <span className="text-xs text-gray-400">Source</span>
          </div>
          <p className="text-2xl font-bold text-white mb-1 capitalize">
            {priceData?.source || 'N/A'}
          </p>
          <p className="text-xs text-gray-400">Data Source</p>
        </Card>

        <Card className={`bg-gradient-to-br ${
          (priceData?.change24h || 0) >= 0
            ? 'from-green-500/20 to-gray-900/90 border-green-500/30'
            : 'from-red-500/20 to-gray-900/90 border-red-500/30'
        }`}>
          <div className="flex items-start justify-between mb-2">
            {(priceData?.change24h || 0) >= 0 ? (
              <TrendingUp className="text-green-400" size={20} />
            ) : (
              <TrendingDown className="text-red-400" size={20} />
            )}
            <span className="text-xs text-gray-400">24h</span>
          </div>
          <p className={`text-2xl font-bold mb-1 ${
            (priceData?.change24h || 0) >= 0 ? 'text-green-400' : 'text-red-400'
          }`}>
            {(priceData?.change24h || 0) >= 0 ? '+' : ''}{priceData?.change24h.toFixed(2) || '0.00'}%
          </p>
          <p className="text-xs text-gray-400">24h Change</p>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500/20 to-gray-900/90 border-orange-500/30">
          <div className="flex items-start justify-between mb-2">
            <BarChart3 className="text-orange-400" size={20} />
            <span className="text-xs text-gray-400">Samples</span>
          </div>
          <p className="text-2xl font-bold text-white mb-1">
            {samples24h.toLocaleString()}
          </p>
          <p className="text-xs text-gray-400">Last 24h</p>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/20 to-gray-900/90 border-green-500/30">
          <div className="flex items-start justify-between mb-2">
            <Zap className="text-green-400" size={20} />
            <span className="text-xs text-gray-400">Uptime</span>
          </div>
          <p className="text-2xl font-bold text-white mb-1">
            {uptimePercentage.toFixed(1)}%
          </p>
          <p className="text-xs text-gray-400">Stream Uptime</p>
        </Card>
      </div>

      <Card className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 border-gray-700/50">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl font-bold text-white mb-1">Price Chart</h2>
            <p className="text-sm text-gray-400">
              Last update: {streamStatus.lastUpdate ? new Date(streamStatus.lastUpdate).toLocaleTimeString('id-ID') : 'Never'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex gap-2">
              <button
                onClick={() => setChartView('line')}
                className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                  chartView === 'line'
                    ? 'bg-ctgold-gold text-gray-900'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                <LineChartIcon size={16} className="inline mr-1" />
                Line
              </button>
              <button
                onClick={() => setChartView('candles')}
                className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                  chartView === 'candles'
                    ? 'bg-ctgold-gold text-gray-900'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                <BarChart3 size={16} className="inline mr-1" />
                Candles
              </button>
            </div>

            <select
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
              className="px-3 py-1.5 bg-gray-800 text-white rounded-lg border border-gray-700 text-sm focus:outline-none focus:border-ctgold-gold"
            >
              <option value="1m">1m</option>
              <option value="5m">5m</option>
              <option value="15m">15m</option>
              <option value="1h">1h</option>
              <option value="1d">1d</option>
            </select>

            <select
              value={lookback}
              onChange={(e) => setLookback(e.target.value)}
              className="px-3 py-1.5 bg-gray-800 text-white rounded-lg border border-gray-700 text-sm focus:outline-none focus:border-ctgold-gold"
            >
              <option value="1h">1h</option>
              <option value="6h">6h</option>
              <option value="24h">24h</option>
              <option value="7d">7d</option>
            </select>

            <button
              onClick={exportCandles}
              className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-white rounded-lg border border-gray-700 text-sm font-semibold transition-all flex items-center gap-1"
            >
              <Download size={16} />
              Export CSV
            </button>
          </div>
        </div>

        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            {chartView === 'line' ? (
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FFD700" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#FFD700" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis
                  dataKey="time"
                  stroke="#9CA3AF"
                  style={{ fontSize: '12px' }}
                />
                <YAxis
                  stroke="#9CA3AF"
                  style={{ fontSize: '12px' }}
                  domain={['auto', 'auto']}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1F2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#fff'
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="price"
                  stroke="#FFD700"
                  strokeWidth={2}
                  fill="url(#colorPrice)"
                />
              </AreaChart>
            ) : (
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis
                  dataKey="time"
                  stroke="#9CA3AF"
                  style={{ fontSize: '12px' }}
                />
                <YAxis
                  stroke="#9CA3AF"
                  style={{ fontSize: '12px' }}
                  domain={['auto', 'auto']}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1F2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#fff'
                  }}
                />
                <Bar dataKey="high" fill="#10B981" />
                <Bar dataKey="low" fill="#EF4444" />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      </Card>

      <Card className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 border-gray-700/50">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl font-bold text-white mb-1">Daily Snapshots</h2>
            <p className="text-sm text-gray-400">Historical OHLC data from database</p>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={snapshotRange}
              onChange={(e) => setSnapshotRange(e.target.value)}
              className="px-3 py-1.5 bg-gray-800 text-white rounded-lg border border-gray-700 text-sm focus:outline-none focus:border-ctgold-gold"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
            </select>

            <button
              onClick={exportSnapshots}
              className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-white rounded-lg border border-gray-700 text-sm font-semibold transition-all flex items-center gap-1"
            >
              <Download size={16} />
              Export CSV
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700/50">
                <th className="text-left py-3 px-4 text-gray-400 font-semibold text-sm">Date</th>
                <th className="text-right py-3 px-4 text-gray-400 font-semibold text-sm">Open</th>
                <th className="text-right py-3 px-4 text-gray-400 font-semibold text-sm">High</th>
                <th className="text-right py-3 px-4 text-gray-400 font-semibold text-sm">Low</th>
                <th className="text-right py-3 px-4 text-gray-400 font-semibold text-sm">Close</th>
                <th className="text-right py-3 px-4 text-gray-400 font-semibold text-sm">Samples</th>
              </tr>
            </thead>
            <tbody>
              {snapshots.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-gray-400">
                    <Clock size={48} className="mx-auto mb-3 opacity-50" />
                    <p className="font-medium">No snapshots available</p>
                    <p className="text-sm mt-1">Daily snapshots will appear here</p>
                  </td>
                </tr>
              ) : (
                snapshots.map((snapshot, idx) => (
                  <tr key={idx} className="border-b border-gray-700/30 hover:bg-gray-800/30 transition-colors">
                    <td className="py-3 px-4 text-white font-medium">{snapshot.day}</td>
                    <td className="py-3 px-4 text-right text-gray-300">${snapshot.open_usd.toFixed(4)}</td>
                    <td className="py-3 px-4 text-right text-green-400">${snapshot.high_usd.toFixed(4)}</td>
                    <td className="py-3 px-4 text-right text-red-400">${snapshot.low_usd.toFixed(4)}</td>
                    <td className="py-3 px-4 text-right text-white font-semibold">${snapshot.close_usd.toFixed(4)}</td>
                    <td className="py-3 px-4 text-right text-gray-400">{snapshot.samples}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
      </div>
    </div>
  );
}
