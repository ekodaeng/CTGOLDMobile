import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowDownCircle, DollarSign, RefreshCw, AlertCircle, Copy, Check, TrendingUp } from 'lucide-react';
import GlassCard from '../components/GlassCard';
import GoldButton from '../components/GoldButton';
import BottomNavWeb3 from '../components/BottomNavWeb3';
import { useWallet } from '../contexts/WalletContext';
import { useTokenPrice } from '../hooks/useTokenPrice';
import { supabase } from '../lib/supabaseClient';

const DEFAULT_EXCHANGE_RATE = 16500;

export default function Web3Deposit() {
  const { walletAddress, userData } = useWallet();
  const { price, loading, isFallback, refresh } = useTokenPrice();
  const [amount, setAmount] = useState('');
  const [exchangeRate, setExchangeRate] = useState(DEFAULT_EXCHANGE_RATE);
  const [refreshing, setRefreshing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [qrisGenerated, setQrisGenerated] = useState(false);

  useEffect(() => {
    loadExchangeRate();
  }, []);

  const loadExchangeRate = async () => {
    const { data, error } = await supabase
      .from('admin_settings')
      .select('value')
      .eq('key', 'exchange_rate_idr')
      .maybeSingle();

    if (!error && data?.value) {
      setExchangeRate(parseFloat(data.value));
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await refresh();
    await loadExchangeRate();
    setTimeout(() => setRefreshing(false), 1000);
  };

  const calculateIDR = () => {
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) return 0;
    return amountNum * price * exchangeRate;
  };

  const handleGenerateQRIS = () => {
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      alert('Please enter a valid amount');
      return;
    }
    setQrisGenerated(true);
  };

  const handleCopyAddress = () => {
    if (walletAddress) {
      navigator.clipboard.writeText(walletAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatPrice = (value: number) => {
    return value < 0.01 ? value.toFixed(6) : value.toFixed(4);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white pb-32">
      <div className="absolute inset-0 bg-gradient-to-br from-[#FFD700]/5 via-transparent to-[#FDB931]/5" />
      <div className="absolute top-0 left-0 w-96 h-96 bg-[#FFD700]/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#FDB931]/10 rounded-full blur-3xl animate-pulse delay-1000" />

      <div className="relative z-10 max-w-md mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center mb-8"
        >
          <div>
            <h1 className="text-2xl font-bold mb-1">Deposit CTGOLD</h1>
            <p className="text-sm text-gray-400">Buy CTGOLD tokens with IDR</p>
          </div>
          <button
            onClick={handleRefresh}
            className="p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
          >
            <RefreshCw size={20} className={`text-[#FFD700] ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <GlassCard className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <TrendingUp size={20} className="text-[#FFD700]" />
                <span className="text-sm text-gray-400">Current Market Price</span>
              </div>
              {isFallback && (
                <span className="text-xs px-2 py-1 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  Fallback
                </span>
              )}
            </div>

            {loading ? (
              <div className="flex items-center gap-2 text-gray-400">
                <RefreshCw size={16} className="animate-spin" />
                <span className="text-sm">Loading price...</span>
              </div>
            ) : (
              <>
                <div className="flex items-baseline gap-2 mb-2">
                  <DollarSign size={24} className="text-[#FFD700]" />
                  <span className="text-3xl font-bold text-[#FFD700]">{formatPrice(price)}</span>
                  <span className="text-gray-400">USD</span>
                </div>
                {isFallback && (
                  <div className="flex items-center gap-2 text-amber-400 text-xs mt-2">
                    <AlertCircle size={14} />
                    <span>Using fallback price - Jupiter API unavailable</span>
                  </div>
                )}
              </>
            )}

            <div className="mt-4 pt-4 border-t border-white/10">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Exchange Rate:</span>
                <span className="font-semibold">{formatCurrency(exchangeRate)}</span>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <GlassCard className="p-6">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <ArrowDownCircle size={20} className="text-[#FFD700]" />
              Deposit Calculator
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Amount (CTGOLD)</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Enter amount"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#FFD700] transition-all"
                  min="0"
                  step="any"
                />
              </div>

              {amount && parseFloat(amount) > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="p-4 bg-gradient-to-r from-[#FFD700]/10 to-[#FDB931]/10 rounded-xl border border-[#FFD700]/30"
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-400">You will need to pay:</span>
                  </div>
                  <div className="text-2xl font-bold text-[#FFD700]">
                    {formatCurrency(calculateIDR())}
                  </div>
                  <div className="text-xs text-gray-500 mt-2">
                    {parseFloat(amount).toLocaleString()} CTGOLD × ${formatPrice(price)} × {exchangeRate.toLocaleString()} IDR
                  </div>
                </motion.div>
              )}

              <GoldButton
                onClick={handleGenerateQRIS}
                className="w-full"
                disabled={!amount || parseFloat(amount) <= 0 || loading}
              >
                Generate Payment QR
              </GoldButton>
            </div>
          </GlassCard>
        </motion.div>

        {qrisGenerated && amount && parseFloat(amount) > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="mb-6"
          >
            <GlassCard className="p-6">
              <h3 className="text-lg font-bold mb-4 text-center">Payment Instructions</h3>

              <div className="space-y-4">
                <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                  <div className="flex items-center justify-center h-48 mb-4">
                    <div className="text-center">
                      <div className="w-40 h-40 bg-white rounded-xl flex items-center justify-center mx-auto mb-2">
                        <span className="text-6xl">QR</span>
                      </div>
                      <p className="text-xs text-gray-400">QRIS Payment Code</p>
                    </div>
                  </div>

                  <div className="text-center mb-4">
                    <p className="text-sm text-gray-400 mb-1">Total Payment</p>
                    <p className="text-2xl font-bold text-[#FFD700]">{formatCurrency(calculateIDR())}</p>
                  </div>
                </div>

                <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
                  <h4 className="font-semibold mb-2 flex items-center gap-2 text-blue-400">
                    <AlertCircle size={16} />
                    Important Instructions
                  </h4>
                  <ol className="text-sm text-gray-300 space-y-2 list-decimal list-inside">
                    <li>Scan the QRIS code with your banking app</li>
                    <li>Enter the exact amount shown above</li>
                    <li>Complete the payment within 15 minutes</li>
                    <li>After payment, your wallet will be credited automatically</li>
                    <li>Please save your transaction receipt</li>
                  </ol>
                </div>

                <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                  <p className="text-xs text-gray-400 mb-2">Your Wallet Address:</p>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-mono text-gray-300 break-all flex-1">
                      {walletAddress?.substring(0, 16)}...{walletAddress?.substring(walletAddress.length - 8)}
                    </p>
                    <button
                      onClick={handleCopyAddress}
                      className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-all"
                    >
                      {copied ? (
                        <Check size={16} className="text-green-400" />
                      ) : (
                        <Copy size={16} className="text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <GlassCard className="p-6">
            <h3 className="text-lg font-bold mb-3">Token Information</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Token Name:</span>
                <span className="font-semibold">CTGOLD</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Network:</span>
                <span className="font-semibold">Solana</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Price Source:</span>
                <span className="font-semibold">Jupiter API</span>
              </div>
              <div className="flex justify-between items-start">
                <span className="text-gray-400">Mint Address:</span>
                <span className="font-mono text-xs text-gray-300 break-all text-right max-w-[60%]">
                  3HDPg...pump
                </span>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      </div>

      <BottomNavWeb3 />
    </div>
  );
}
