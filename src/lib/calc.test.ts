import { describe, expect, it } from 'vitest'
import { START_KREATIONEN, START_PLAN, START_TEIGE, START_ZUTATEN } from '../data/defaults'
import {
  abbuchen,
  anzahlPizzen,
  baeckerprozent,
  berechneTeig,
  berechneToppings,
  einkaufsliste,
  pizzenJeKreation,
  pizzenJeTeig,
  verteile,
  zusammenfassen,
} from './calc'
import { gramm, menge, parseZahl } from './format'

const hybrid = START_TEIGE[0]
const g = (posten: { zutatId: string; menge: number }[], id: string) => posten.find((p) => p.zutatId === id)!.menge

describe('anzahlPizzen', () => {
  it('rechnet Personen × Pizzen pro Person', () => {
    expect(anzahlPizzen({ ...START_PLAN, personen: 12 })).toBe(12)
  })
  it('rundet Puffer auf, ohne Gleitkomma-Fehler', () => {
    // 12 × 1,1 = 13,2 → aufgerundet 14
    expect(anzahlPizzen({ ...START_PLAN, personen: 12, puffer: 10 })).toBe(14)
    // 10 × 1,1 = 11,000000000000002 → genau 11
    expect(anzahlPizzen({ ...START_PLAN, personen: 10, puffer: 10 })).toBe(11)
  })
})

describe('berechneTeig (Hybrid)', () => {
  it('Originalrezept ergibt 6 Ballen à 280 g', () => {
    const r = berechneTeig(hybrid, START_ZUTATEN, 6, 280, 6000)
    expect(r.teigGesamt).toBe(1680)
    expect(g(r.gesamt, 'mehl')).toBeCloseTo(997.92, 1)
  })
  it('12 Personen', () => {
    const r = berechneTeig(hybrid, START_ZUTATEN, 12, 280, 6000)
    expect(g(r.gesamt, 'mehl')).toBeCloseTo(1995.84, 1)
    expect(g(r.gesamt, 'wasser')).toBeCloseTo(1237.4, 1)
    expect(g(r.gesamt, 'hefe')).toBeCloseTo(6.99, 1)
    expect(r.durchgaenge).toBe(1)
  })
  it('teilt in Durchgänge, wenn Mehl die Knetkapazität übersteigt', () => {
    const r = berechneTeig(hybrid, START_ZUTATEN, 20, 280, 3000)
    expect(r.mehlGesamt).toBeCloseTo(3326.4, 1)
    expect(r.durchgaenge).toBe(2)
  })
  it('Bäckerprozent', () => {
    expect(baeckerprozent(620, 1000)).toBe(62)
    expect(baeckerprozent(3.5, 1000)).toBeCloseTo(0.35)
  })
  it('mehrstufiger Teig fasst gleiche Zutaten zusammen', () => {
    const r = berechneTeig(START_TEIGE[1], START_ZUTATEN, 6, 280, 6000)
    expect(r.gesamt.filter((p) => p.zutatId === 'wasser')).toHaveLength(1)
    expect(r.stufen).toHaveLength(2)
  })
})

describe('Mehl in festen Schritten', () => {
  it('rundet auf volle kg Mehl auf und ergibt Reserve-Ballen', () => {
    // 10 Pizzen Hybrid brauchen 1.663 g Mehl → 2.000 g
    const r = berechneTeig(hybrid, START_ZUTATEN, 10, 280, 6000, 1000)
    expect(r.mehlGesamt).toBeCloseTo(2000, 6)
    expect(g(r.gesamt, 'wasser')).toBeCloseTo(1240, 6)
    expect(r.ballen).toBe(12)
  })
  it('genau 1 kg bleibt 1 kg', () => {
    const r = berechneTeig(hybrid, START_ZUTATEN, 6, 280, 6000, 1000)
    expect(r.mehlGesamt).toBeCloseTo(1000, 6)
    expect(r.ballen).toBe(6)
  })
  it('ohne Schritt keine Rundung', () => {
    expect(berechneTeig(hybrid, START_ZUTATEN, 10, 280, 6000, 0).ballen).toBe(10)
  })
})

