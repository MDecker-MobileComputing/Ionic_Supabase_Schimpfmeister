import { Component } from '@angular/core';

type SchimpfAntwort = {
  adjektiv: string;
  substantiv: string;
};

const API_URL = "https://qlljavhtbzufbfunoxoz.supabase.co/functions/v1/super-worker";
const API_KEY = "sb_publishable_1aT2zuhIJGmFU6P3KwppRw_pz31R54G";

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false,
})
export class HomePage {

  public adjektiv        = "...";
  public substantiv      = "...";
  public istAmLaden      = false;
  public fehlerNachricht = '';

  constructor() {

    void this.schimpfwortLaden();
  }

  async schimpfwortLaden(): Promise<void> {

    this.istAmLaden = true;
    this.fehlerNachricht = '';

    try {
      const response = await fetch( API_URL, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "apikey"      : API_KEY
        }
      });

      if ( !response.ok ) {

        throw new Error( "API-Fehler: " + response.statusText );
      }

      const jsonAntwort = await response.json();
      const payload     = jsonAntwort as Partial<SchimpfAntwort>;

      if ( !payload.adjektiv || !payload.substantiv ) {

        throw new Error( "Ungültige API-Antwort" );
      }

      this.adjektiv   = payload.adjektiv;
      this.substantiv = payload.substantiv;

    } catch ( fehler ) {

      this.fehlerNachricht = 'Schimpfwort konnte nicht geladen werden.';

    } finally {

      this.istAmLaden = false;
    }
  }

}
