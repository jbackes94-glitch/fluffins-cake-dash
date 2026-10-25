# Fluffin's Cake Dash

Ein kleines Lauf- und Sprungspiel über Fluffin, den Golden Doodle, und Marly, den Labrador.
Vier Maps: Wimbledon Common, Würzbacher Weiher, Jörgs Garten und Saarbrücker Staden.

Das Spiel ist eine Web-App: einmal im Browser öffnen, dann zum Home-Bildschirm hinzufügen.
Danach startet es wie eine App, im Vollbild und auch ohne Internet.

## Aufbau

- `index.html`: Seite, Menüs und Stil
- `i18n.js`: alle Texte auf Deutsch und Englisch
- `art.js`, `staden.js`: Figuren, Gegner, Snacks und Plattformen
- `scenery.js`: Hintergründe der Maps
- `audio.js`: Soundeffekte und Melodien
- `game.js`: Spiellogik
- `ui.js`: Menü, Bestenliste, Steuerung
- `sw.js`, `manifest.webmanifest`, `icons/`, `fonts/`: alles, was die Web-App offline und mit eigenem Symbol laufen lässt
