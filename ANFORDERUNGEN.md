# Pizza Planner – Anforderungen & Ablaufplan

Stand: 05.11.2026 · Version 0.2 (Restfragen geklärt)

## 1. Ziel

Eine minimalistische, offline-fähige Web-App (auch fürs Handy), mit der ich für kleine Pizza-Caterings (5–20 Personen) **Teig- und Toppingmengen berechne**, eine **Einkaufsliste abzüglich Bestand** erhalte und **Ideen für neue Kreationen** bekomme.
Fokus: **Rechner und Kalkulator**, kein Eventplaner.

## 2. Rahmenbedingungen

| Punkt | Festlegung |
|---|---|
| Nutzer | nur ich (kein Login) |
| Personen | 5–20 (technisch offen nach oben) |
| Ofen | Cozze 17" Gas: Standard-Pizza 30 cm, Standard 1 Pizza pro Person |
| Knetmaschine | max. 6 kg Mehl (+ restliche Zutaten) pro Durchgang |
| Hosting | GitHub Pages (danach offline nutzbar) |
| Geräte | Handy und Desktop (responsive) |
| Offline | ja (PWA, installierbar auf dem Homescreen) |
| Datenhaltung | lokal im Gerät |
| Sprache | nur Deutsch, Einheiten g / kg / ml |
| Kosten, Export, Druck, Allergene | nicht benötigt |

## 3. Funktionen

### Muss (Version 1)

**F1 – Teigrechner**
- Eingaben: Personenzahl, Pizzen pro Person (einstellbar), Teigballengewicht (Standard 280 g für 30 cm), Puffer in % (einstellbar), Teigart (Auswahl).
- Ausgabe: Anzahl Teigballen, Gesamtteigmenge, genaue Zutatenmengen in g.
- Teigrezepte werden in **Bäckerprozent** gespeichert und darüber skaliert.
- Anzeige der Zubereitungsschritte des gewählten Teigs als einfache Schrittliste, ohne Timer (inkl. Hinweis: Teig max. 24 °C).
- Die Hefe wird linear mitskaliert.
- **Knet-Durchgänge:** Liegt die Mehlmenge über der Kapazität der Knetmaschine (einstellbar, Standard 6000 g Mehl), wird der Teig in gleich große Durchgänge aufgeteilt. Die Mengen werden pro Durchgang angezeigt.
- Teigrezepte können aus zwei Stufen bestehen, z. B. Biga (Vorteig) und Hauptteig.

**F2 – Teigrezepte verwalten**
- Mehrere Teigarten anlegen, bearbeiten, löschen. Die genauen Rezepte trage ich selbst in der App ein.
- Vorinstalliert:
  - **Hybridteig, 24 h Kühlschrank (Standard)**, vollständiges Rezept siehe unten
  - **Biga-Teig**: Vorlage mit Stufe „Biga“ und „Hauptteig“, Mengen selbst eintragen
  - **Neapolitanisch 48 h**: Vorlage mit ca. 65 % Hydration, Mengen selbst anpassen

Hybridteig:

| Zutat | Menge | Bäckerprozent |
|---|---|---|
| Pizzamehl | 1000 g | 100 % |
| Wasser (kalt) | 620 g | 62 % |
| Olivenöl | 30 g | 3 % |
| Salz | 30 g | 3 % |
| Frische Hefe | 3,5 g | 0,35 % |
| **Summe** | **1683,5 g** | ≈ 6 × 280 g |

Zubereitung: Mehl in die Knetmaschine geben, die Hälfte des Wassers und die Hefe hineinbröseln und 3 Min. kneten. Danach das restliche Wasser schluckweise zugeben. Nach ca. 8 Min. Öl und Salz zugeben und weitere 5 Min. kneten. Die Teigtemperatur darf 24 °C nicht überschreiten.

**F3 – Pizzakreationen (Toppings)**
- Für jede Kreation werden Toppingzutaten mit Menge **pro Pizza (30 cm)** hinterlegt.
- Kreationen anlegen, bearbeiten, löschen.
- Vorinstalliert: **Margherita**: 160 g Tomatensauce, 100 g Mozzarella, 4 g frisches Basilikum (Menge des Basilikums anpassbar).
- Kreationen auswählen und die **Anzahl Pizzen je Kreation** festlegen (oder automatisch gleichmäßig auf die Gesamtzahl verteilen).

**F4 – Einkaufsliste**
- Zwei getrennte Abschnitte: **Teig** und **Toppings**.
- Gleiche Zutaten aus mehreren Kreationen werden summiert.
- Mengen exakt, ohne Aufrundung auf Packungsgrößen.
- **Bestand wird abgezogen**: Anzeige von Bedarf, Bestand und „noch kaufen“.
- Abhaken direkt in der Liste (für den Einkauf mit dem Handy).

**F5 – Bestand**
- Zutaten mit vorhandener Menge pflegen.
- Nach einer Planung den Verbrauch per Klick vom Bestand abbuchen („Catering abgeschlossen“).

**F6 – Planungen speichern**
- Eine Berechnung (Personen, Teig, Kreationen) speichern, später laden, anpassen und duplizieren.

### Soll (Version 1.1)

**F7 – Ideen-Generator (Kombinationslogik, ohne KI)**
- Jede Zutat hat eine Kategorie: Basis (Sauce), Käse, Fleisch/Fisch, Gemüse, Finish (nach dem Backen, z. B. Rucola, Honig, Basilikum).
- Zutaten haben Geschmacks-Tags (z. B. salzig, süß, scharf, rauchig, frisch, cremig).
- Der Generator baut Kombinationen nach Regeln: 1 Basis, 1–2 Käse, 0–1 Protein, 1–2 Gemüse, 0–1 Finish, plus Kontrast-Regel (z. B. salzig + süß, cremig + frisch).
- „Neu würfeln“ für einzelne Bestandteile oder für die ganze Pizza.
- Eine Idee kann per Klick als Kreation übernommen werden.

