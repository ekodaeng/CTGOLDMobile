import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

type Candle = {
  t: number;
  o: number;
  h: number;
  l: number;
  c: number;
  v?: number;
};

function generateOHLC(tf: string, lookback: string): Candle[] {
  const basePrice = 0.005;
  const volatility = 0.0002;

  const intervals: { [key: string]: number } = {
    "1m": 60 * 1000,
    "5m": 5 * 60 * 1000,
    "15m": 15 * 60 * 1000,
    "1h": 60 * 60 * 1000,
    "1d": 24 * 60 * 60 * 1000,
  };

  const lookbackTime: { [key: string]: number } = {
    "1h": 1 * 60 * 60 * 1000,
    "24h": 24 * 60 * 60 * 1000,
    "7d": 7 * 24 * 60 * 60 * 1000,
  };

  const interval = intervals[tf] || intervals["1m"];
  const lookbackMs = lookbackTime[lookback] || lookbackTime["24h"];

  const now = Date.now();
  const candleCount = Math.floor(lookbackMs / interval);
  const candles: Candle[] = [];

  let currentPrice = basePrice;

  for (let i = candleCount; i > 0; i--) {
    const timestamp = now - (i * interval);

    const open = currentPrice;
    const change = (Math.random() - 0.5) * volatility;
    const close = open + change;
    const high = Math.max(open, close) + Math.random() * volatility * 0.5;
    const low = Math.min(open, close) - Math.random() * volatility * 0.5;
    const volume = Math.random() * 10000 + 1000;

    candles.push({
      t: timestamp,
      o: Math.max(0, open),
      h: Math.max(0, high),
      l: Math.max(0, low),
      c: Math.max(0, close),
      v: volume,
    });

    currentPrice = close;
  }

  return candles;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const url = new URL(req.url);
    const tf = url.searchParams.get("tf") || "1m";
    const lookback = url.searchParams.get("lookback") || "24h";

    const candles = generateOHLC(tf, lookback);

    return new Response(
      JSON.stringify({
        ok: true,
        tf,
        lookback,
        candles,
        count: candles.length,
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        ok: false,
        error: error.message,
      }),
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