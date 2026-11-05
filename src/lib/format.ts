const de = (n: number, stellen: number) =>
  n.toLocaleString('de-DE', { minimumFractionDigits: stellen, maximumFractionDigits: stellen })

/** Gramm: unter 10 g mit einer Nachkommastelle (Hefe!), sonst ganze Gramm. */
export function gramm(n: number): string {
  if (n > 0 && n < 10) return `${de(n, 1)} g`
  return `${de(Math.round(n), 0)} g`
}

/** Für Einkaufslisten: ab 1 kg in kg. */
export function menge(n: number): string {
  if (n >= 1000) return `${de(n / 1000, 2)} kg`
  return gramm(n)
}

export function prozent(n: number | null): string {
  if (n === null) return ''
  return `${de(n, n < 1 ? 2 : n % 1 === 0 ? 0 : 1)} %`
}

/** „3,5“ oder „3.5“ → 3.5; ungültig → null */
export function parseZahl(s: string): number | null {
  const t = s.trim().replace(',', '.')
  if (t === '') return null
  const n = Number(t)
  return Number.isFinite(n) ? n : null
}
