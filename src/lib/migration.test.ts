import { describe, expect, it } from 'vitest'
import { ALTE_VORLAGEN, START_PLAN, START_TEIGE, START_ZUTATEN } from '../data/defaults'
import type { Plan, Teigrezept } from '../types'
import { berechneTeig } from './calc'
import { migriere, normalisierePlan } from './migration'

const hybrid = START_TEIGE[0]
const clone = <T,>(x: T): T => JSON.parse(JSON.stringify(x))
const alterPlan = (teigId: string) => {
  const { teigAuswahl: _a, teigAuto: _b, mehlRunden: _c, mehlSchritt: _d, ...rest } = START_PLAN
  return { ...rest, teigId } as unknown as Plan
}

describe('Migration v1 → v3', () => {
  it('ersetzt unveränderte Vorlagen, alles mit dem einen Pizzamehl', () => {
    const neu = migriere({ zutaten: START_ZUTATEN, teige: clone([hybrid, ...ALTE_VORLAGEN]), plan: alterPlan('biga') }, 1)
    expect(neu.teige.map((t) => t.name)).toEqual(['Hybridteig 24 h', 'Biga 100 %', 'Neapolitanisch 48 h'])
    const mehlIds = new Set(neu.teige.flatMap((t) => t.stufen.flatMap((s) => s.zutaten.map((p) => p.zutatId))).values())
    expect(mehlIds.has('mehl')).toBe(true)
    expect(mehlIds.has('mehl00')).toBe(false)
    expect(neu.plan!.teigAuswahl).toEqual({ biga: 1 })
  })

  it('behält bearbeitete Vorlagen und fügt das Video-Rezept zusätzlich hinzu', () => {
    const teige = clone([hybrid, ...ALTE_VORLAGEN])
    teige[2].stufen[0].zutaten[1].menge = 660
    const neu = migriere({ zutaten: START_ZUTATEN, teige }, 1)
    expect(neu.teige.find((t) => t.id === 'neapel48')!.stufen[0].zutaten[1].menge).toBe(660)
    expect(neu.teige.find((t) => t.id === 'neapel48-video')!.name).toBe('Neapolitanisch 48 h (Video)')
  })
})

describe('Migration v2 → v3', () => {
  it('ersetzt Weizenmehl Type 00 durch Pizzamehl, inkl. Bestand und gespeicherter Planungen', () => {
    const teig: Teigrezept = { ...clone(START_TEIGE[2]) }
    teig.stufen[0].zutaten[0].zutatId = 'mehl00'
    const zutaten = [...START_ZUTATEN, { id: 'mehl00', name: 'Weizenmehl Type 00', kategorie: 'mehl' as const }]
    const neu = migriere(
      {
        zutaten,
        teige: [teig],
        bestand: { mehl: 1000, mehl00: 2500 },
        plan: alterPlan('neapel48'),
        planungen: [{ id: 'x', name: 'Alt', datum: '', plan: alterPlan('hybrid') }],
      },
      2,
    )
    expect(neu.zutaten.some((z) => z.id === 'mehl00')).toBe(false)
    expect(neu.teige[0].stufen[0].zutaten[0].zutatId).toBe('mehl')
    expect(neu.bestand).toEqual({ mehl: 3500 })
    expect(neu.plan!.teigAuswahl).toEqual({ neapel48: 1 })
    expect(neu.planungen![0].plan.teigAuswahl).toEqual({ hybrid: 1 })
  })

  it('lässt v3-Daten unverändert', () => {
    const s = { zutaten: START_ZUTATEN, teige: [hybrid] }
    expect(migriere(s, 3)).toBe(s)
  })

  it('normalisierePlan ergänzt fehlende Felder', () => {
    const p = normalisierePlan({ personen: 7 })
    expect(p.personen).toBe(7)
    expect(p.mehlSchritt).toBe(1000)
    expect(p.teigAuswahl).toEqual(START_PLAN.teigAuswahl)
  })
})

describe('Video-Rezepte', () => {
  it('Neapolitanisch: 70 % Hydration, 6 Ballen à 280 g', () => {
    const t = START_TEIGE.find((x) => x.id === 'neapel48')!
    const r = berechneTeig(t, START_ZUTATEN, 6, 280, 6000)
    expect(r.mehlReferenz).toBe(1000)
    expect(r.mehlGesamt).toBeCloseTo((1680 / 1732.5) * 1000, 3)
  })
  it('Biga: 68 % Hydration über beide Stufen', () => {
    const t = START_TEIGE.find((x) => x.id === 'biga')!
    const wasser = t.stufen.flatMap((s) => s.zutaten).filter((p) => p.zutatId === 'wasser').reduce((a, p) => a + p.menge, 0)
    expect(wasser / 1000).toBeCloseTo(0.68)
    expect(berechneTeig(t, START_ZUTATEN, 6, 285, 6000).teigGesamt).toBe(1710)
  })
})
