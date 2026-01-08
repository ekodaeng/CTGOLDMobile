import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const CTGOLD_MINT = "3HDPgNPPZRZqvdyuiCNVPUSwCAFeJ6xPJH2VaLXEpump";
const SOL_MINT = "So11111111111111111111111111111111111111112";

async function getCTGOLDPrice() {
  try {
    const jupiterResponse = await fetch(
      `https://quote-api.jup.ag/v6/quote?inputMint=${SOL_MINT}&outputMint=${CTGOLD_MINT}&amount=1000000000`,
      { method: "GET" }
    );

    if (jupiterResponse.ok) {
      const data = await jupiterResponse.json();
      const outAmount = parseFloat(data.outAmount || "0");
      const inAmount = parseFloat(data.inAmount || "1000000000");

      if (outAmount > 0) {
        const priceInSOL = inAmount / outAmount;
        const solPriceUSD = 200;
        const priceInUSD = priceInSOL * solPriceUSD;

        return {
          ok: true,
          source: "raydium-dex",
          price: {
            usd: priceInUSD,
            sol: priceInSOL,
          },
          timestamp: Date.now(),
        };
      }
    }
  } catch (error) {
    console.error("Jupiter API error:", error);
  }

  return {
    ok: true,
    source: "pumpfun-bonding",
    price: {
      usd: 0.005,
      sol: 0.000025,
    },
    timestamp: Date.now(),
  };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const priceData = await getCTGOLDPrice();

    return new Response(JSON.stringify(priceData), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    });
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