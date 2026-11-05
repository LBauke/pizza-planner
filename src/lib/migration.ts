import { ALTE_VORLAGEN, START_PLAN, START_TEIGE } from '../data/defaults'
import type { GespeichertePlanung, Kreation, Plan, Posten, Teigrezept, Zutat } from '../types'

export interface PersistState {
  zutaten: Zutat[]
  teige: Teigrezept[]
  kreationen?: Kreation[]
  bestand?: Record<string, number>
  plan?: Plan
  planungen?: GespeichertePlanung[]
}

/** Alte Pläne (ein Teig per `teigId`) ins neue Format mit mehreren Teigen bringen. */
export function normalisierePlan(p: Partial<Plan> & { teigId?: string }): Plan {
  const { teigId, ...rest } = p
  return {
    ...START_PLAN,
    ...rest,
    teigAuswahl: p.teigAuswahl ?? (teigId ? { [teigId]: 1 } : { ...START_PLAN.teigAuswahl }),
    teigAuto: p.teigAuto ?? true,
  }
}

/** v1 → v2: Biga- und 48-h-Rezept aus den Teichners-Videos. */
function v2<T extends PersistState>(state: T): T {
  const teige = [...state.teige]
  for (const neu of START_TEIGE.filter((t) => t.id === 'biga' || t.id === 'neapel48')) {
    const alt = ALTE_VORLAGEN.find((a) => a.id === neu.id)
    const i = teige.findIndex((t) => t.id === neu.id)
    if (i === -1) teige.push(neu)
    else if (JSON.stringify(teige[i]) === JSON.stringify(alt)) teige[i] = neu
    else teige.push({ ...neu, id: `${neu.id}-video`, name: `${neu.name} (Video)` })
  }
  return { ...state, teige }
}

/** v2 → v3: nur noch ein Pizzamehl („Weizenmehl Type 00“ wird zu „Pizzamehl“), Plan mit mehreren Teigen. */
function v3<T extends PersistState>(state: T): T {
  const ersetze = (p: Posten): Posten => (p.zutatId === 'mehl00' ? { ...p, zutatId: 'mehl' } : p)
  const teige = state.teige.map((t) => ({
    ...t,
    stufen: t.stufen.map((s) => ({ ...s, zutaten: s.zutaten.map(ersetze) })),
  }))
  const kreationen = state.kreationen?.map((k) => ({ ...k, toppings: k.toppings.map(ersetze) }))

  let zutaten = state.zutaten.filter((z) => z.id !== 'mehl00')
  if (!zutaten.some((z) => z.id === 'mehl')) zutaten = [{ id: 'mehl', name: 'Pizzamehl', kategorie: 'mehl' }, ...zutaten]

  let bestand = state.bestand
  if (bestand && 'mehl00' in bestand) {
    const { mehl00, ...rest } = bestand
    bestand = { ...rest, mehl: (rest.mehl ?? 0) + mehl00 }
  }

  return {
    ...state,
    zutaten,
    teige,
    ...(kreationen && { kreationen }),
    ...(bestand && { bestand }),
    ...(state.plan && { plan: normalisierePlan(state.plan) }),
    ...(state.planungen && { planungen: state.planungen.map((p) => ({ ...p, plan: normalisierePlan(p.plan) })) }),
  }
}

export function migriere<T extends PersistState>(state: T, version: number): T {
  let s = state
  if (version < 2) s = v2(s)
  if (version < 3) s = v3(s)
  return s
}
