import { useState } from 'react'
import { Button, Card, Chip, Feld, LoeschButton, Stepper, TextInput, Zahl } from '../components/ui'
import { baeckerprozent } from '../lib/calc'
import { gramm, menge, prozent } from '../lib/format'
import { useBerechnung } from '../lib/useBerechnung'
import { useStore, useZutatName } from '../store'

export default function Rechner() {
  const { plan, setPlan, teige, kreationen, toggleKreation, kapazitaetMehl, setKapazitaet } = useStore()
  const name = useZutatName()
  const { pizzen, teig, teigErg, anzahl, verteilt } = useBerechnung()
  const [proDurchgang, setProDurchgang] = useState(false)

  const teiler = proDurchgang && teigErg ? teigErg.durchgaenge : 1

  return (
    <div className="space-y-4">
      {/* Ergebnis */}
      <div className="grid grid-cols-3 gap-2 rounded-2xl bg-tomato-500 p-4 text-white">
        <Kennzahl wert={String(pizzen)} label="Pizzen" />
        <Kennzahl wert={menge(teigErg?.teigGesamt ?? 0)} label="Teig gesamt" />
        <Kennzahl wert={gramm(teigErg?.mehlGesamt ?? 0)} label="Mehl" />
      </div>

      <Card title="Gäste">
        <Feld label="Personen">
          <Stepper label="Personen" value={plan.personen} min={1} onChange={(personen) => setPlan({ personen })} />
        </Feld>
        <Feld label="Pizzen pro Person" hinweis="30 cm Pizza">
          <Zahl className="w-28" label="Pizzen pro Person" value={plan.pizzenProPerson} onChange={(n) => setPlan({ pizzenProPerson: n ?? 0 })} />
        </Feld>
        <Feld label="Puffer" hinweis="Sicherheitsaufschlag">
          <Zahl className="w-28" label="Puffer" suffix="%" value={plan.puffer} onChange={(n) => setPlan({ puffer: n ?? 0 })} />
        </Feld>
        <Feld label="Teigballen">
          <Zahl className="w-28" label="Teigballengewicht" suffix="g" value={plan.ballengewicht} onChange={(n) => setPlan({ ballengewicht: n ?? 0 })} />
        </Feld>
      </Card>

      <Card title="Teig">
        <div className="mb-3 flex flex-wrap gap-2">
          {teige.map((t) => (
            <Chip key={t.id} aktiv={t.id === plan.teigId} onClick={() => setPlan({ teigId: t.id })}>
              {t.name}
            </Chip>
          ))}
        </div>
        {teig && teigErg ? (
          <>
            {teig.beschreibung && <p className="mb-3 text-sm text-stone-500">{teig.beschreibung}</p>}

            {teigErg.durchgaenge > 1 && (
              <div className="mb-3 rounded-xl bg-tomato-50 p-3 text-sm text-tomato-700">
                <b>{teigErg.durchgaenge} Knet-Durchgänge</b> nötig ({gramm(teigErg.mehlGesamt)} Mehl, max.{' '}
                {gramm(kapazitaetMehl)} pro Durchgang).
                <label className="mt-2 flex items-center gap-2">
                  <input type="checkbox" className="accent-tomato-500" checked={proDurchgang} onChange={(e) => setProDurchgang(e.target.checked)} />
                  Mengen pro Durchgang anzeigen
                </label>
              </div>
            )}

            {teigErg.stufen.map((s, i) => (
              <div key={i} className="mb-2">
                {s.name && <h3 className="mt-2 mb-1 text-sm font-semibold text-tomato-600">{s.name}</h3>}
                <ul className="divide-y divide-stone-100">
                  {s.zutaten.map((p, j) => (
                    <li key={j} className="flex items-baseline justify-between py-2">
                      <span>{name(p.zutatId)}</span>
                      <span className="flex items-baseline gap-3">
                        <span className="w-14 text-right text-xs text-stone-400">
                          {prozent(baeckerprozent(teig.stufen[i].zutaten[j].menge, teigErg.mehlReferenz))}
                        </span>
                        <span className="w-20 text-right font-semibold tabular-nums">{gramm(p.menge / teiler)}</span>
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            <p className="mt-2 text-right text-xs text-stone-400">
              {pizzen} Ballen à {gramm(plan.ballengewicht)}
              {teiler > 1 && ` · Mengen je Durchgang (${teiler}×)`}
            </p>

            {teig.schritte.length > 0 && (
              <details className="mt-3 rounded-xl bg-stone-50 p-3">
                <summary className="cursor-pointer font-medium text-stone-700">Zubereitung</summary>
                <ol className="mt-2 list-decimal space-y-1.5 pl-5 text-sm text-stone-600">
                  {teig.schritte.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ol>
              </details>
            )}

            <Feld label="Knetmaschine" hinweis="max. Mehl pro Durchgang">
              <Zahl className="w-28" label="Knetkapazität" suffix="g" value={kapazitaetMehl} onChange={(n) => setKapazitaet(n ?? 0)} />
            </Feld>
          </>
        ) : (
          <p className="text-sm text-stone-500">Lege unter „Rezepte“ einen Teig an.</p>
        )}
      </Card>

      <Card
        title="Pizzen"
        aside={
          <label className="flex items-center gap-2 text-sm text-stone-500">
            <input type="checkbox" className="accent-tomato-500" checked={plan.autoVerteilung} onChange={(e) => setPlan({ autoVerteilung: e.target.checked })} />
            gleichmäßig verteilen
          </label>
        }
      >
        {kreationen.length === 0 && <p className="text-sm text-stone-500">Lege unter „Rezepte“ eine Pizza an.</p>}
        <ul className="divide-y divide-stone-100">
          {kreationen.map((k) => {
            const aktiv = k.id in plan.auswahl
            return (
              <li key={k.id} className="flex min-h-14 items-center justify-between gap-2 py-2">
                <button type="button" onClick={() => toggleKreation(k.id)} className="flex flex-1 items-center gap-3 text-left">
                  <span className={`grid size-6 place-items-center rounded-md border-2 text-sm text-white ${aktiv ? 'border-tomato-500 bg-tomato-500' : 'border-stone-300'}`}>
                    {aktiv && '✓'}
                  </span>
                  <span className={aktiv ? 'font-medium' : 'text-stone-500'}>{k.name}</span>
                </button>
                {aktiv &&
                  (plan.autoVerteilung ? (
                    <span className="font-semibold tabular-nums">{anzahl[k.id] ?? 0}×</span>
                  ) : (
                    <Stepper
                      label={`Anzahl ${k.name}`}
                      value={plan.auswahl[k.id] ?? 0}
                      onChange={(n) => setPlan({ auswahl: { ...plan.auswahl, [k.id]: n } })}
                    />
                  ))}
              </li>
            )
          })}
        </ul>
        {!plan.autoVerteilung && verteilt !== pizzen && (
          <p className="mt-2 text-sm text-tomato-600">
            {verteilt} von {pizzen} Pizzen verteilt.
          </p>
        )}
      </Card>

      <Planungen />
    </div>
  )
}

function Kennzahl({ wert, label }: { wert: string; label: string }) {
  return (
    <div className="text-center">
      <div className="text-xl leading-tight font-bold tabular-nums sm:text-2xl">{wert}</div>
      <div className="text-xs text-tomato-100">{label}</div>
    </div>
  )
}

function Planungen() {
  const { planungen, planungSpeichern, planungLaden, planungLoeschen } = useStore()
  const [titel, setTitel] = useState('')
  return (
    <Card title="Gespeicherte Planungen">
      <div className="flex gap-2">
        <TextInput value={titel} onChange={setTitel} placeholder="z. B. Geburtstag Anna" />
        <Button
          onClick={() => {
            planungSpeichern(titel)
            setTitel('')
          }}
        >
          Speichern
        </Button>
      </div>
      <ul className="mt-3 divide-y divide-stone-100">
        {planungen.map((p) => (
          <li key={p.id} className="flex items-center justify-between gap-2 py-2">
            <div className="min-w-0">
              <div className="truncate font-medium">{p.name}</div>
              <div className="text-xs text-stone-400">
                {new Date(p.datum).toLocaleDateString('de-DE')} · {p.plan.personen} Personen
              </div>
            </div>
            <div className="flex shrink-0 gap-2">
              <Button variante="leise" onClick={() => planungLaden(p.id)}>
                Laden
              </Button>
              <LoeschButton onConfirm={() => planungLoeschen(p.id)} label="✕" />
            </div>
          </li>
        ))}
      </ul>
    </Card>
  )
}
