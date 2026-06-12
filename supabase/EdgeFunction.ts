import { createClient } from "https://esm.sh/@supabase/supabase-js@2";


const corsKopfzeilen = {
  "Access-Control-Allow-Origin" : "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
};

type GrammatischesGeschlecht = "MASKULINUM" | "FEMININUM" | "NEUTRUM";

const GESCHLECHTS_WERTE: GrammatischesGeschlecht[] = [ "MASKULINUM", "FEMININUM", "NEUTRUM" ];

const ENDTABELLE_NACH_GESCHLECHT: Record<GrammatischesGeschlecht, string> = {
  MASKULINUM: "schimpfmeister_substantiv_maskulinum",
  FEMININUM : "schimpfmeister_substantiv_femininum",
  NEUTRUM   : "schimpfmeister_substantiv_neutrum"
};

const SUPABASE_ADRESSE    = Deno.env.get( "SUPABASE_URL" ) ?? "";
const SUPABASE_SCHLUESSEL = Deno.env.get( "SUPABASE_SERVICE_ROLE_KEY" )
  ?? Deno.env.get( "SUPABASE_ANON_KEY" )
  ?? "";

if ( !SUPABASE_ADRESSE || !SUPABASE_SCHLUESSEL ) {

  throw new Error( "Fehlende Umgebungsvariablen: SUPABASE_URL oder SUPABASE_SERVICE_ROLE_KEY/SUPABASE_ANON_KEY." );
}

const supabaseKlient = createClient( SUPABASE_ADRESSE, SUPABASE_SCHLUESSEL );

function waehleZufaelligesGeschlecht(): GrammatischesGeschlecht {

  const index = Math.floor( Math.random() * GESCHLECHTS_WERTE.length );
  return GESCHLECHTS_WERTE[ index ];
}

function dekliniereAdjektivNachGeschlecht( adjektiv: string, geschlecht: GrammatischesGeschlecht ): string {

  if ( geschlecht === "MASKULINUM" ) {

    return `${adjektiv}r`;
  }
  if ( geschlecht === "NEUTRUM" ) {

    return `${adjektiv}s`;
  }

  return adjektiv;
}

async function holeZufaelligenWert( tabellenname: string, spaltenname: "adjektiv" | "substantiv" ): Promise<string> {

  const { count: anzahl, error: anzahlFehler } =
                                    await supabaseKlient
                                              .from( tabellenname )
                                              .select( spaltenname, { count: "exact", head: true } );
  if ( anzahlFehler ) {

    throw new Error( `Zaehlen fuer Tabelle ${tabellenname} fehlgeschlagen: ${anzahlFehler.message}` );
  }

  if ( !anzahl || anzahl < 1 ) {

    throw new Error( `Keine Zeilen in Tabelle ${tabellenname} gefunden.` );
  }

  const zufallsIndex = Math.floor( Math.random() * anzahl );

  const { data: daten, error: fehler } =
                            await supabaseKlient
                                      .from( tabellenname )
                                      .select( spaltenname )
                                      .order( "id", { ascending: true } )
                                      .range( zufallsIndex, zufallsIndex )
                                      .limit( 1 )
                                      .maybeSingle();
  if ( fehler ) {

    throw new Error( `Auswahl aus Tabelle ${tabellenname} fehlgeschlagen: ${fehler.message}` );
  }

  const wert = daten?.[spaltenname];
  if ( !wert || typeof wert !== "string" ) {

    throw new Error( `Kein gueltiger ${spaltenname}-Wert in Tabelle ${tabellenname} gefunden.` );
  }

  return wert;
}

Deno.serve( async ( anfrage ) => {

  if ( anfrage.method === "OPTIONS" ) {

    return new Response( "ok", { headers: corsKopfzeilen } );
  }

  if ( anfrage.method !== "GET" ) {

    return new Response( JSON.stringify({ error: "Methode nicht erlaubt" }), {
      status : 405,
      headers: { ...corsKopfzeilen, "Content-Type": "application/json" },
    });
  }

  try {

    const geschlecht = waehleZufaelligesGeschlecht();

    const grundAdjektiv = await holeZufaelligenWert( "schimpfmeister_adjektive", "adjektiv" );
    const adjektiv      = dekliniereAdjektivNachGeschlecht( grundAdjektiv, geschlecht );

    const anfangsSubstantiv = await holeZufaelligenWert( "schimpfmeister_anfangssubstantive"   , "substantiv" );
    const endSubstantiv     = await holeZufaelligenWert( ENDTABELLE_NACH_GESCHLECHT[geschlecht], "substantiv" );

    return new Response(
      JSON.stringify({
        adjektiv,
        substantiv: `${anfangsSubstantiv}${endSubstantiv}`,
      }),
      {
        headers: { ...corsKopfzeilen, "Content-Type": "application/json" },
      },
    );
  } catch ( fehler ) {

    const fehlermeldung = fehler instanceof Error ? fehler.message : "Unbekannter Fehler";

    return new Response( JSON.stringify( { error: fehlermeldung } ), {
      status: 500,
      headers: { ...corsKopfzeilen, "Content-Type": "application/json" }
    });
  }
});
