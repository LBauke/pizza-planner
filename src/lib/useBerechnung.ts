import { useMemo } from 'react'
import { useStore } from '../store'
import { anzahlPizzen, berechneTeig, berechneToppings, einkaufsliste, pizzenJeKreation } from './calc'

/** Zentrale Berechnung aus dem aktuellen Plan – genutzt von Rechner und Einkauf. */
export function useBerechnung() {
  const { plan, teige, zutaten, kreationen, bestand, kapazitaetMehl } = useStore()
  return useMemo(() => {
    const pizzen = anzahlPizzen(plan)
    const teig = teige.find((t) => t.id === plan.teigId) ?? null
    const teigErg = teig ? berechneTeig(teig, zutaten, pizzen, plan.ballengewicht, kapazitaetMehl) : null
    const anzahl = pizzenJeKreation(plan, kreationen)
    const verteilt = Object.values(anzahl).reduce((a, b) => a + b, 0)
    const toppings = berechneToppings(kreationen, anzahl)
    const liste = einkaufsliste(teigErg?.gesamt ?? [], toppings, bestand)
    return { pizzen, teig, teigErg, anzahl, verteilt, toppings, liste }
  }, [plan, teige, zutaten, kreationen, bestand, kapazitaetMehl])
}
