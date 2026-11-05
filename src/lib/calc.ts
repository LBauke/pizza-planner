import type { Kreation, Plan, Posten, Stufe, Teigrezept, Zutat } from '../types'

const EPS = 1e-9

/** Anzahl Pizzen inkl. Puffer, immer aufgerundet. */
export function anzahlPizzen(plan: Plan): number {
  const roh = plan.personen * plan.pizzenProPerson * (1 + plan.puffer / 100)
  return Math.max(0, Math.ceil(roh - EPS))
}

/** Gleiche Mengen zusammenfassen, Reihenfolge des ersten Auftretens bleibt erhalten. */
export function zusammenfassen(posten: Posten[]): Posten[] {
  const map = new Map<string, number>()
  for (const p of posten) {
    if (!p.zutatId) continue // noch nicht ausgefüllte Zeile im Editor
    map.set(p.zutatId, (map.get(p.zutatId) ?? 0) + p.menge)
  }
  return [...map].map(([zutatId, menge]) => ({ zutatId, menge }))
}

const summe = (posten: Posten[]) => posten.reduce((s, p) => s + p.menge, 0)

export interface TeigErgebnis {
  teigGesamt: number
  stufen: Stufe[]
  gesamt: Posten[]
  mehlGesamt: number
  /** Mehlmenge der Referenz-Charge – Basis für Bäckerprozent */
  mehlReferenz: number
  durchgaenge: number
  /** so viele Ballen ergibt die (ggf. aufgerundete) Teigmenge */
  ballen: number
}

/**
 * @param mehlSchritt > 0: Mehl wird auf ein Vielfaches davon aufgerundet (z. B. 1000 g = ein Knetvorgang),
 *                     die übrigen Zutaten skalieren mit. Mehr Teig → zusätzliche Ballen als Reserve.
 */
export function berechneTeig(
  rezept: Teigrezept,
  zutaten: Zutat[],
  pizzen: number,
  ballengewicht: number,
  kapazitaetMehl: number,
  mehlSchritt = 0,
): TeigErgebnis {
  const alle = rezept.stufen.flatMap((s) => s.zutaten)
  const referenz = summe(alle)
  const istMehl = (id: string) => zutaten.find((z) => z.id === id)?.kategorie === 'mehl'
  const mehlReferenz = summe(alle.filter((p) => istMehl(p.zutatId)))

  let teigGesamt = pizzen * ballengewicht
  if (mehlSchritt > 0 && mehlReferenz > 0 && teigGesamt > 0) {
    const mehl = (teigGesamt * mehlReferenz) / referenz
    teigGesamt = ((Math.ceil(mehl / mehlSchritt - EPS) * mehlSchritt) * referenz) / mehlReferenz
  }
  const faktor = referenz > 0 ? teigGesamt / referenz : 0

  const stufen = rezept.stufen.map((s) => ({
    name: s.name,
    zutaten: s.zutaten.map((p) => ({ zutatId: p.zutatId, menge: p.menge * faktor })),
  }))
  const gesamt = zusammenfassen(stufen.flatMap((s) => s.zutaten))
  const mehlGesamt = mehlReferenz * faktor
  const durchgaenge =
    kapazitaetMehl > 0 && mehlGesamt > kapazitaetMehl + EPS ? Math.ceil(mehlGesamt / kapazitaetMehl - EPS) : 1
  const ballen = ballengewicht > 0 ? Math.floor(teigGesamt / ballengewicht + EPS) : 0

  return { teigGesamt, stufen, gesamt, mehlGesamt, mehlReferenz, durchgaenge, ballen }
}

/** Bäckerprozent relativ zur Mehlmenge der Referenz-Charge */
export function baeckerprozent(menge: number, mehlReferenz: number): number | null {
  return mehlReferenz > 0 ? (menge / mehlReferenz) * 100 : null
}

/** Pizzen gleichmäßig auf die Kreationen verteilen, Rest geht an die ersten. */
export function verteile(pizzen: number, ids: string[]): Record<string, number> {
  const res: Record<string, number> = {}
  if (ids.length === 0) return res
  const basis = Math.floor(pizzen / ids.length)
  const rest = pizzen % ids.length
  ids.forEach((id, i) => (res[id] = basis + (i < rest ? 1 : 0)))
  return res
}

/** Anzahl je ausgewähltem Eintrag: automatisch gleichmäßig oder die manuell eingetragene Anzahl. */
function verteileAuswahl(auswahl: Record<string, number>, auto: boolean, ids: string[], gesamt: number) {
  const gewaehlt = ids.filter((id) => id in auswahl)
  if (auto) return verteile(gesamt, gewaehlt)
  return Object.fromEntries(gewaehlt.map((id) => [id, Math.max(0, auswahl[id] ?? 0)]))
}

/** Anzahl Pizzen je ausgewählter Kreation (berücksichtigt Auto-Verteilung). */
export function pizzenJeKreation(plan: Plan, kreationen: Kreation[]): Record<string, number> {
  return verteileAuswahl(plan.auswahl, plan.autoVerteilung, kreationen.map((k) => k.id), anzahlPizzen(plan))
}

/** Anzahl Pizzen (Teigballen) je ausgewähltem Teig. */
export function pizzenJeTeig(plan: Plan, teige: Teigrezept[]): Record<string, number> {
  return verteileAuswahl(plan.teigAuswahl, plan.teigAuto, teige.map((t) => t.id), anzahlPizzen(plan))
}

export function berechneToppings(kreationen: Kreation[], anzahl: Record<string, number>): Posten[] {
  return zusammenfassen(
    kreationen.flatMap((k) => k.toppings.map((t) => ({ zutatId: t.zutatId, menge: t.menge * (anzahl[k.id] ?? 0) }))),
  ).filter((p) => p.menge > 0)
}

export interface Zeile {
  zutatId: string
  bedarf: number
  ausBestand: number
  kaufen: number
}

/** Bestand wird zuerst dem Teig, dann den Toppings zugeteilt, damit gemeinsame Zutaten nicht doppelt zählen. */
export function einkaufsliste(
  teig: Posten[],
  toppings: Posten[],
  bestand: Record<string, number>,
): { teig: Zeile[]; toppings: Zeile[] } {
  const rest: Record<string, number> = { ...bestand }
  const zeilen = (posten: Posten[]) =>
    posten.map((p) => {
      const ausBestand = Math.min(p.menge, Math.max(0, rest[p.zutatId] ?? 0))
      rest[p.zutatId] = (rest[p.zutatId] ?? 0) - ausBestand
      return { zutatId: p.zutatId, bedarf: p.menge, ausBestand, kaufen: p.menge - ausBestand }
    })
  return { teig: zeilen(teig), toppings: zeilen(toppings) }
}

/** Verbrauch vom Bestand abziehen (nie unter 0). */
export function abbuchen(bestand: Record<string, number>, verbrauch: Posten[]): Record<string, number> {
  const neu = { ...bestand }
  for (const p of verbrauch) if (p.zutatId in neu) neu[p.zutatId] = Math.max(0, neu[p.zutatId] - p.menge)
  return neu
}
