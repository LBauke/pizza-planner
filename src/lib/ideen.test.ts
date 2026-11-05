import { describe, expect, it } from 'vitest'
import { KATALOG } from '../data/katalog'
import type { Zutat } from '../types'
import { baueZutatenPool, bewerte, generiere, ideeName, tausche, type Teil } from './ideen'

/** deterministischer Zufall für reproduzierbare Tests */
function seeded(seed: number) {
  return () => {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const opt = { pool: KATALOG, vegetarisch: false }
const k = (name: string) => KATALOG.find((z) => z.name === name)!
const teil = (name: string): Teil => ({ slot: k(name).kategorie as Teil['slot'], zutat: k(name) })

describe('Ideen-Generator', () => {
  it('jede Idee hat genau eine Basis, mind. einen Käse und keine doppelten Zutaten', () => {
    for (let s = 1; s <= 200; s++) {
      const idee = generiere(opt, seeded(s))
      expect(idee.teile.filter((t) => t.slot === 'sauce')).toHaveLength(1)
      expect(idee.teile.filter((t) => t.slot === 'kaese').length).toBeGreaterThanOrEqual(1)
      const namen = idee.teile.map((t) => t.zutat.name)
      expect(new Set(namen).size).toBe(namen.length)
    }
  })

  it('vegetarisch enthält kein Fleisch/Fisch', () => {
    for (let s = 1; s <= 200; s++) {
      expect(generiere({ ...opt, vegetarisch: true }, seeded(s)).teile.some((t) => t.slot === 'fleisch')).toBe(false)
    }
  })

  it('bewertet Kontraste besser als Doppelungen', () => {
    const kontrast = [teil('Tomatensauce'), teil('Gorgonzola'), teil('Birne'), teil('Walnüsse')]
    const doppelt = [teil('Tomatensauce'), teil('Mozzarella'), teil('Nduja'), teil('Jalapeños'), teil('Chiliöl')]
    expect(bewerte(kontrast)).toBeGreaterThan(bewerte(doppelt))
  })

  it('tauschen ersetzt nur die gewählte Zutat und bleibt in der Kategorie', () => {
    const idee = generiere(opt, seeded(7))
    const neu = tausche(idee, 0, opt, seeded(99))
    expect(neu.teile[0].slot).toBe(idee.teile[0].slot)
    expect(neu.teile[0].zutat.name).not.toBe(idee.teile[0].zutat.name)
    expect(neu.teile.slice(1)).toEqual(idee.teile.slice(1))
  })

  it('„nur meine Zutaten“ nutzt nur eigene Zutaten, mit Tags aus dem Katalog', () => {
    const eigene: Zutat[] = [
      { id: '1', name: 'Tomatensauce', kategorie: 'sauce' },
      { id: '2', name: 'Mozzarella', kategorie: 'kaese' },
      { id: '3', name: 'Mein Spezialkäse', kategorie: 'kaese' },
      { id: '4', name: 'Pizzamehl', kategorie: 'mehl' },
    ]
    const pool = baueZutatenPool(KATALOG, eigene, true)
    expect(pool.map((p) => p.name)).toEqual(['Tomatensauce', 'Mozzarella', 'Mein Spezialkäse'])
    expect(pool[1].tags).toContain('cremig')
    expect(pool[2].menge).toBe(100)
  })

  it('Katalog + eigene Zutaten ohne Duplikate', () => {
    const pool = baueZutatenPool(KATALOG, [{ id: '1', name: 'mozzarella', kategorie: 'kaese' }], false)
    expect(pool.filter((p) => p.name.toLowerCase() === 'mozzarella')).toHaveLength(1)
  })

  it('Name aus markanten Zutaten', () => {
    expect(ideeName({ teile: [teil('Tomatensauce'), teil('Mozzarella'), teil('Salsiccia'), teil('Friarielli')] })).toBe(
      'Salsiccia & Friarielli',
    )
    expect(ideeName({ teile: [teil('Tomatensauce'), teil('Scamorza (geräuchert)')] })).toBe('Scamorza')
  })
})
