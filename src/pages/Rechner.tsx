import { useState } from 'react'
import { Button, Card, Chip, Feld, LoeschButton, Stepper, TextInput, Zahl } from '../components/ui'
import { baeckerprozent, type TeigErgebnis } from '../lib/calc'
import { gramm, menge, prozent } from '../lib/format'
import { useBerechnung } from '../lib/useBerechnung'
import { useStore, useZutatName } from '../store'
import type { Teigrezept } from '../types'

export default function Rechner() {
  const { plan, setPlan, teige, kreationen, toggleKreation, toggleTeig, kapazitaetMehl, setKapazitaet } = useStore()
  const { pizzen, jeTeig, teigErgebnisse, teigGesamt, mehlGesamt, ballen, teigVerteilt, anzahl, verteilt } = useBerechnung()
  const mehrereTeige = teigErgebnisse.length > 1

  return (
    <div className="space-y-4">
      {/* Ergebnis */}
      <div className="rounded-2xl bg-tomato-500 p-4 text-white">
        <div className="grid grid-cols-3 gap-2">
          <Kennzahl wert={String(pizzen)} label="Pizzen" />
          <Kennzahl wert={menge(teigGesamt)} label="Teig gesamt" />
          <Kennzahl wert={menge(mehlGesamt)} label="Mehl" />
        </div>
        {/* immer vorhanden, damit die Box ihre Höhe behält */}
        <div className="mt-2 h-4 truncate text-center text-xs leading-4 text-tomato-100">
          {ballen} Ballen à {gramm(plan.ballengewicht)}
          {ballen > pizzen && ` · ${ballen - pizzen} als Reserve`}
        </div>
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
        <div className="flex items-center justify-between gap-3 py-2">
          <label className="flex min-w-0 items-center gap-3">
            <input
              type="checkbox"
              className="size-5 shrink-0 accent-tomato-500"
              checked={plan.mehlRunden}
              onChange={(e) => setPlan({ mehlRunden: e.target.checked })}
            />
            <span className="min-w-0">
              <span className="block text-stone-700">Mehl in festen Schritten</span>
              <span className="block text-xs text-stone-400">auf volle Knetmengen aufrunden</span>
            </span>
          </label>
          <Zahl
            className={`w-28 ${plan.mehlRunden ? '' : 'opacity-40'}`}
            label="Mehl-Schritt"
            suffix="g"
            value={plan.mehlSchritt}
            onChange={(n) => setPlan({ mehlSchritt: n ?? 0 })}
          />
        </div>
      </Card>

      <Card
        title="Teig"
        aside={
          mehrereTeige && (
            <label className="flex items-center gap-2 text-sm text-stone-500">
              <input type="checkbox" className="accent-tomato-500" checked={plan.teigAuto} onChange={(e) => setPlan({ teigAuto: e.target.checked })} />
              gleichmäßig verteilen
            </label>
          )
        }
      >
        <p className="mb-2 text-xs text-stone-400">Mehrere Teige wählbar, die Mengen werden zusammengezählt.</p>
        <div className="mb-3 flex flex-wrap gap-2">
          {teige.map((t) => (
            <Chip key={t.id} aktiv={t.id in plan.teigAuswahl} onClick={() => toggleTeig(t.id)}>
              {t.name}
            </Chip>
          ))}
        </div>

        {mehrereTeige && (
          <div className="mb-3 rounded-xl bg-stone-50 px-3 py-1">
            <ul className="divide-y divide-stone-200/70">
              {teigErgebnisse.map(({ teig }) => (
                <li key={teig.id} className="flex min-h-12 items-center justify-between gap-2 py-1.5">
                  <span className="font-medium">{teig.name}</span>
                  {plan.teigAuto ? (
                    <span className="font-semibold tabular-nums">{jeTeig[teig.id]} Pizzen</span>
                  ) : (
                    <Stepper
                      label={`Pizzen mit ${teig.name}`}
                      value={plan.teigAuswahl[teig.id] ?? 0}
                      onChange={(n) => setPlan({ teigAuswahl: { ...plan.teigAuswahl, [teig.id]: n } })}
                    />
                  )}
                </li>
              ))}
            </ul>
            {!plan.teigAuto && teigVerteilt !== pizzen && (
              <p className="pb-2 text-sm text-tomato-600">
                {teigVerteilt} von {pizzen} Pizzen verteilt.
              </p>
            )}
          </div>
        )}

        {teigErgebnisse.length === 0 && <p className="text-sm text-stone-500">Wähle mindestens einen Teig aus.</p>}

        <div className="space-y-4">
          {teigErgebnisse.map(({ teig, pizzen: p, erg }) => (
            <TeigBlock
              key={teig.id}
              teig={teig}
              erg={erg}
              pizzen={p}
              ballengewicht={plan.ballengewicht}
              kapazitaetMehl={kapazitaetMehl}
              mitTitel={mehrereTeige}
            />
          ))}
        </div>

        <Feld label="Knetmaschine" hinweis="max. Mehl pro Durchgang">
          <Zahl className="w-28" label="Knetkapazität" suffix="g" value={kapazitaetMehl} onChange={(n) => setKapazitaet(n ?? 0)} />
        </Feld>
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

function TeigBlock({
  teig,
  erg,
  pizzen,
  ballengewicht,
  kapazitaetMehl,
  mitTitel,
}: {
  teig: Teigrezept
  erg: TeigErgebnis
  pizzen: number
  ballengewicht: number
  kapazitaetMehl: number
  mitTitel: boolean
}) {
  const name = useZutatName()
  const [proDurchgang, setProDurchgang] = useState(false)
  const teiler = proDurchgang ? erg.durchgaenge : 1
  const reserve = erg.ballen - pizzen

  return (
    <div className={mitTitel ? 'rounded-xl border border-stone-200 p-3' : ''}>
      {mitTitel && (
        <div className="mb-1 flex items-baseline justify-between gap-2">
          <h3 className="font-semibold text-tomato-600">{teig.name}</h3>
          <span className="text-sm text-stone-500 tabular-nums">{menge(erg.teigGesamt)}</span>
        </div>
      )}
      {teig.beschreibung && <p className="mb-3 text-sm text-stone-500">{teig.beschreibung}</p>}

      {erg.durchgaenge > 1 && (
        <div className="mb-3 rounded-xl bg-tomato-50 p-3 text-sm text-tomato-700">
          <b>{erg.durchgaenge} Knet-Durchgänge</b> nötig ({gramm(erg.mehlGesamt)} Mehl, max. {gramm(kapazitaetMehl)} pro Durchgang).
          <label className="mt-2 flex items-center gap-2">
            <input type="checkbox" className="accent-tomato-500" checked={proDurchgang} onChange={(e) => setProDurchgang(e.target.checked)} />
            Mengen pro Durchgang anzeigen
          </label>
        </div>
      )}

      {erg.stufen.map((s, i) => (
        <div key={i} className="mb-2">
          {s.name && <h4 className="mt-2 mb-1 text-sm font-semibold text-stone-600">{s.name}</h4>}
          <ul className="divide-y divide-stone-100">
            {s.zutaten.map((p, j) => (
              <li key={j} className="flex items-baseline justify-between py-2">
                <span>{name(p.zutatId)}</span>
                <span className="flex items-baseline gap-3">
                  <span className="w-14 text-right text-xs text-stone-400">
                    {prozent(baeckerprozent(teig.stufen[i].zutaten[j].menge, erg.mehlReferenz))}
                  </span>
                  <span className="w-20 text-right font-semibold tabular-nums">{gramm(p.menge / teiler)}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      ))}
      <p className="mt-2 text-right text-xs text-stone-400">
        {erg.ballen} Ballen à {gramm(ballengewicht)}
        {reserve > 0 && ` · ${reserve} Reserve`}
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
    </div>
  )
}

function Kennzahl({ wert, label }: { wert: string; label: string }) {
  return (
    <div className="text-center">
      <div className="text-xl leading-tight font-bold whitespace-nowrap tabular-nums sm:text-2xl">{wert}</div>
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
