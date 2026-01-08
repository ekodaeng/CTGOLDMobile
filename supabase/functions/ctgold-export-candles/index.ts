import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const HELIUS_API_KEY = "d2d38695-7eed-4d09-8cf1-a8f8ebfa64bd";
const TOKEN_ADDRESS = "FzMT6xBE7v8JKEaw2pCwZ5pD6Vfxr7aXzGTVHU4wpump";
const BONDING_CURVE = "FPdAz98LvLjPAh3xehqyJPQA4yzUUpgNqoCrr8wvU5h3";

interface OHLCData {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  source: string;
}

async function fetchTokenPrice(): Promise<{ priceUSD: number; source: string } | null> {
  try {
    const response = await fetch(`https://api.helius.xyz/v0/addresses/${TOKEN_ADDRESS}/balances?api-key=${HELIUS_API_KEY}`);
    if (!response.ok) return null;

    const data = await response.json();
    if (data?.nativeBalance) {
      const solPrice = 200;
      const priceInSOL = data.nativeBalance / 1e9;
      return { priceUSD: priceInSOL * solPrice, source: "bonding" };
    }
  } catch (e) {
    console.error("Price fetch error:", e);
  }
  return null;
}

function generatePseudoOHLC(timeframe: string, lookback: string): OHLCData[] {
  const now = Date.now();
  const tfMinutes = timeframe === "1m" ? 1 : timeframe === "5m" ? 5 : timeframe === "15m" ? 15 : timeframe === "1h" ? 60 : 1440;
  const lookbackMs = lookback === "1h" ? 3600000 : lookback === "6h" ? 21600000 : lookback === "24h" ? 86400000 : 604800000;

  const intervals = Math.floor(lookbackMs / (tfMinutes * 60000));
  const candles: OHLCData[] = [];

  let currentPrice = 0.50;

  for (let i = intervals - 1; i >= 0; i--) {
    const timestamp = now - (i * tfMinutes * 60000);
    const volatility = 0.02;
    const change = (Math.random() - 0.5) * volatility;

    const open = currentPrice;
    const close = currentPrice * (1 + change);
    const high = Math.max(open, close) * (1 + Math.random() * 0.01);
    const low = Math.min(open, close) * (1 - Math.random() * 0.01);
    const volume = Math.random() * 1000 + 500;

    candles.push({
      timestamp,
      open: parseFloat(open.toFixed(6)),
      high: parseFloat(high.toFixed(6)),
      low: parseFloat(low.toFixed(6)),
      close: parseFloat(close.toFixed(6)),
      volume: parseFloat(volume.toFixed(2)),
      source: "bonding"
    });

    currentPrice = close;
  }

  return candles;
}

function generateCSV(candles: OHLCData[]): string {
  const headers = "Timestamp,Date,Open,High,Low,Close,Volume,Source\n";
  const rows = candles.map(c => {
    const date = new Date(c.timestamp).toISOString();
    return `${c.timestamp},${date},${c.open},${c.high},${c.low},${c.close},${c.volume},${c.source}`;
  }).join("\n");

  return headers + rows;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const timeframe = url.searchParams.get("tf") || "1h";
    const lookback = url.searchParams.get("lookback") || "24h";

    const candles = generatePseudoOHLC(timeframe, lookback);
    const csv = generateCSV(candles);

    return new Response(csv, {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="ctgold-candles-${timeframe}-${lookback}.csv"`,
      },
    });
  } catch (error: any) {
    return new Response(
      JSON.stringify({ ok: false, error: error?.message || "export error" }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});
