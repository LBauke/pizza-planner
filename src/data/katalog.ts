import type { Kategorie } from '../types'

export type Tag =
  | 'salzig'
  | 'suess'
  | 'scharf'
  | 'rauchig'
  | 'cremig'
  | 'frisch'
  | 'wuerzig'
  | 'saeuerlich'
  | 'kraeftig'
  | 'erdig'

export const TAG_NAMEN: Record<Tag, string> = {
  salzig: 'salzig',
  suess: 'süß',
  scharf: 'scharf',
  rauchig: 'rauchig',
  cremig: 'cremig',
  frisch: 'frisch',
  wuerzig: 'würzig',
  saeuerlich: 'säuerlich',
  kraeftig: 'kräftig',
  erdig: 'erdig',
}

export interface KatalogZutat {
  name: string
  kategorie: Kategorie
  /** übliche Menge pro 30-cm-Pizza in g */
  menge: number
  tags: Tag[]
}

const z = (name: string, kategorie: Kategorie, menge: number, ...tags: Tag[]): KatalogZutat => ({ name, kategorie, menge, tags })

/** Eingebaute Zutaten für den Ideen-Generator (Mengen pro Pizza als Startwert). */
export const KATALOG: KatalogZutat[] = [
  // Basis
  z('Tomatensauce', 'sauce', 160, 'frisch', 'saeuerlich'),
  z('Crème fraîche', 'sauce', 80, 'cremig'),
  z('Pesto Genovese', 'sauce', 50, 'wuerzig', 'frisch'),
  z('Kürbiscreme', 'sauce', 120, 'suess', 'cremig', 'erdig'),
  z('Ricotta', 'sauce', 90, 'cremig'),

  // Käse
  z('Mozzarella', 'kaese', 100, 'cremig'),
  z('Fior di Latte', 'kaese', 100, 'cremig'),
  z('Büffelmozzarella', 'kaese', 100, 'cremig', 'frisch'),
  z('Gorgonzola', 'kaese', 40, 'kraeftig', 'salzig', 'cremig'),
  z('Parmesan', 'kaese', 15, 'salzig', 'wuerzig'),
  z('Scamorza (geräuchert)', 'kaese', 70, 'rauchig', 'cremig'),
  z('Ziegenkäse', 'kaese', 50, 'saeuerlich', 'kraeftig'),
  z('Provolone', 'kaese', 60, 'wuerzig', 'salzig'),
  z('Pecorino', 'kaese', 15, 'salzig', 'kraeftig'),

  // Fleisch / Fisch
  z('Salami', 'fleisch', 60, 'salzig', 'wuerzig'),
  z('Salami piccante', 'fleisch', 60, 'scharf', 'salzig'),
  z('Nduja', 'fleisch', 30, 'scharf', 'kraeftig'),
  z('Kochschinken', 'fleisch', 70, 'salzig'),
  z('Parmaschinken', 'fleisch', 40, 'salzig'),
  z('Guanciale', 'fleisch', 50, 'rauchig', 'salzig'),
  z('Salsiccia', 'fleisch', 80, 'wuerzig'),
  z('Mortadella', 'fleisch', 50, 'salzig', 'cremig'),
  z('Thunfisch', 'fleisch', 70, 'salzig'),
  z('Sardellen', 'fleisch', 15, 'salzig', 'kraeftig'),

  // Gemüse & Obst
  z('Champignons', 'gemuese', 60, 'erdig'),
  z('Rote Zwiebeln', 'gemuese', 40, 'suess'),
  z('Paprika', 'gemuese', 60, 'suess', 'frisch'),
  z('Zucchini', 'gemuese', 70, 'frisch'),
  z('Aubergine', 'gemuese', 70, 'erdig'),
  z('Kirschtomaten', 'gemuese', 70, 'frisch', 'saeuerlich'),
  z('Oliven', 'gemuese', 30, 'salzig', 'kraeftig'),
  z('Kapern', 'gemuese', 10, 'saeuerlich', 'salzig'),
  z('Artischocken', 'gemuese', 60, 'saeuerlich', 'erdig'),
  z('Blattspinat', 'gemuese', 50, 'erdig'),
  z('Jalapeños', 'gemuese', 20, 'scharf', 'saeuerlich'),
  z('Mais', 'gemuese', 40, 'suess'),
  z('Kartoffelscheiben', 'gemuese', 80, 'erdig', 'cremig'),
  z('Friarielli', 'gemuese', 60, 'erdig', 'wuerzig'),
  z('Getrocknete Tomaten', 'gemuese', 30, 'suess', 'saeuerlich', 'kraeftig'),
  z('Birne', 'gemuese', 60, 'suess', 'frisch'),
  z('Feigen', 'gemuese', 50, 'suess'),
  z('Ananas', 'gemuese', 60, 'suess', 'saeuerlich'),

  // Finish (nach dem Backen)
  z('Frisches Basilikum', 'finish', 4, 'frisch'),
  z('Rucola', 'finish', 20, 'frisch', 'wuerzig'),
  z('Honig', 'finish', 10, 'suess'),
  z('Hot Honey', 'finish', 10, 'suess', 'scharf'),
  z('Balsamico-Creme', 'finish', 10, 'suess', 'saeuerlich'),
  z('Pistazien', 'finish', 15, 'erdig', 'salzig'),
  z('Walnüsse', 'finish', 15, 'erdig'),
  z('Chiliöl', 'finish', 5, 'scharf'),
  z('Zitronenabrieb', 'finish', 2, 'frisch', 'saeuerlich'),
  z('Burrata', 'finish', 60, 'cremig', 'frisch'),
  z('Rosmarin', 'finish', 2, 'wuerzig'),
]

export const imKatalog = (name: string) => KATALOG.find((k) => k.name.toLowerCase() === name.trim().toLowerCase())
