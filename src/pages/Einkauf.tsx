import { useState } from 'react'
import { Button, Card } from '../components/ui'
import { zusammenfassen, type Zeile } from '../lib/calc'
import { menge } from '../lib/format'
import { useBerechnung } from '../lib/useBerechnung'
import { useStore, useZutatName } from '../store'

export default function Einkauf() {
  const { liste, pizzen, teigErg, toppings } = useBerechnung()
  const { resetAbgehakt, verbrauchAbbuchen } = useStore()
  const [bestaetigen, setBestaetigen] = useState(false)
  const [erledigt, setErledigt] = useState(false)

  const alle = [...liste.teig, ...liste.toppings]
  const offen = alle.filter((z) => z.kaufen > 0.0001)

  return (
    <div className="space-y-4">
      <div className="rounded-2xl bg-tomato-500 p-4 text-white">
        <div className="text-2xl font-bold">{offen.length} Zutaten kaufen</div>
        <div className="text-sm text-tomato-100">für {pizzen} Pizzen · Bestand ist bereits abgezogen</div>
      </div>

      <Abschnitt titel="Teig" zeilen={liste.teig} prefix="teig" />
      <Abschnitt titel="Toppings" zeilen={liste.toppings} prefix="top" leer="Keine Pizzen ausgewählt." />

      <div className="flex flex-col gap-2">
        <Button variante="leise" onClick={resetAbgehakt}>
          Haken zurücksetzen
        </Button>
        {!bestaetigen ? (
          <Button variante="gefahr" onClick={() => setBestaetigen(true)} disabled={alle.length === 0}>
            Catering abgeschlossen – Verbrauch abbuchen
          </Button>
        ) : (
          <div className="rounded-2xl border border-tomato-200 bg-white p-4 text-sm">
            <p className="mb-3">
              Der komplette Verbrauch (Teig + Toppings) wird vom Bestand abgezogen. Zutaten ohne eingetragenen Bestand bleiben unverändert.
            </p>
            <div className="flex gap-2">
              <Button
                className="flex-1"
                onClick={() => {
                  verbrauchAbbuchen(zusammenfassen([...(teigErg?.gesamt ?? []), ...toppings]))
                  setBestaetigen(false)
                  setErledigt(true)
                  setTimeout(() => setErledigt(false), 3000)
                }}
              >
                Abbuchen
              </Button>
              <Button className="flex-1" variante="leise" onClick={() => setBestaetigen(false)}>
                Abbrechen
              </Button>
            </div>
          </div>
        )}
        {erledigt && <p className="text-center text-sm text-stone-500">Bestand aktualisiert.</p>}
      </div>
    </div>
  )
}

function Abschnitt({ titel, zeilen, prefix, leer }: { titel: string; zeilen: Zeile[]; prefix: string; leer?: string }) {
  const { abgehakt, toggleAbgehakt } = useStore()
  const name = useZutatName()
  return (
    <Card title={titel}>
      {zeilen.length === 0 && <p className="text-sm text-stone-500">{leer ?? 'Nichts nötig.'}</p>}
      <ul className="divide-y divide-stone-100">
        {zeilen.map((z) => {
          const key = `${prefix}:${z.zutatId}`
          const vorhanden = z.kaufen <= 0.0001
          const haken = abgehakt[key] || vorhanden
          return (
            <li key={key}>
              <button type="button" disabled={vorhanden} onClick={() => toggleAbgehakt(key)} className="flex w-full items-center gap-3 py-3 text-left">
                <span
                  className={`grid size-6 shrink-0 place-items-center rounded-md border-2 text-sm text-white ${
                    haken ? 'border-tomato-500 bg-tomato-500' : 'border-stone-300'
                  } ${vorhanden ? 'opacity-40' : ''}`}
                >
                  {haken && '✓'}
                </span>
                <span className="min-w-0 flex-1">
                  <span className={`block ${haken ? 'text-stone-400 line-through' : 'font-medium'}`}>{name(z.zutatId)}</span>
                  {z.ausBestand > 0 && (
                    <span className="block text-xs text-stone-400">
                      Bedarf {menge(z.bedarf)} · aus Bestand {menge(z.ausBestand)}
                    </span>
                  )}
                </span>
                <span className={`shrink-0 font-semibold tabular-nums ${haken ? 'text-stone-400' : ''}`}>
                  {vorhanden ? 'vorhanden' : menge(z.kaufen)}
                </span>
              </button>
            </li>
          )
        })}
      </ul>
    </Card>
  )
}
