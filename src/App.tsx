import { useState, type ReactNode } from 'react'
import Bestand from './pages/Bestand'
import Einkauf from './pages/Einkauf'
import Rechner from './pages/Rechner'
import Rezepte from './pages/Rezepte'

type Tab = 'rechner' | 'rezepte' | 'einkauf' | 'bestand'

const icon = (d: ReactNode) => (
  <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    {d}
  </svg>
)

const TABS: { id: Tab; label: string; icon: ReactNode }[] = [
  {
    id: 'rechner',
    label: 'Rechner',
    icon: icon(
      <>
        <rect x="5" y="3" width="14" height="18" rx="2" />
        <path d="M8 7h8M8 12h2M14 12h2M8 16h2M14 16h2" />
      </>,
    ),
  },
  {
    id: 'rezepte',
    label: 'Rezepte',
    icon: icon(
      <>
        <circle cx="12" cy="12" r="9" />
        <circle cx="9" cy="10" r="1.3" />
        <circle cx="14.5" cy="9.5" r="1.3" />
        <circle cx="12" cy="15" r="1.3" />
      </>,
    ),
  },
  {
    id: 'einkauf',
    label: 'Einkauf',
    icon: icon(
      <>
        <path d="M4 5h2l2 11h10l2-8H7" />
        <circle cx="10" cy="20" r="1" />
        <circle cx="17" cy="20" r="1" />
      </>,
    ),
  },
  {
    id: 'bestand',
    label: 'Bestand',
    icon: icon(
      <>
        <path d="M4 8l8-4 8 4v8l-8 4-8-4z" />
        <path d="M4 8l8 4 8-4M12 12v8" />
      </>,
    ),
  },
]

export default function App() {
  const [tab, setTab] = useState<Tab>('rechner')
  const aktuell = TABS.find((t) => t.id === tab)!

  return (
    <div className="mx-auto min-h-dvh max-w-xl">
      <header className="sticky top-0 z-10 bg-stone-50/90 px-4 pt-[max(1rem,env(safe-area-inset-top))] pb-3 backdrop-blur">
        <div className="text-xs font-semibold tracking-widest text-tomato-500 uppercase">Pizza Planner</div>
        <h1 className="text-2xl font-bold">{aktuell.label}</h1>
      </header>

      <main className="px-4 pb-28">
        {tab === 'rechner' && <Rechner />}
        {tab === 'rezepte' && <Rezepte />}
        {tab === 'einkauf' && <Einkauf />}
        {tab === 'bestand' && <Bestand />}
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-10 border-t border-stone-200 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur">
        <div className="mx-auto flex max-w-xl">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => {
                setTab(t.id)
                window.scrollTo({ top: 0 })
              }}
              className={`flex flex-1 flex-col items-center gap-0.5 py-2.5 text-xs font-medium ${
                t.id === tab ? 'text-tomato-500' : 'text-stone-400'
              }`}
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </div>
      </nav>
    </div>
  )
}
