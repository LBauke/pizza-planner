import type { Kreation, Plan, Teigrezept, Zutat } from '../types'

export const START_ZUTATEN: Zutat[] = [
  { id: 'mehl', name: 'Pizzamehl', kategorie: 'mehl' },
  { id: 'mehl00', name: 'Weizenmehl Type 00', kategorie: 'mehl' },
  { id: 'wasser', name: 'Wasser (kalt)', kategorie: 'teig' },
  { id: 'oel', name: 'Olivenöl', kategorie: 'teig' },
  { id: 'salz', name: 'Salz', kategorie: 'teig' },
  { id: 'hefe', name: 'Frische Hefe', kategorie: 'teig' },
  { id: 'tomatensauce', name: 'Tomatensauce', kategorie: 'sauce' },
  { id: 'mozzarella', name: 'Mozzarella', kategorie: 'kaese' },
  { id: 'basilikum', name: 'Frisches Basilikum', kategorie: 'finish' },
]

export const MEHL_00: Zutat = { id: 'mehl00', name: 'Weizenmehl Type 00', kategorie: 'mehl' }

/** Quelle: „Biga Pizzateig – Darum wird der Teig so luftig!“, Teichners Pizza Palace (YouTube ZYAQc1zuey4) */
const BIGA: Teigrezept = {
  id: 'biga',
  name: 'Biga 100 %',
  beschreibung: '68 % Hydration · ergibt 6 Ballen à 280–285 g · Teichners Pizza Palace',
  stufen: [
    {
      name: 'Biga (Vorteig)',
      zutaten: [
        { zutatId: 'mehl00', menge: 1000 },
        { zutatId: 'wasser', menge: 450 },
        { zutatId: 'hefe', menge: 3 },
      ],
    },
    {
      name: 'Hauptteig',
      zutaten: [
        { zutatId: 'wasser', menge: 230 },
        { zutatId: 'salz', menge: 30 },
        { zutatId: 'hefe', menge: 1 },
      ],
    },
  ],
  schritte: [
    'Biga: Hefe im kalten Wasser auflösen.',
    'Mehl in eine verschließbare Schüssel geben, Hefewasser darübergießen, Deckel drauf und schütteln, bis eine flockige Struktur entsteht. Mehlnester von Hand einarbeiten.',
    'Abgedeckt 1 Std. bei Raumtemperatur, dann 16–48 Std. im Kühlschrank reifen lassen.',
    'Hauptteig: Biga in Würfel schneiden, in die Knetschüssel geben, einen Schluck Wasser und die Hefe zugeben.',
    'Auf kleinster Stufe (ca. 20 %) kneten, restliches Wasser schluckweise zugeben. Kaltes Wasser verwenden, Teig nicht über 24 °C.',
    'Sobald der Teig Struktur bekommt, auf ca. 50 % erhöhen. Nach ca. 9 Min. das Salz zugeben.',
    'Nach ca. 12–16 Min. ist der Teig geschmeidig. Dehnen und falten, auf Spannung bringen, 15 Min. abgedeckt ruhen lassen.',
    'In Stücke à 280–285 g teilen und rund schleifen, in die Ballenbox legen.',
    'Stückgare: 4–5 Std. bei Raumtemperatur oder bis zu 48 Std. im Kühlschrank.',
  ],
}

