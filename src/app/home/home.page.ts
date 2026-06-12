import { Component, OnInit } from '@angular/core';

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
export class HomePage implements OnInit {

  public adjektiv        = "...";
  public substantiv      = "...";
  public istAmLaden      = false;
  public fehlerNachricht = "";


  /**
   * Beim Initialisieren der Komponente wird ein Schimpfwort geladen.
   */
  ngOnInit() {

    this.schimpfwortLaden();
  }


  /**
   * Diese Methode lädt ein neues Schimpfwort von der API.
   * Wird u.a. als Button-Event-Handler verwendet.
   */
  async schimpfwortLaden(): Promise<void> {

    this.istAmLaden      = true;
    this.fehlerNachricht = "";

    try {
      const antwort = await fetch( API_URL, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "apikey"      : API_KEY
        }
      });

      if ( !antwort.ok ) {

        throw new Error( "API-Fehler: " + antwort.statusText );
      }

      const jsonAntwort = await antwort.json();
      const payload     = jsonAntwort as Partial<SchimpfAntwort>;

      if ( !payload.adjektiv || !payload.substantiv ) {

        throw new Error( "Ungültige API-Antwort" );
      }

      this.adjektiv   = payload.adjektiv;
      this.substantiv = payload.substantiv;

    } catch ( fehler ) {

      this.fehlerNachricht = "Schimpfwort konnte nicht geladen werden.";

    } finally {

      this.istAmLaden = false;
    }
  }

}
