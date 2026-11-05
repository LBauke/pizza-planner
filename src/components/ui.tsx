import { useEffect, useId, useState, type ReactNode } from 'react'
import { parseZahl } from '../lib/format'
import { useStore } from '../store'
import type { Kategorie } from '../types'

export function Card({ title, aside, children }: { title?: string; aside?: ReactNode; children: ReactNode }) {
  return (
    <section className="rounded-2xl border border-stone-200 bg-white p-4">
      {(title || aside) && (
        <div className="mb-3 flex items-center justify-between gap-2">
          {title && <h2 className="text-sm font-semibold tracking-wide text-stone-500 uppercase">{title}</h2>}
          {aside}
        </div>
      )}
      {children}
    </section>
  )
}

const zuText = (v: number | null) => (v === null ? '' : String(Math.round(v * 100) / 100).replace('.', ','))

/** Zahleneingabe mit Komma-Unterstützung. */
export function Zahl({
  value,
  onChange,
  suffix,
  leerErlaubt = false,
  placeholder,
  className = '',
  label,
}: {
  value: number | null
  onChange: (n: number | null) => void
  suffix?: string
  leerErlaubt?: boolean
  placeholder?: string
  className?: string
  label?: string
}) {
  const [text, setText] = useState(zuText(value))
  const [fokus, setFokus] = useState(false)
  useEffect(() => {
    if (!fokus) setText(zuText(value))
  }, [value, fokus])

  return (
    <label
      className={`flex items-center rounded-xl border border-stone-200 bg-stone-50 px-3 focus-within:border-tomato-500 focus-within:bg-white ${className}`}
    >
      <input
        aria-label={label}
        inputMode="decimal"
        className="w-full min-w-0 bg-transparent py-2 text-right tabular-nums outline-none"
        value={text}
        placeholder={placeholder}
        onFocus={(e) => {
          setFokus(true)
          e.target.select()
        }}
        onBlur={() => setFokus(false)}
        onChange={(e) => {
          setText(e.target.value)
          const n = parseZahl(e.target.value)
          if (n !== null) onChange(Math.max(0, n))
          else if (e.target.value.trim() === '' && leerErlaubt) onChange(null)
        }}
      />
      {suffix && <span className="ml-1 shrink-0 text-sm text-stone-400">{suffix}</span>}
    </label>
  )
}

export function Stepper({
  value,
  onChange,
  min = 0,
  schritt = 1,
  label,
}: {
  value: number
  onChange: (n: number) => void
  min?: number
  schritt?: number
  label?: string
}) {
  const btn =
    'grid size-10 shrink-0 place-items-center rounded-xl bg-tomato-50 text-xl font-medium text-tomato-600 active:bg-tomato-100 disabled:opacity-40'
  return (
    <div className="flex items-center gap-2">
      <button type="button" className={btn} aria-label="weniger" disabled={value <= min} onClick={() => onChange(Math.max(min, value - schritt))}>
        −
      </button>
      <Zahl className="w-16" label={label} value={value} onChange={(n) => onChange(Math.max(min, Math.round(n ?? min)))} />
      <button type="button" className={btn} aria-label="mehr" onClick={() => onChange(value + schritt)}>
        +
      </button>
    </div>
  )
}

export function Feld({ label, hinweis, children }: { label: string; hinweis?: string; children: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 py-2">
      <div className="min-w-0">
        <div className="text-stone-700">{label}</div>
        {hinweis && <div className="text-xs text-stone-400">{hinweis}</div>}
      </div>
      {children}
    </div>
  )
}

export function Button({
  children,
  onClick,
  variante = 'primaer',
  className = '',
  disabled,
}: {
  children: ReactNode
  onClick?: () => void
  variante?: 'primaer' | 'leise' | 'gefahr'
  className?: string
  disabled?: boolean
}) {
  const v = {
    primaer: 'bg-tomato-500 text-white active:bg-tomato-600',
    leise: 'bg-stone-100 text-stone-700 active:bg-stone-200',
    gefahr: 'bg-white text-tomato-600 border border-tomato-200 active:bg-tomato-50',
  }[variante]
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`rounded-xl px-4 py-2.5 font-medium transition-colors disabled:opacity-40 ${v} ${className}`}
    >
      {children}
    </button>
  )
}

/** Löschen mit zweitem Klick zur Bestätigung */
export function LoeschButton({ onConfirm, label = 'Löschen' }: { onConfirm: () => void; label?: string }) {
  const [sicher, setSicher] = useState(false)
  useEffect(() => {
    if (!sicher) return
    const t = setTimeout(() => setSicher(false), 3000)
    return () => clearTimeout(t)
  }, [sicher])
  return (
    <Button variante="gefahr" onClick={() => (sicher ? onConfirm() : setSicher(true))}>
      {sicher ? 'Wirklich?' : label}
    </Button>
  )
}

export function Segment<T extends string>({
  optionen,
  wert,
  onChange,
}: {
  optionen: { wert: T; label: string }[]
  wert: T
  onChange: (w: T) => void
}) {
  return (
    <div className="flex rounded-xl bg-stone-100 p-1">
      {optionen.map((o) => (
        <button
          key={o.wert}
          type="button"
          onClick={() => onChange(o.wert)}
          className={`flex-1 rounded-lg py-2 text-sm font-medium transition-colors ${
            o.wert === wert ? 'bg-white text-tomato-600 shadow-sm' : 'text-stone-500'
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

export function Chip({ aktiv, onClick, children }: { aktiv: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors ${
        aktiv ? 'border-tomato-500 bg-tomato-500 text-white' : 'border-stone-200 bg-white text-stone-600'
      }`}
    >
      {children}
    </button>
  )
}

/** Zutatenfeld mit Vorschlägen; unbekannte Namen werden als neue Zutat angelegt. */
export function ZutatInput({
  zutatId,
  onPick,
  kategorie,
}: {
  zutatId: string
  onPick: (id: string) => void
  kategorie: Kategorie
}) {
  const zutaten = useStore((s) => s.zutaten)
  const zutatFuerName = useStore((s) => s.zutatFuerName)
  const name = zutaten.find((z) => z.id === zutatId)?.name ?? ''
  const [text, setText] = useState(name)
  const listId = useId()
  useEffect(() => setText(name), [name])

  const uebernehmen = () => {
    const t = text.trim()
    if (!t) return setText(name)
    if (t.toLowerCase() !== name.toLowerCase()) onPick(zutatFuerName(t, kategorie))
  }
  return (
    <>
      <input
        list={listId}
        value={text}
        placeholder="Zutat"
        aria-label="Zutat"
        onChange={(e) => setText(e.target.value)}
        onBlur={uebernehmen}
        onKeyDown={(e) => e.key === 'Enter' && (e.target as HTMLInputElement).blur()}
        className="w-full min-w-0 rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 outline-none focus:border-tomato-500 focus:bg-white"
      />
      <datalist id={listId}>
        {zutaten.map((z) => (
          <option key={z.id} value={z.name} />
        ))}
      </datalist>
    </>
  )
}

export const TextInput = ({
  value,
  onChange,
  placeholder,
  className = '',
}: {
  value: string
  onChange: (s: string) => void
  placeholder?: string
  className?: string
}) => (
  <input
    value={value}
    placeholder={placeholder}
    onChange={(e) => onChange(e.target.value)}
    className={`w-full min-w-0 rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 outline-none focus:border-tomato-500 focus:bg-white ${className}`}
  />
)
