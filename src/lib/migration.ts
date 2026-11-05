import { ALTE_VORLAGEN, MEHL_00, START_TEIGE } from '../data/defaults'
import type { Teigrezept, Zutat } from '../types'

interface Teil {
  zutaten: Zutat[]
  teige: Teigrezept[]
}

/**
 * v1 → v2: Biga- und 48-h-Rezept aus den Teichners-Videos.
 * Unveränderte alte Vorlagen werden ersetzt; bearbeitete bleiben erhalten und das neue Rezept kommt zusätzlich dazu.
 */
export function migriere<T extends Teil>(state: T, version: number): T {
  if (version >= 2) return state
  const zutaten = state.zutaten.some((z) => z.id === MEHL_00.id) ? state.zutaten : [...state.zutaten, MEHL_00]
  const teige = [...state.teige]
  for (const neu of START_TEIGE.filter((t) => t.id === 'biga' || t.id === 'neapel48')) {
    const alt = ALTE_VORLAGEN.find((a) => a.id === neu.id)
    const i = teige.findIndex((t) => t.id === neu.id)
    if (i === -1) teige.push(neu)
    else if (JSON.stringify(teige[i]) === JSON.stringify(alt)) teige[i] = neu
    else teige.push({ ...neu, id: `${neu.id}-video`, name: `${neu.name} (Video)` })
  }
  return { ...state, zutaten, teige }
}
