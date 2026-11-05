import { useState, type ReactNode } from 'react'
import { Button, Card, LoeschButton, Segment, TextInput, Zahl, ZutatInput } from '../components/ui'
import { baeckerprozent } from '../lib/calc'
import { gramm, prozent } from '../lib/format'
import { neueId, useStore, useZutatName } from '../store'
import type { Kategorie, Kreation, Posten, Teigrezept } from '../types'

export default function Rezepte() {
  const [tab, setTab] = useState<'pizzen' | 'teige'>('pizzen')
  return (
    <div className="space-y-4">
      <Segment
        wert={tab}
        onChange={setTab}
        optionen={[
          { wert: 'pizzen', label: 'Pizzen' },
          { wert: 'teige', label: 'Teige' },
        ]}
      />
      {tab === 'pizzen' ? <PizzaListe /> : <TeigListe />}
    </div>
  )
}

/* ---------- Zutatenzeilen (gemeinsam) ---------- */

function PostenEditor({
  posten,
  onChange,
  kategorie,
  prozentBasis,
}: {
  posten: Posten[]
  onChange: (p: Posten[]) => void
  kategorie: Kategorie
  prozentBasis?: number
}) {
  const setZeile = (i: number, p: Partial<Posten>) => onChange(posten.map((x, j) => (j === i ? { ...x, ...p } : x)))
  return (
    <div className="space-y-2">
      {posten.map((p, i) => (
        <div key={i} className="flex items-center gap-2">
          <div className="min-w-0 flex-1">
            <ZutatInput zutatId={p.zutatId} kategorie={kategorie} onPick={(zutatId) => setZeile(i, { zutatId })} />
          </div>
          <Zahl className="w-24" label="Menge" suffix="g" value={p.menge} onChange={(n) => setZeile(i, { menge: n ?? 0 })} />
          {prozentBasis !== undefined && (
            <span className="hidden w-14 text-right text-xs text-stone-400 sm:block">{prozent(baeckerprozent(p.menge, prozentBasis))}</span>
          )}
          <button
            type="button"
            aria-label="Zeile entfernen"
            onClick={() => onChange(posten.filter((_, j) => j !== i))}
            className="grid size-9 shrink-0 place-items-center rounded-lg text-stone-400 active:bg-stone-100"
          >
            ✕
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...posten, { zutatId: '', menge: 0 }])}
        className="text-sm font-medium text-tomato-600"
      >
        + Zutat
      </button>
    </div>
  )
}

function Eintrag({ titel, untertitel, offen, onToggle, children }: { titel: string; untertitel: string; offen: boolean; onToggle: () => void; children: ReactNode }) {
  return (
    <section className="rounded-2xl border border-stone-200 bg-white">
      <button type="button" onClick={onToggle} className="flex w-full items-center justify-between gap-2 p-4 text-left">
        <div className="min-w-0">
          <div className="truncate font-semibold">{titel || 'Ohne Namen'}</div>
          <div className="truncate text-sm text-stone-400">{untertitel}</div>
        </div>
        <span className={`text-stone-400 transition-transform ${offen ? 'rotate-90' : ''}`}>›</span>
      </button>
      {offen && <div className="space-y-4 border-t border-stone-100 p-4">{children}</div>}
    </section>
  )
}

/* ---------- Pizzen ---------- */

function PizzaListe() {
  const { kreationen, upsertKreation, deleteKreation } = useStore()
  const name = useZutatName()
  const [offen, setOffen] = useState<string | null>(null)
  return (
    <div className="space-y-3">
      <p className="px-1 text-sm text-stone-500">Toppingmengen pro Pizza (30 cm).</p>
      {kreationen.map((k) => (
        <Eintrag
          key={k.id}
          titel={k.name}
          untertitel={k.toppings.filter((t) => t.zutatId).map((t) => name(t.zutatId)).join(', ') || 'keine Zutaten'}
          offen={offen === k.id}
          onToggle={() => setOffen(offen === k.id ? null : k.id)}
        >
          <TextInput value={k.name} onChange={(n) => upsertKreation({ ...k, name: n })} placeholder="Name" />
          <PostenEditor kategorie="sonstiges" posten={k.toppings} onChange={(toppings) => upsertKreation({ ...k, toppings })} />
          <div className="flex justify-end">
            <LoeschButton onConfirm={() => deleteKreation(k.id)} label="Pizza löschen" />
          </div>
        </Eintrag>
      ))}
      <Button
        className="w-full"
        variante="leise"
        onClick={() => {
          const k: Kreation = { id: neueId(), name: 'Neue Pizza', toppings: [{ zutatId: '', menge: 0 }] }
          upsertKreation(k)
          setOffen(k.id)
        }}
      >
        + Neue Pizza
      </Button>
    </div>
  )
}

