import type { Kreation, Plan, Teigrezept, Zutat } from '../types'

export const START_ZUTATEN: Zutat[] = [
  { id: 'mehl', name: 'Pizzamehl', kategorie: 'mehl' },
  { id: 'wasser', name: 'Wasser (kalt)', kategorie: 'teig' },
  { id: 'oel', name: 'Olivenöl', kategorie: 'teig' },
  { id: 'salz', name: 'Salz', kategorie: 'teig' },
  { id: 'hefe', name: 'Frische Hefe', kategorie: 'teig' },
  { id: 'tomatensauce', name: 'Tomatensauce', kategorie: 'sauce' },
  { id: 'mozzarella', name: 'Mozzarella', kategorie: 'kaese' },
  { id: 'basilikum', name: 'Frisches Basilikum', kategorie: 'finish' },
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
  {
    id: 'biga',
    name: 'Biga-Teig',
    beschreibung: 'Vorlage – Mengen bitte unter Rezepte anpassen',
    stufen: [
      {
        name: 'Biga',
        zutaten: [
          { zutatId: 'mehl', menge: 1000 },
          { zutatId: 'wasser', menge: 450 },
          { zutatId: 'hefe', menge: 10 },
        ],
      },
      {
        name: 'Hauptteig',
        zutaten: [
          { zutatId: 'wasser', menge: 200 },
          { zutatId: 'salz', menge: 30 },
        ],
      },
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