describe('Mehrere Teige', () => {
  it('verteilt Pizzen gleichmäßig auf ausgewählte Teige', () => {
    const plan = { ...START_PLAN, personen: 11, teigAuswahl: { hybrid: 1, neapel48: 1 } }
    expect(pizzenJeTeig(plan, START_TEIGE)).toEqual({ hybrid: 6, neapel48: 5 })
  })
  it('ein einzelner Teig bekommt alle Pizzen, auch bei manueller Verteilung', () => {
    const plan = { ...START_PLAN, personen: 12, teigAuto: false, teigAuswahl: { hybrid: 1 } }
    expect(pizzenJeTeig(plan, START_TEIGE)).toEqual({ hybrid: 12 })
  })
  it('manuelle Anzahl je Teig', () => {
    const plan = { ...START_PLAN, teigAuto: false, teigAuswahl: { biga: 4, hybrid: 8 } }
    expect(pizzenJeTeig(plan, START_TEIGE)).toEqual({ hybrid: 8, biga: 4 })
  })
  it('Mehl aller Teige wird in der Einkaufsliste zusammengezählt', () => {
    const a = berechneTeig(START_TEIGE[0], START_ZUTATEN, 6, 280, 6000)
    const b = berechneTeig(START_TEIGE[2], START_ZUTATEN, 6, 280, 6000)
    const liste = einkaufsliste(zusammenfassen([...a.gesamt, ...b.gesamt]), [], {})
    expect(liste.teig.filter((z) => z.zutatId === 'mehl')).toHaveLength(1)
    expect(g(liste.teig.map((z) => ({ zutatId: z.zutatId, menge: z.bedarf })), 'mehl')).toBeCloseTo(a.mehlGesamt + b.mehlGesamt, 6)
  })
})

describe('Kreationen', () => {
  it('verteilt gleichmäßig mit Rest vorne', () => {
    expect(verteile(7, ['a', 'b', 'c'])).toEqual({ a: 3, b: 2, c: 2 })
  })
  it('Margherita × 10', () => {
    const anzahl = pizzenJeKreation(START_PLAN, START_KREATIONEN)
    const t = berechneToppings(START_KREATIONEN, anzahl)
    expect(g(t, 'mozzarella')).toBe(1000)
    expect(g(t, 'tomatensauce')).toBe(1600)
  })
  it('manuelle Verteilung nutzt eingetragene Anzahl', () => {
    const anzahl = pizzenJeKreation({ ...START_PLAN, autoVerteilung: false, auswahl: { margherita: 3 } }, START_KREATIONEN)
    expect(anzahl).toEqual({ margherita: 3 })
  })
})

describe('Einkaufsliste & Bestand', () => {
  it('teilt Bestand zwischen Teig und Toppings auf', () => {
    const l = einkaufsliste([{ zutatId: 'oel', menge: 60 }], [{ zutatId: 'oel', menge: 50 }], { oel: 80 })
    expect(l.teig[0]).toMatchObject({ ausBestand: 60, kaufen: 0 })
    expect(l.toppings[0]).toMatchObject({ ausBestand: 20, kaufen: 30 })
  })
  it('bucht ab, nie unter 0', () => {
    expect(abbuchen({ mehl: 1000, salz: 10 }, [{ zutatId: 'mehl', menge: 400 }, { zutatId: 'salz', menge: 50 }])).toEqual({
      mehl: 600,
      salz: 0,
    })
  })
})

describe('Formatierung', () => {
  it('Gramm und kg', () => {
    expect(gramm(3.5)).toBe('3,5 g')
    expect(gramm(1995.84)).toBe('1.996 g')
    expect(menge(1600)).toBe('1,60 kg')
  })
  it('liest Komma-Zahlen', () => {
    expect(parseZahl('3,5')).toBe(3.5)
    expect(parseZahl('abc')).toBeNull()
  })
})
