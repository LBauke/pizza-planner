import { describe, expect, it } from 'vitest'
import { ALTE_VORLAGEN, START_TEIGE, START_ZUTATEN } from '../data/defaults'
import { berechneTeig } from './calc'
import { migriere } from './migration'

const hybrid = START_TEIGE[0]
const altZutaten = START_ZUTATEN.filter((z) => z.id !== 'mehl00')
const clone = <T,>(x: T): T => JSON.parse(JSON.stringify(x))

describe('Migration v1 → v2', () => {
  it('ersetzt unveränderte Vorlagen und ergänzt Mehl Type 00', () => {
    const neu = migriere({ zutaten: altZutaten, teige: clone([hybrid, ...ALTE_VORLAGEN]) }, 1)
    expect(neu.zutaten.some((z) => z.id === 'mehl00')).toBe(true)
    expect(neu.teige.map((t) => t.name)).toEqual(['Hybridteig 24 h', 'Biga 100 %', 'Neapolitanisch 48 h'])
  })

  it('behält bearbeitete Vorlagen und fügt das Video-Rezept zusätzlich hinzu', () => {
    const teige = clone([hybrid, ...ALTE_VORLAGEN])
    teige[2].stufen[0].zutaten[1].menge = 660
    const neu = migriere({ zutaten: altZutaten, teige }, 1)
    expect(neu.teige.find((t) => t.id === 'neapel48')!.stufen[0].zutaten[1].menge).toBe(660)
    expect(neu.teige.find((t) => t.id === 'neapel48-video')!.name).toBe('Neapolitanisch 48 h (Video)')
  })

  it('lässt v2-Daten unverändert', () => {
    const s = { zutaten: altZutaten, teige: [hybrid] }
    expect(migriere(s, 2)).toBe(s)
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
    const r = berechneTeig(t, START_ZUTATEN, 6, 285, 6000)
    expect(r.teigGesamt).toBe(1710) // Rezept ergibt 1714 g
  })
})
