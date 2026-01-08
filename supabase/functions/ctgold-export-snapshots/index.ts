import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

function rangeToDays(range: string | null): number {
  switch ((range || "").toLowerCase()) {
    case "7d": return 7;
    case "30d": return 30;
    case "90d": return 90;
    default: return 30;
  }
}

function generateCSV(snapshots: any[]): string {
  const headers = "Day,Open USD,High USD,Low USD,Close USD,Samples,Created At\n";
  const rows = snapshots.map(s => {
    return `${s.day},${s.open_usd},${s.high_usd},${s.low_usd},${s.close_usd},${s.samples},${s.created_at}`;
  }).join("\n");

  return headers + rows;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const url = new URL(req.url);
    const range = url.searchParams.get("range");
    const days = rangeToDays(range);

    const { data, error } = await supabase
      .from("ctgold_daily_snapshots")
      .select("day, open_usd, high_usd, low_usd, close_usd, samples, created_at")
      .order("day", { ascending: false })
      .limit(days);

    if (error) {
      throw error;
    }

    const csv = generateCSV(data || []);

    return new Response(csv, {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="ctgold-snapshots-${range || '30d'}.csv"`,
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