/* ---------- Teige ---------- */

function TeigListe() {
  const { teige, upsertTeig, deleteTeig, zutaten, plan } = useStore()
  const [offen, setOffen] = useState<string | null>(null)
  return (
    <div className="space-y-3">
      <p className="px-1 text-sm text-stone-500">
        Mengen für eine beliebige Referenz-Charge eintragen. Die App skaliert automatisch.
      </p>
      {teige.map((t) => {
        const alle = t.stufen.flatMap((s) => s.zutaten)
        const ref = alle.reduce((s, p) => s + p.menge, 0)
        const mehl = alle.filter((p) => zutaten.find((z) => z.id === p.zutatId)?.kategorie === 'mehl').reduce((s, p) => s + p.menge, 0)
        const wasser = alle.filter((p) => /wasser/i.test(zutaten.find((z) => z.id === p.zutatId)?.name ?? '')).reduce((s, p) => s + p.menge, 0)
        const update = (x: Partial<Teigrezept>) => upsertTeig({ ...t, ...x })
        return (
          <Eintrag
            key={t.id}
            titel={t.name}
            untertitel={t.beschreibung}
            offen={offen === t.id}
            onToggle={() => setOffen(offen === t.id ? null : t.id)}
          >
            <TextInput value={t.name} onChange={(name) => update({ name })} placeholder="Name" />
            <TextInput value={t.beschreibung} onChange={(beschreibung) => update({ beschreibung })} placeholder="Beschreibung (optional)" />

            {t.stufen.map((s, i) => (
              <Card key={i}>
                <div className="mb-3 flex items-center gap-2">
                  <TextInput
                    value={s.name}
                    placeholder={t.stufen.length > 1 ? 'Name der Stufe' : 'Stufe (optional, z. B. Biga)'}
                    onChange={(name) => update({ stufen: t.stufen.map((x, j) => (j === i ? { ...x, name } : x)) })}
                  />
                  {t.stufen.length > 1 && (
                    <LoeschButton label="✕" onConfirm={() => update({ stufen: t.stufen.filter((_, j) => j !== i) })} />
                  )}
                </div>
                <PostenEditor
                  kategorie="teig"
                  prozentBasis={mehl}
                  posten={s.zutaten}
                  onChange={(zutaten) => update({ stufen: t.stufen.map((x, j) => (j === i ? { ...x, zutaten } : x)) })}
                />
              </Card>
            ))}
            <button type="button" className="text-sm font-medium text-tomato-600" onClick={() => update({ stufen: [...t.stufen, { name: '', zutaten: [] }] })}>
              + Stufe (z. B. Vorteig)
            </button>

            <div className="rounded-xl bg-stone-50 p-3 text-sm text-stone-600">
              Charge: <b>{gramm(ref)}</b> · ca. {plan.ballengewicht > 0 ? (ref / plan.ballengewicht).toLocaleString('de-DE', { maximumFractionDigits: 1 }) : '–'} Ballen
              à {gramm(plan.ballengewicht)}
              {mehl > 0 && wasser > 0 && <> · Hydration {prozent(baeckerprozent(wasser, mehl))}</>}
              {mehl === 0 && <div className="mt-1 text-tomato-600">Keine Zutat als „Mehl“ markiert (unter Bestand änderbar).</div>}
            </div>

            <label className="block">
              <span className="mb-1 block text-sm font-medium text-stone-600">Zubereitung (ein Schritt pro Zeile)</span>
              <textarea
                rows={Math.max(4, t.schritte.length + 1)}
                value={t.schritte.join('\n')}
                onChange={(e) => update({ schritte: e.target.value.split('\n') })}
                onBlur={() => update({ schritte: t.schritte.map((s) => s.trim()).filter(Boolean) })}
                className="w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 text-sm outline-none focus:border-tomato-500 focus:bg-white"
              />
            </label>

            <div className="flex justify-end">
              <LoeschButton onConfirm={() => deleteTeig(t.id)} label="Teig löschen" />
            </div>
          </Eintrag>
        )
      })}
      <Button
        className="w-full"
        variante="leise"
        onClick={() => {
          const t: Teigrezept = {
            id: neueId(),
            name: 'Neuer Teig',
            beschreibung: '',
            stufen: [{ name: '', zutaten: [{ zutatId: 'mehl', menge: 1000 }] }],
            schritte: [],
          }
          upsertTeig(t)
          setOffen(t.id)
        }}
      >
        + Neuer Teig
      </Button>
    </div>
  )
}
