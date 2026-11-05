import { useState } from 'react'
import { Button, Card, LoeschButton, TextInput, Zahl } from '../components/ui'
import { useStore } from '../store'
import { KATEGORIEN, type Kategorie } from '../types'

export default function Bestand() {
  const { zutaten, bestand, setBestand, updateZutat, deleteZutat, zutatFuerName, teige, kreationen } = useStore()
  const [neu, setNeu] = useState('')

  const benutzt = new Set([
    ...teige.flatMap((t) => t.stufen.flatMap((s) => s.zutaten.map((p) => p.zutatId))),
    ...kreationen.flatMap((k) => k.toppings.map((p) => p.zutatId)),
  ])
  const gruppen = (Object.keys(KATEGORIEN) as Kategorie[])
    .map((k) => ({ k, liste: zutaten.filter((z) => z.kategorie === k).sort((a, b) => a.name.localeCompare(b.name, 'de')) }))
    .filter((g) => g.liste.length > 0)

  return (
    <div className="space-y-4">
      <p className="px-1 text-sm text-stone-500">
        Vorhandene Mengen in Gramm. Leer = kein Bestand. Die Einkaufsliste zieht den Bestand automatisch ab.
      </p>

      <div className="flex gap-2">
        <TextInput value={neu} onChange={setNeu} placeholder="Neue Zutat" />
        <Button
          disabled={!neu.trim()}
          onClick={() => {
            zutatFuerName(neu, 'sonstiges')
            setNeu('')
          }}
        >
          Hinzufügen
        </Button>
      </div>

      {gruppen.map(({ k, liste }) => (
        <Card key={k} title={KATEGORIEN[k]}>
          <ul className="divide-y divide-stone-100">
            {liste.map((z) => (
              <li key={z.id} className="py-2.5">
                <div className="flex items-center gap-2">
                  <span className="min-w-0 flex-1 truncate font-medium">{z.name}</span>
                  <Zahl
                    className="w-28"
                    label={`Bestand ${z.name}`}
                    suffix="g"
                    leerErlaubt
                    placeholder="–"
                    value={bestand[z.id] ?? null}
                    onChange={(n) => setBestand(z.id, n)}
                  />
                </div>
                <div className="mt-1 flex items-center gap-3">
                  <select
                    aria-label={`Kategorie ${z.name}`}
                    value={z.kategorie}
                    onChange={(e) => updateZutat(z.id, { kategorie: e.target.value as Kategorie })}
                    className="rounded-lg bg-transparent py-1 text-sm! text-stone-400 outline-none"
                  >
                    {(Object.keys(KATEGORIEN) as Kategorie[]).map((kk) => (
                      <option key={kk} value={kk}>
                        {KATEGORIEN[kk]}
                      </option>
                    ))}
                  </select>
                  {!benutzt.has(z.id) && (
                    <span className="ml-auto">
                      <LoeschButton label="Entfernen" onConfirm={() => deleteZutat(z.id)} />
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </Card>
      ))}
    </div>
  )
}
