import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

type Genus = "MASKULINUM" | "FEMININUM" | "NEUTRUM";

const GENUS_VALUES: Genus[] = ["MASKULINUM", "FEMININUM", "NEUTRUM"];

const END_TABLE_BY_GENUS: Record<Genus, string> = {
  MASKULINUM: "schimpfmeister_substantiv_maskulinum",
  FEMININUM: "schimpfmeister_substantiv_femininum",
  NEUTRUM: "schimpfmeister_substantiv_neutrum",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")
  ?? Deno.env.get("SUPABASE_ANON_KEY")
  ?? "";

if (!SUPABASE_URL || !SUPABASE_KEY) {

  throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY/SUPABASE_ANON_KEY env vars.");
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

function pickRandomGenus(): Genus {

  const index = Math.floor(Math.random() * GENUS_VALUES.length);
  return GENUS_VALUES[index];
}

function declineAdjectiveByGenus(adjektiv: string, genus: Genus): string {

  if (genus === "MASKULINUM") {

    return `${adjektiv}r`;
  }
  if (genus === "NEUTRUM") {

    return `${adjektiv}s`;
  }
  return adjektiv;
}

async function fetchRandomValue(table: string, column: "adjektiv" | "substantiv"): Promise<string> {

  const { count, error: countError } = await supabase
    .from(table)
    .select(column, { count: "exact", head: true });

  if (countError) {

    throw new Error(`Count failed for table ${table}: ${countError.message}`);
  }

  if (!count || count < 1) {

    throw new Error(`No rows found in table ${table}.`);
  }

  const randomIndex = Math.floor(Math.random() * count);

  const { data, error } = await supabase
    .from(table)
    .select(column)
    .order("id", { ascending: true })
    .range(randomIndex, randomIndex)
    .limit(1)
    .maybeSingle();

  if (error) {

    throw new Error(`Select failed for table ${table}: ${error.message}`);
  }

  const value = data?.[column];
  if (!value || typeof value !== "string") {
    throw new Error(`No valid ${column} value found in table ${table}.`);
  }

  return value;
}

Deno.serve(async (req) => {

  if (req.method === "OPTIONS") {

    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "GET" && req.method !== "POST") {
    
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const genus = pickRandomGenus();

    const baseAdjektiv = await fetchRandomValue("schimpfmeister_adjektive", "adjektiv");
    const adjektiv = declineAdjectiveByGenus(baseAdjektiv, genus);

    const startSubstantiv = await fetchRandomValue("schimpfmeister_anfangssubstantive", "substantiv");
    const endSubstantiv = await fetchRandomValue(END_TABLE_BY_GENUS[genus], "substantiv");

    return new Response(
      JSON.stringify({
        adjektiv,
        substantiv: `${startSubstantiv}${endSubstantiv}`,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";

    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
