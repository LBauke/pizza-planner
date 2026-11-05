import { imKatalog, type KatalogZutat, type Tag } from '../data/katalog'
import type { Kategorie, Zutat } from '../types'

export type Slot = 'sauce' | 'kaese' | 'fleisch' | 'gemuese' | 'finish'
export const SLOTS: Slot[] = ['sauce', 'kaese', 'fleisch', 'gemuese', 'finish']
export const SLOT_NAMEN: Record<Slot, string> = {
  sauce: 'Basis',
  kaese: 'Käse',
  fleisch: 'Fleisch / Fisch',
  gemuese: 'Gemüse',
  finish: 'Finish',
}

export interface Teil {
  slot: Slot
  zutat: KatalogZutat
}

export interface Idee {
  teile: Teil[]
}

type Rng = () => number

/** Gut zusammenpassende Gegensätze */
const KONTRASTE: [Tag, Tag][] = [
  ['salzig', 'suess'],
  ['scharf', 'suess'],
  ['scharf', 'cremig'],
  ['cremig', 'saeuerlich'],
  ['cremig', 'frisch'],
  ['rauchig', 'suess'],
  ['kraeftig', 'suess'],
  ['erdig', 'frisch'],
]
/** Tags, die nur einmal vorkommen sollten, sonst wird es zu viel */
const NUR_EINMAL: Tag[] = ['scharf', 'suess', 'kraeftig', 'rauchig']

const STANDARD_MENGE: Record<Slot, number> = { sauce: 150, kaese: 100, fleisch: 60, gemuese: 60, finish: 10 }

/**
 * Zutaten-Pool: entweder der eingebaute Katalog (ergänzt um eigene Zutaten)
 * oder nur die eigenen Zutaten. Eigene Zutaten bekommen Tags/Menge aus dem Katalog, falls bekannt.
 */
export function baueZutatenPool(katalog: KatalogZutat[], eigene: Zutat[], nurEigene: boolean): KatalogZutat[] {
  const istSlot = (k: Kategorie): k is Slot => (SLOTS as string[]).includes(k)
  const eigenePool = eigene
    .filter((z) => istSlot(z.kategorie))
    .map((z) => imKatalog(z.name) ?? { name: z.name, kategorie: z.kategorie, menge: STANDARD_MENGE[z.kategorie as Slot], tags: [] })
  if (nurEigene) return eigenePool
  const namen = new Set(katalog.map((k) => k.name.toLowerCase()))
  return [...katalog, ...eigenePool.filter((z) => !namen.has(z.name.toLowerCase()))]
}

export function bewerte(teile: Teil[]): number {
  const tags = teile.flatMap((t) => t.zutat.tags)
  const set = new Set(tags)
  let score = set.size
  for (const [a, b] of KONTRASTE) if (set.has(a) && set.has(b)) score += 2
  for (const t of NUR_EINMAL) if (tags.filter((x) => x === t).length > 1) score -= 3
  return score
}

const zufall = <T,>(liste: T[], rng: Rng): T | undefined => liste[Math.floor(rng() * liste.length)]

function anzahlFuer(slot: Slot, vegetarisch: boolean, rng: Rng): number {
  switch (slot) {
    case 'sauce':
      return 1
    case 'kaese':
      return rng() < 0.7 ? 1 : 2
    case 'fleisch':
      return vegetarisch ? 0 : rng() < 0.6 ? 1 : 0
    case 'gemuese':
      return rng() < 0.5 ? 1 : 2
    case 'finish':
      return rng() < 0.65 ? 1 : 0
  }
}

function kandidat(pool: KatalogZutat[], vegetarisch: boolean, rng: Rng): Teil[] {
  const teile: Teil[] = []
  for (const slot of SLOTS) {
    const n = anzahlFuer(slot, vegetarisch, rng)
    for (let i = 0; i < n; i++) {
      const frei = pool.filter((z) => z.kategorie === slot && !teile.some((t) => t.zutat.name === z.name))
      const z = zufall(frei, rng)
      if (z) teile.push({ slot, zutat: z })
    }
  }
  return teile
}

export interface IdeenOptionen {
  pool: KatalogZutat[]
  vegetarisch: boolean
}

/** Erzeugt mehrere Zufallskandidaten und nimmt den stimmigsten. */
export function generiere({ pool, vegetarisch }: IdeenOptionen, rng: Rng = Math.random, versuche = 8): Idee {
  let beste: Teil[] = []
  let besterScore = -Infinity
  for (let i = 0; i < versuche; i++) {
    const k = kandidat(pool, vegetarisch, rng)
    const s = bewerte(k)
    if (s > besterScore) {
      beste = k
      besterScore = s
    }
  }
  return { teile: beste }
}

/** Tauscht eine Zutat gegen eine andere derselben Kategorie (bevorzugt eine, die besser passt). */
export function tausche(idee: Idee, index: number, { pool }: IdeenOptionen, rng: Rng = Math.random): Idee {
  const alt = idee.teile[index]
  if (!alt) return idee
  const frei = pool.filter((z) => z.kategorie === alt.slot && !idee.teile.some((t) => t.zutat.name === z.name))
  if (frei.length === 0) return idee
  // drei zufällige Alternativen ansehen, die passendste nehmen
  const proben = Array.from({ length: Math.min(3, frei.length) }, () => zufall(frei, rng)!)
  const mit = (z: KatalogZutat) => idee.teile.map((t, i) => (i === index ? { slot: t.slot, zutat: z } : t))
  const neu = proben.reduce((a, b) => (bewerte(mit(b)) > bewerte(mit(a)) ? b : a))
  return { teile: mit(neu) }
}

export function tagsVon(idee: Idee): Tag[] {
  return [...new Set(idee.teile.flatMap((t) => t.zutat.tags))]
}

/** Name aus den markantesten Zutaten, z. B. „Salsiccia & Friarielli“. */
export function ideeName(idee: Idee): string {
  const reihenfolge: Slot[] = ['fleisch', 'gemuese', 'finish', 'kaese']
  const namen = reihenfolge.flatMap((s) => idee.teile.filter((t) => t.slot === s).map((t) => t.zutat.name))
  const kurz = (n: string) => n.replace(/\s*\(.*\)/, '')
  if (namen.length === 0) return 'Neue Kreation'
  if (namen.length === 1) return kurz(namen[0])
  return `${kurz(namen[0])} & ${kurz(namen[1])}`
}
