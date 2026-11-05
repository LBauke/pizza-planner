import { useMemo } from 'react'
import { useStore } from '../store'
import {
  anzahlPizzen,
  berechneTeig,
  berechneToppings,
  einkaufsliste,
  pizzenJeKreation,
  pizzenJeTeig,
  zusammenfassen,
} from './calc'

const summe = (xs: number[]) => xs.reduce((a, b) => a + b, 0)

/** Zentrale Berechnung aus dem aktuellen Plan – genutzt von Rechner und Einkauf. */
export function useBerechnung() {
  const { plan, teige, zutaten, kreationen, bestand, kapazitaetMehl } = useStore()
  return useMemo(() => {
    const pizzen = anzahlPizzen(plan)

    // Teige: jeder ausgewählte Teig wird für sich berechnet, die Mengen werden aufsummiert
    const jeTeig = pizzenJeTeig(plan, teige)
    const teigErgebnisse = teige
      .filter((t) => t.id in jeTeig)
      .map((teig) => ({
        teig,
        pizzen: jeTeig[teig.id],
        erg: berechneTeig(teig, zutaten, jeTeig[teig.id], plan.ballengewicht, kapazitaetMehl, plan.mehlRunden ? plan.mehlSchritt : 0),
      }))
    const teigPosten = zusammenfassen(teigErgebnisse.flatMap((e) => e.erg.gesamt))
    const teigGesamt = summe(teigErgebnisse.map((e) => e.erg.teigGesamt))
    const mehlGesamt = summe(teigErgebnisse.map((e) => e.erg.mehlGesamt))
    const ballen = summe(teigErgebnisse.map((e) => e.erg.ballen))
    const teigVerteilt = summe(Object.values(jeTeig))

    // Toppings
    const anzahl = pizzenJeKreation(plan, kreationen)
    const verteilt = summe(Object.values(anzahl))
    const toppings = berechneToppings(kreationen, anzahl)

    const liste = einkaufsliste(teigPosten, toppings, bestand)
    return {
      pizzen,
      jeTeig,
      teigErgebnisse,
      teigPosten,
      teigGesamt,
      mehlGesamt,
      ballen,
      teigVerteilt,
      anzahl,
      verteilt,
      toppings,
      liste,
    }
  }, [plan, teige, zutaten, kreationen, bestand, kapazitaetMehl])
}
