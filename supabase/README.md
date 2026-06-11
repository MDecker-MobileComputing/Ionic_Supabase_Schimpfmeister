# SQL-Befehle für Aufsetzen Tabellen #

<br>

Die folgenden SQL-Dateien für Postgres sind im "SQL Editor" der Supabase-Oberfläche auszuführen,
um die benötigten Tabellen zu erzeugen und mit Einträgen zu befüllen.

<br>

Danach kann die in der Datei [EdgeFunction.ts](EdgeFunction.ts) definierte
*Edge Function* über die Web-Oberfläche von Supabase deployed werden.

<br>

[cURL](https://www.ionos.de/digitalguide/server/tools/einstieg-in-curl-in-linux/)-Aufruf zum Test der Funktion:
```
curl -L -X POST 'https://qlljavhtbzufbfunoxoz.supabase.co/functions/v1/super-worker' \
  -H 'apikey: sb_publishable_...' \
  -H 'Content-Type: application/json' \
  --data '{"name":"Functions"}'
```

Beispiel für Ergebnis:
```
{
	"adjektiv"  : "Nörgelndes",
	"substantiv": "Sprudelunheil"
}
```