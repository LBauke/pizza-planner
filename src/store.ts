import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import {
  START_KAPAZITAET_MEHL,
  START_KREATIONEN,
  START_PLAN,
  START_TEIGE,
  START_ZUTATEN,
} from './data/defaults'
import { imKatalog } from './data/katalog'
import { abbuchen } from './lib/calc'
import { migriere, normalisierePlan } from './lib/migration'
import type { GespeichertePlanung, Kategorie, Kreation, Plan, Posten, Teigrezept, Zutat } from './types'

export const neueId = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2) + Date.now().toString(36)

interface State {
  zutaten: Zutat[]
  teige: Teigrezept[]
  kreationen: Kreation[]
  bestand: Record<string, number>
  plan: Plan
  planungen: GespeichertePlanung[]
  kapazitaetMehl: number
  abgehakt: Record<string, boolean>

  setPlan: (p: Partial<Plan>) => void
  toggleKreation: (id: string) => void
  toggleTeig: (id: string) => void
  setKapazitaet: (n: number) => void

  /** Sucht eine Zutat per Name (ohne Groß/Klein) oder legt sie an. */
  zutatFuerName: (name: string, kategorie: Kategorie) => string
  updateZutat: (id: string, z: Partial<Zutat>) => void
  deleteZutat: (id: string) => void

  upsertTeig: (t: Teigrezept) => void
  deleteTeig: (id: string) => void
  upsertKreation: (k: Kreation) => void
  deleteKreation: (id: string) => void

  setBestand: (id: string, menge: number | null) => void
  verbrauchAbbuchen: (verbrauch: Posten[]) => void

  toggleAbgehakt: (key: string) => void
  resetAbgehakt: () => void

  planungSpeichern: (name: string) => void
  planungLaden: (id: string) => void
  planungLoeschen: (id: string) => void
}

export const useStore = create<State>()(
  persist(
    (set, get) => ({
      zutaten: START_ZUTATEN,
      teige: START_TEIGE,
      kreationen: START_KREATIONEN,
      bestand: {},
      plan: START_PLAN,
      planungen: [],
      kapazitaetMehl: START_KAPAZITAET_MEHL,
      abgehakt: {},

      setPlan: (p) => set((s) => ({ plan: { ...s.plan, ...p } })),
      toggleKreation: (id) =>
        set((s) => {
          const auswahl = { ...s.plan.auswahl }
          if (id in auswahl) delete auswahl[id]
          else auswahl[id] = 1
          return { plan: { ...s.plan, auswahl } }
        }),
      toggleTeig: (id) =>
        set((s) => {
          const teigAuswahl = { ...s.plan.teigAuswahl }
          if (id in teigAuswahl) delete teigAuswahl[id]
          else teigAuswahl[id] = 1
          return { plan: { ...s.plan, teigAuswahl } }
        }),
      setKapazitaet: (n) => set({ kapazitaetMehl: n }),

      zutatFuerName: (name, kategorie) => {
        const n = name.trim()
        const vorhanden = get().zutaten.find((z) => z.name.toLowerCase() === n.toLowerCase())
        if (vorhanden) return vorhanden.id
        const kat: Kategorie = /mehl/i.test(n) ? 'mehl' : (imKatalog(n)?.kategorie ?? kategorie)
        const z: Zutat = { id: neueId(), name: n, kategorie: kat }
        set((s) => ({ zutaten: [...s.zutaten, z] }))
        return z.id
      },
      updateZutat: (id, z) => set((s) => ({ zutaten: s.zutaten.map((x) => (x.id === id ? { ...x, ...z } : x)) })),
      deleteZutat: (id) =>
        set((s) => {
          const bestand = { ...s.bestand }
          delete bestand[id]
          return { zutaten: s.zutaten.filter((z) => z.id !== id), bestand }
        }),

      upsertTeig: (t) =>
        set((s) => ({
          teige: s.teige.some((x) => x.id === t.id) ? s.teige.map((x) => (x.id === t.id ? t : x)) : [...s.teige, t],
        })),
      deleteTeig: (id) =>
        set((s) => {
          const teige = s.teige.filter((t) => t.id !== id)
          const teigAuswahl = { ...s.plan.teigAuswahl }
          delete teigAuswahl[id]
          return { teige, plan: { ...s.plan, teigAuswahl } }
        }),
      upsertKreation: (k) =>
        set((s) => ({
          kreationen: s.kreationen.some((x) => x.id === k.id)
            ? s.kreationen.map((x) => (x.id === k.id ? k : x))
            : [...s.kreationen, k],
        })),
      deleteKreation: (id) =>
        set((s) => {
          const auswahl = { ...s.plan.auswahl }
          delete auswahl[id]
          return { kreationen: s.kreationen.filter((k) => k.id !== id), plan: { ...s.plan, auswahl } }
        }),

      setBestand: (id, menge) =>
        set((s) => {
          const bestand = { ...s.bestand }
          if (menge === null) delete bestand[id]
          else bestand[id] = Math.max(0, menge)
          return { bestand }
        }),
      verbrauchAbbuchen: (verbrauch) => set((s) => ({ bestand: abbuchen(s.bestand, verbrauch), abgehakt: {} })),

      toggleAbgehakt: (key) => set((s) => ({ abgehakt: { ...s.abgehakt, [key]: !s.abgehakt[key] } })),
      resetAbgehakt: () => set({ abgehakt: {} }),

      planungSpeichern: (name) =>
        set((s) => ({
          planungen: [
            { id: neueId(), name: name.trim() || 'Planung', datum: new Date().toISOString(), plan: s.plan },
            ...s.planungen,
          ],
        })),
      planungLaden: (id) =>
        set((s) => {
          const p = s.planungen.find((x) => x.id === id)
          return p ? { plan: normalisierePlan(p.plan) } : {}
        }),
      planungLoeschen: (id) => set((s) => ({ planungen: s.planungen.filter((p) => p.id !== id) })),
    }),
    {
      name: 'pizza-planner',
      version: 3,
      migrate: (persisted, version) => migriere(persisted as State, version),
    },
  ),
)

export const useZutatName = () => {
  const zutaten = useStore((s) => s.zutaten)
  return (id: string) => zutaten.find((z) => z.id === id)?.name ?? '?'
}