### Kann (später)
- Pizzagrößen über 30 cm mit flächenbasierter Skalierung des Teigballengewichts.
- Hefemenge abhängig von Gärzeit und Temperatur.
- Backup als Export/Import (JSON-Datei).

## 4. Rechenlogik

```
Pizzen          = Personen × Pizzen_pro_Person
Teigballen      = aufrunden(Pizzen × (1 + Puffer%))
Teig_gesamt     = Teigballen × Ballengewicht
Mehl            = Teig_gesamt / Summe_Bäckerprozent      (Hybrid: 1,6835)
Zutat_x         = Mehl × Prozent_x
Topping_x       = Σ (Anzahl_Pizzen_Kreation × Menge_x_pro_Pizza)
Noch_kaufen_x   = max(0, Bedarf_x − Bestand_x)
```

Beispiel für 12 Personen, 1 Pizza pro Person, 280 g, 0 % Puffer: 12 Ballen, 3360 g Teig, also 1996 g Mehl, 1237 g Wasser, 60 g Öl, 60 g Salz und 7 g Hefe.

## 5. Technik

| Bereich | Wahl | Grund |
|---|---|---|
| Framework | React + TypeScript + Vite | modern, schnell, typsicher |
| Styling | Tailwind CSS | konsequentes, minimalistisches Design-System |
| Zustand + Speicher | Zustand mit Persistenz (lokal im Browser) | einfach, offline, kein Server |
| Offline | PWA (Service Worker) | aufs Handy installierbar, funktioniert ohne Netz |
| Tests | Vitest | Rechenlogik abgesichert |

## 6. Design

- Akzentfarbe **Tomatenrot-Orange** (ca. `#E8502F`), sonst Weiß und Off-White mit dunkelgrauem Text, eine zweite Neutralfarbe für Flächen.
- Eine Schrift, große Zahlen für Ergebnisse, viel Weißraum.
- Mobile-first, Navigation unten mit 4 Tabs: **Rechner · Kreationen · Einkauf · Bestand** (Ideen kommen als Bereich unter Kreationen dazu).
- Ergebnisse aktualisieren sich live, ohne „Berechnen“-Knopf.

## 7. Datenmodell (vereinfacht)

```
Zutat        { id, name, einheit (g|ml|Stk), kategorie, tags[] }
Teigrezept   { id, name, zutaten[{zutatId, prozent}], ballengewicht, schritte[] }
Kreation     { id, name, toppings[{zutatId, mengeProPizza}] }
Bestand      { zutatId, menge }
Planung      { id, name, datum, personen, pizzenProPerson, puffer,
               teigrezeptId, auswahl[{kreationId, anzahl}] }
```

## 8. Ablaufplan

| Phase | Inhalt | Ergebnis |
|---|---|---|
| 0 | Restfragen klären, Startdaten (Kreationen, Mengen) festlegen | finale Anforderungen |
| 1 | Projekt-Setup: Vite, React, TS, Tailwind, PWA, Farbschema, Navigation | leere App läuft am PC und am Handy |
| 2 | Rechenlogik + Tests (Teig, Toppings, Bestand) | geprüfte Kernlogik |
| 3 | F1/F2 Teigrechner und Teigrezepte | Teig ist berechenbar |
| 4 | F3 Kreationen und Auswahl | Toppings sind berechenbar |
| 5 | F4/F5 Einkaufsliste und Bestand | vollständiger Einkaufszettel |
| 6 | F6 Planungen speichern | Wiederverwendung |
| 7 | Feinschliff: mobiler Test, Offline-Test, Installation aufs Handy | **Version 1** |
| 8 | F7 Ideen-Generator | **Version 1.1** |

## 8a. Stand der Umsetzung (05.11.2026)

| Phase | Status |
|---|---|
| 0–6 | erledigt: Rechner, Rezepte (Pizzen + Teige mit Stufen), Einkaufsliste, Bestand mit Abbuchen, gespeicherte Planungen, 14 Tests für die Rechenlogik |
| 7 | erledigt: veröffentlicht auf https://lbauke.github.io/pizza-planner/ (automatisch bei jedem Push auf `main`) |
| 8 | erledigt: Ideen-Generator unter Rezepte → Ideen. Eingebauter Katalog mit ca. 55 Zutaten (`src/data/katalog.ts`), Filter „Vegetarisch“ und „Nur meine Zutaten“, Tauschen einzelner Zutaten, Übernahme als Pizza |

Lokal starten: `npm install`, danach `npm run dev`

### Ergänzungen (05.11.2026)

- **Ein Pizzamehl** für alle Teigrezepte. „Weizenmehl Type 00“ aus den Video-Rezepten wurde durch „Pizzamehl“ ersetzt, Bestände wurden zusammengeführt.
- **Mehl in festen Schritten:** optional wird das Mehl je Teig auf volle Schritte aufgerundet (Standard 1000 g = ein Knetvorgang). Die übrigen Zutaten skalieren mit, zusätzliche Ballen werden als Reserve angezeigt.
- **Mehrere Teige pro Planung:** Im Rechner lassen sich mehrere Teige gleichzeitig auswählen. Die Pizzen werden gleichmäßig oder manuell verteilt, jeder Teig wird für sich berechnet, und die Einkaufsliste summiert alles.

## 9. Offene Punkte

Keine. Weitere Kreationen und die genauen Rezepte für Biga und Neapolitanisch trage ich selbst in der App ein.
