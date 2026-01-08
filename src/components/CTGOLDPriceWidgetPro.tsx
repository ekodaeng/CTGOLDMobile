import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type PriceData = {
  ok: boolean;
  source?: string;
  price?: { usd?: number; sol?: number };
};

type Candle = { t: number; o: number; h: number; l: number; c: number };

const TF_LIST = ["1m", "5m", "15m", "1h", "1d"];

export default function CTGOLDPriceWidgetPro() {
  const [price, setPrice] = useState<PriceData | null>(null);
  const [candles, setCandles] = useState<Candle[]>([]);
  const [tf, setTf] = useState("1m");
  const [openChart, setOpenChart] = useState(false);
  const [status, setStatus] = useState<"connected" | "reconnecting">(
    "reconnecting"
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ctgold-price`, {
      headers: {
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      },
    })
      .then(r => r.json())
      .then(data => {
        setPrice(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    setLoading(true);
    fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ctgold-ohlc?tf=${tf}&lookback=24h`, {
      headers: {
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      },
    })
      .then(r => r.json())
      .then(d => {
        setCandles(d.candles || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [tf]);

  useEffect(() => {
    const es = new EventSource(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ctgold-stream`
    );

    es.onopen = () => setStatus("connected");

    es.onmessage = (ev) => {
      try {
        const d = JSON.parse(ev.data);
        if (d?.price) setPrice(d);
        setStatus("connected");
      } catch (e) {
        console.error('Failed to parse SSE data', e);
      }
    };

    es.onerror = () => {
      setStatus("reconnecting");
      es.close();
    };

    return () => es.close();
  }, []);

  const badge =
    price?.source === "pumpfun-bonding"
      ? "Bonding Live"
      : price?.source === "raydium-dex"
      ? "DEX Live"
      : "—";

  const last = candles[candles.length - 1];
  const first = candles[0];
  const changePct =
    last && first ? ((last.c - first.o) / first.o) * 100 : 0;

  if (loading && !price) {
    return (
      <div className="rounded-2xl bg-gradient-to-b from-[#0B0F1A] to-[#070A0F] border border-yellow-500/20 shadow-xl p-4 animate-pulse">
        <div className="flex items-center justify-between mb-2">
          <div>
            <div className="h-6 w-24 bg-gray-700 rounded mb-1"></div>
            <div className="h-3 w-16 bg-gray-700 rounded"></div>
          </div>
          <div className="h-4 w-12 bg-gray-700 rounded"></div>
        </div>
        <div className="h-8 w-32 bg-gray-700 rounded mb-2"></div>
        <div className="h-4 w-24 bg-gray-700 rounded mb-3"></div>
        <div className="h-20 bg-gray-700 rounded mb-3"></div>
        <div className="h-10 bg-gray-700 rounded"></div>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-2xl bg-gradient-to-b from-[#0B0F1A] to-[#070A0F] border border-yellow-500/20 shadow-xl p-4 transition-all duration-300 hover:border-yellow-500/40">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h3 className="text-lg font-semibold text-yellow-400">
              CTGOLD
            </h3>
            <span className="text-xs text-gray-400">{badge}</span>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span
              className={`h-2 w-2 rounded-full ${
                status === "connected"
                  ? "bg-green-500"
                  : "bg-orange-400 animate-pulse"
              }`}
            />
            <span className="text-gray-400">
              {status === "connected" ? "Live" : "Reconnecting"}
            </span>
          </div>
        </div>

        <div className="mb-2">
          <div className="text-2xl font-bold text-white">
            ${price?.price?.usd?.toFixed(6) || "—"}
          </div>
          <div className="text-xs text-gray-400">
            {price?.price?.sol
              ? `${price.price.sol.toFixed(8)} SOL`
              : ""}
          </div>
        </div>

        <div
          className={`text-sm mb-3 font-semibold ${
            changePct >= 0 ? "text-green-400" : "text-red-400"
          }`}
        >
          {changePct >= 0 ? "▲" : "▼"} {changePct.toFixed(2)}% (24h)
        </div>

        <div className="h-20 mb-3 cursor-pointer hover:opacity-80 transition" onClick={() => setOpenChart(true)}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={candles.map(c => ({ v: c.c }))}>
              <Line type="monotone" dataKey="v" stroke="#FACC15" strokeWidth={2} dot={false} />
              <Tooltip
                contentStyle={{
                  background: "#0B0F1A",
                  border: "1px solid rgba(250,204,21,0.3)",
                  borderRadius: "8px",
                }}
                labelFormatter={() => ""}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <a
          href="https://pump.fun/3HDPgNPPZRZqvdyuiCNVPUSwCAFeJ6xPJH2VaLXEpump"
          target="_blank"
          rel="noopener noreferrer"
          className="block text-center rounded-xl bg-yellow-400 text-black font-semibold py-2 hover:bg-yellow-300 transition"
        >
          Buy CTGOLD
        </a>
      </div>

      {openChart && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center backdrop-blur-sm">
          <div className="bg-[#070A0F] w-full h-full md:h-[80%] md:w-[90%] md:max-w-6xl rounded-none md:rounded-2xl p-4 border border-yellow-500/20 shadow-2xl">
            <div className="flex justify-between items-center mb-3">
              <h4 className="text-yellow-400 font-semibold text-xl">
                CTGOLD Chart
              </h4>
              <button
                onClick={() => setOpenChart(false)}
                className="text-gray-400 hover:text-white text-2xl w-8 h-8 flex items-center justify-center hover:bg-gray-800 rounded-lg transition"
              >
                ✕
              </button>
            </div>

            <div className="flex gap-2 mb-3 flex-wrap">
              {TF_LIST.map((x) => (
                <button
                  key={x}
                  onClick={() => setTf(x)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition ${
                    tf === x
                      ? "bg-yellow-400 text-black"
                      : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                  }`}
                >
                  {x}
                </button>
              ))}
            </div>

            <div className="h-[calc(100%-100px)]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={candles}>
                  <XAxis
                    dataKey="t"
                    tickFormatter={(t) =>
                      new Date(t).toLocaleTimeString()
                    }
                    stroke="#888"
                  />
                  <YAxis domain={["auto", "auto"]} stroke="#888" />
                  <Tooltip
                    formatter={(v: number) => `$${v.toFixed(6)}`}
                    labelFormatter={(l) =>
                      new Date(l).toLocaleString()
                    }
                    contentStyle={{
                      background: "#0B0F1A",
                      border: "1px solid rgba(250,204,21,0.3)",
                      borderRadius: "8px",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="c"
                    stroke="#FACC15"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
