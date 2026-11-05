import { useMemo, useState } from 'react'
import { Button, Card, Chip, TextInput } from '../components/ui'
import { KATALOG, TAG_NAMEN } from '../data/katalog'
import { gramm } from '../lib/format'
import { baueZutatenPool, generiere, ideeName, SLOT_NAMEN, tagsVon, tausche, type Idee } from '../lib/ideen'
import { neueId, useStore } from '../store'

export default function Ideen({ onUebernommen }: { onUebernommen: (kreationId: string) => void }) {
  const { zutaten, kreationen, upsertKreation, zutatFuerName } = useStore()
  const [vegetarisch, setVegetarisch] = useState(false)
  const [nurEigene, setNurEigene] = useState(false)

  const pool = useMemo(() => baueZutatenPool(KATALOG, zutaten, nurEigene), [zutaten, nurEigene])
  const opt = { pool, vegetarisch }

  const [idee, setIdee] = useState<Idee>(() => generiere(opt))
  const [name, setName] = useState(() => ideeName(idee))

  const neu = (o = opt) => {
    const i = generiere(o)
    setIdee(i)
    setName(ideeName(i))
  }
  const tauschen = (index: number) => {
    const i = tausche(idee, index, opt)
    setIdee(i)
    setName(ideeName(i))
  }

  const uebernehmen = () => {
    const basis = name.trim() || ideeName(idee)
    const vorhanden = new Set(kreationen.map((k) => k.name))
    let titel = basis
    for (let n = 2; vorhanden.has(titel); n++) titel = `${basis} ${n}`
    const id = neueId()
    upsertKreation({
      id,
      name: titel,
      toppings: idee.teile.map((t) => ({ zutatId: zutatFuerName(t.zutat.name, t.zutat.kategorie), menge: t.zutat.menge })),
    })
    onUebernommen(id)
  }

  const tags = tagsVon(idee)

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <Chip
          aktiv={vegetarisch}
          onClick={() => {
            setVegetarisch(!vegetarisch)
            neu({ pool, vegetarisch: !vegetarisch })
          }}
        >
          Vegetarisch
        </Chip>
        <Chip
          aktiv={nurEigene}
          onClick={() => {
            setNurEigene(!nurEigene)
            neu({ pool: baueZutatenPool(KATALOG, zutaten, !nurEigene), vegetarisch })
          }}
        >
          Nur meine Zutaten
        </Chip>
      </div>

      {idee.teile.length === 0 ? (
        <Card>
          <p className="text-sm text-stone-500">
            Zu wenige Zutaten für eine Idee. Lege unter „Bestand“ Zutaten mit den Kategorien Sauce, Käse, Gemüse usw. an
            oder schalte „Nur meine Zutaten“ aus.
          </p>
        </Card>
      ) : (
        <Card>
          <TextInput value={name} onChange={setName} className="text-lg font-semibold" />
          {tags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {tags.map((t) => (
                <span key={t} className="rounded-full bg-tomato-50 px-2.5 py-0.5 text-xs font-medium text-tomato-700">
                  {TAG_NAMEN[t]}
                </span>
              ))}
            </div>
          )}

          <ul className="mt-3 divide-y divide-stone-100">
            {idee.teile.map((t, i) => (
              <li key={`${t.zutat.name}-${i}`} className="flex items-center gap-3 py-2">
                <div className="min-w-0 flex-1">
                  <div className="text-xs text-stone-400">{SLOT_NAMEN[t.slot]}</div>
                  <div className="truncate font-medium">{t.zutat.name}</div>
                </div>
                <span className="text-sm text-stone-500 tabular-nums">{gramm(t.zutat.menge)}</span>
                <button
                  type="button"
                  aria-label={`${t.zutat.name} tauschen`}
                  onClick={() => tauschen(i)}
                  className="grid size-9 shrink-0 place-items-center rounded-lg text-lg text-tomato-600 active:bg-tomato-50"
                >
                  ↻
                </button>
              </li>
            ))}
          </ul>
          <p className="mt-2 text-xs text-stone-400">Mengen pro Pizza (30 cm), nach dem Übernehmen anpassbar.</p>
        </Card>
      )}

      <div className="flex gap-2">
        <Button variante="leise" className="flex-1" onClick={() => neu()}>
          Neue Idee
        </Button>
        <Button className="flex-1" onClick={uebernehmen} disabled={idee.teile.length === 0}>
          Als Pizza speichern
        </Button>
      </div>
    </div>
  )
}
