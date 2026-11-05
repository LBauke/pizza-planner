export type Kategorie =
  | 'mehl'
  | 'teig'
  | 'sauce'
  | 'kaese'
  | 'fleisch'
  | 'gemuese'
  | 'finish'
  | 'sonstiges'

export const KATEGORIEN: Record<Kategorie, string> = {
  mehl: 'Mehl',
  teig: 'Teigzutat',
  sauce: 'Sauce',
  kaese: 'Käse',
  fleisch: 'Fleisch / Fisch',
  gemuese: 'Gemüse',
  finish: 'Finish',
  sonstiges: 'Sonstiges',
}

export interface Zutat {
  id: string
  name: string
  kategorie: Kategorie
}

/** Eine Zutat mit Menge in Gramm */
export interface Posten {
  zutatId: string
  menge: number
}

/** Teigstufe, z. B. „Biga“ und „Hauptteig“. Ein einstufiger Teig hat eine Stufe mit leerem Namen. */
export interface Stufe {
  name: string
  zutaten: Posten[]
}

/** Mengen gelten für eine Referenz-Charge; skaliert wird über das Gesamtgewicht. */
export interface Teigrezept {
  id: string
  name: string
  beschreibung: string
  stufen: Stufe[]
  schritte: string[]
}

/** Toppingmengen pro Pizza (30 cm) */
export interface Kreation {
  id: string
  name: string
  toppings: Posten[]
}

export interface Plan {
  personen: number
  pizzenProPerson: number
  /** Sicherheitsaufschlag in Prozent */
  puffer: number
  ballengewicht: number
  teigId: string
  /** ausgewählte Kreationen → Anzahl Pizzen (nur bei manueller Verteilung relevant) */
  auswahl: Record<string, number>
  autoVerteilung: boolean
}

export interface GespeichertePlanung {
  id: string
  name: string
  datum: string
  plan: Plan
}
