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
}

export function berechneTeig(
  rezept: Teigrezept,
  zutaten: Zutat[],
  pizzen: number,
  ballengewicht: number,
  kapazitaetMehl: number,
): TeigErgebnis {
  const alle = rezept.stufen.flatMap((s) => s.zutaten)
  const referenz = summe(alle)
  const teigGesamt = pizzen * ballengewicht
  const faktor = referenz > 0 ? teigGesamt / referenz : 0
  const istMehl = (id: string) => zutaten.find((z) => z.id === id)?.kategorie === 'mehl'

  const stufen = rezept.stufen.map((s) => ({
    name: s.name,
    zutaten: s.zutaten.map((p) => ({ zutatId: p.zutatId, menge: p.menge * faktor })),
  }))
  const gesamt = zusammenfassen(stufen.flatMap((s) => s.zutaten))
  const mehlReferenz = summe(alle.filter((p) => istMehl(p.zutatId)))
  const mehlGesamt = mehlReferenz * faktor
  const durchgaenge =
    kapazitaetMehl > 0 && mehlGesamt > kapazitaetMehl + EPS ? Math.ceil(mehlGesamt / kapazitaetMehl - EPS) : 1

  return { teigGesamt, stufen, gesamt, mehlGesamt, mehlReferenz, durchgaenge }
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

/** Anzahl Pizzen je ausgewählter Kreation (berücksichtigt Auto-Verteilung). */
export function pizzenJeKreation(plan: Plan, kreationen: Kreation[]): Record<string, number> {
  const ids = kreationen.filter((k) => k.id in plan.auswahl).map((k) => k.id)
  if (plan.autoVerteilung) return verteile(anzahlPizzen(plan), ids)
  return Object.fromEntries(ids.map((id) => [id, Math.max(0, plan.auswahl[id] ?? 0)]))
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