/** Quelle: „Gelingsicheres 48 Stunden Pizzateig Rezept für ZU HAUSE!“, Teichners Pizza Palace (YouTube OxfAUA8aSMo) */
const NEAPEL48: Teigrezept = {
  id: 'neapel48',
  name: 'Neapolitanisch 48 h',
  beschreibung: '70 % Hydration · ergibt 6 Ballen à 280 g (30–33 cm) · Teichners Pizza Palace',
  stufen: [
    {
      name: '',
      zutaten: [
        { zutatId: 'mehl00', menge: 1000 },
        { zutatId: 'wasser', menge: 700 },
        { zutatId: 'salz', menge: 30 },
        { zutatId: 'hefe', menge: 2.5 },
      ],
    },
  ],
  schritte: [
    'Mehl und Hefe in die Knetmaschine geben (optional 800 g Type 00 + 200 g Type 1 für mehr Aroma).',
    '50 % des kalten Wassers zugeben und kneten.',
    'Sobald das Mehl das Wasser gebunden hat, schluckweise weiteres Wasser zugeben.',
    'Nach ca. 3 Min. das restliche Wasser zugeben, die Geschwindigkeit um ca. 20 % erhöhen, dann das Salz zugeben.',
    'Nach ca. 12 Min. ist der Teig ausgeknetet. Dehnen und falten, auf Spannung bringen.',
    '1 Std. Stockgare, abgedeckt.',
    'Ballen à 280 g formen, rund schleifen und abgedeckt in die Ballenbox legen.',
    '45 Std. Stückgare im Kühlschrank.',
    '2 Std. vor dem Backen bei Raumtemperatur akklimatisieren lassen.',
  ],
}

/** Frühere Vorlagen – nur für die Migration, um unveränderte Vorlagen zu erkennen. */
export const ALTE_VORLAGEN: Teigrezept[] = [
  {
    id: 'biga',
    name: 'Biga-Teig',
    beschreibung: 'Vorlage – Mengen bitte unter Rezepte anpassen',
    stufen: [
      { name: 'Biga', zutaten: [{ zutatId: 'mehl', menge: 1000 }, { zutatId: 'wasser', menge: 450 }, { zutatId: 'hefe', menge: 10 }] },
      { name: 'Hauptteig', zutaten: [{ zutatId: 'wasser', menge: 200 }, { zutatId: 'salz', menge: 30 }] },
    ],
    schritte: ['Biga ansetzen und reifen lassen.', 'Hauptteig: Biga mit restlichem Wasser und Salz verkneten.'],
  },
  {
    id: 'neapel48',
    name: 'Neapolitanisch 48 h',
    beschreibung: 'Vorlage mit ca. 65 % Hydration – bitte anpassen',
    stufen: [
      {
        name: '',
        zutaten: [
          { zutatId: 'mehl', menge: 1000 },
          { zutatId: 'wasser', menge: 650 },
          { zutatId: 'salz', menge: 28 },
          { zutatId: 'hefe', menge: 1 },
        ],
      },
    ],
    schritte: ['Teig kneten.', 'Ballen formen und 48 h kalt gehen lassen.'],
  },
]

export const START_TEIGE: Teigrezept[] = [
  {
    id: 'hybrid',
    name: 'Hybridteig 24 h',
    beschreibung: '24 h Kühlschrankgare · ergibt 6 Ballen à 280 g',
    stufen: [
      {
        name: '',
        zutaten: [
          { zutatId: 'mehl', menge: 1000 },
          { zutatId: 'wasser', menge: 620 },
          { zutatId: 'oel', menge: 30 },
          { zutatId: 'salz', menge: 30 },
          { zutatId: 'hefe', menge: 3.5 },
        ],
      },
    ],
    schritte: [
      'Mehl in die Knetmaschine geben.',
      'Die Hälfte des Wassers zugeben und die Hefe hineinbröseln, 3 Min. kneten.',
      'Restliches Wasser schluckweise zugeben.',
      'Nach ca. 8 Min. Öl und Salz zugeben.',
      'Weitere 5 Min. kneten. Der Teig darf nicht wärmer als 24 °C werden.',
      'Ballen formen und 24 h im Kühlschrank gehen lassen.',
    ],
  },
  BIGA,
  NEAPEL48,
]

export const START_KREATIONEN: Kreation[] = [
  {
    id: 'margherita',
    name: 'Margherita',
    toppings: [
      { zutatId: 'tomatensauce', menge: 160 },
      { zutatId: 'mozzarella', menge: 100 },
      { zutatId: 'basilikum', menge: 4 },
    ],
  },
]

export const START_PLAN: Plan = {
  personen: 10,
  pizzenProPerson: 1,
  puffer: 0,
  ballengewicht: 280,
  teigId: 'hybrid',
  auswahl: { margherita: 10 },
  autoVerteilung: true,
}

export const START_KAPAZITAET_MEHL = 6000
