CREATE OR REPLACE FUNCTION public.generate_schimpfwort()
RETURNS TABLE (
    adjektiv TEXT,
    substantiv TEXT
)
LANGUAGE plpgsql
VOLATILE
AS $$
DECLARE
    v_genus TEXT;
    v_wort1 TEXT;
    v_wort2 TEXT;
    v_wort3 TEXT;
BEGIN
    -- 1) Zufaelliges Genus bestimmen
    v_genus := (
        ARRAY['MASKULINUM', 'FEMININUM', 'NEUTRUM']
    )[floor(random() * 3)::INT + 1];

    -- 2) Zufaelliges Adjektiv holen und genusabhaengig deklinieren
    SELECT adjektiv
      INTO v_wort1
      FROM public.schimpfmeister_adjektive
     ORDER BY random()
     LIMIT 1;

    IF v_genus = 'MASKULINUM' THEN
        v_wort1 := v_wort1 || 'r';
    ELSIF v_genus = 'NEUTRUM' THEN
        v_wort1 := v_wort1 || 's';
    END IF;

    -- 3) Anfang des zusammengesetzten Substantivs
    SELECT substantiv
      INTO v_wort2
      FROM public.schimpfmeister_anfangssubstantive
     ORDER BY random()
     LIMIT 1;

    -- 4) Ende des zusammengesetzten Substantivs passend zum Genus
    IF v_genus = 'MASKULINUM' THEN
        SELECT substantiv
          INTO v_wort3
          FROM public.schimpfmeister_substantiv_maskulinum
         ORDER BY random()
         LIMIT 1;
    ELSIF v_genus = 'FEMININUM' THEN
        SELECT substantiv
          INTO v_wort3
          FROM public.schimpfmeister_substantiv_feminum
         ORDER BY random()
         LIMIT 1;
    ELSE
        SELECT substantiv
          INTO v_wort3
          FROM public.schimpfmeister_substantiv_neutrum
         ORDER BY random()
         LIMIT 1;
    END IF;

    adjektiv  := v_wort1;
    substantiv := v_wort2 || v_wort3;

    RETURN NEXT;
END;
$$;

-- Test:
-- SELECT * FROM public.generate_schimpfwort();
