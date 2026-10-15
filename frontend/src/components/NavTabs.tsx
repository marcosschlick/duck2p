import { useRef, useEffect, useCallback } from 'react'
import { gsap } from 'gsap'
import type { Tab } from '../types'

interface NavTabsProps {
  activeTab: Tab
  onSelectTab: (tab: Tab) => void
  activeMatchesCount: number
}

export function NavTabs({
  activeTab,
  onSelectTab,
  activeMatchesCount,
}: NavTabsProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const gliderRef = useRef<HTMLSpanElement>(null)
  const tabRefs = useRef<Partial<Record<Tab, HTMLButtonElement | null>>>({
    duvidas: null,
    atendimentos: null,
    ranking: null,
  })

  const syncGlider = useCallback((animate: boolean) => {
    const container = containerRef.current
    const glider = gliderRef.current
    const activeBtn = tabRefs.current[activeTab]
    if (!container || !glider || !activeBtn) return

    const x = activeBtn.offsetLeft
    const width = activeBtn.offsetWidth
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (!animate || prefersReduced) {
      gsap.set(glider, { x, width, opacity: 1 })
    } else {
      gsap.to(glider, {
        x,
        width,
        opacity: 1,
        duration: 0.34,
        ease: 'power3.out',
      })
    }
  }, [activeTab])

  useEffect(() => {
    syncGlider(true)
  }, [syncGlider, activeMatchesCount])

  useEffect(() => {
    const handleResize = () => syncGlider(false)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [syncGlider])

  return (
    <nav className="app-nav" aria-label="Navegação de abas">
      <div className="nav-tabs-shell">
        <div className="nav-tabs-pill-container" ref={containerRef} role="tablist">
          <span className="nav-tab-glider" ref={gliderRef} aria-hidden="true" />

          <button
            ref={(el) => {
              tabRefs.current.duvidas = el
            }}
            type="button"
            className={'nav-tab ' + (activeTab === 'duvidas' ? 'active' : '')}
            onClick={() => onSelectTab('duvidas')}
            aria-selected={activeTab === 'duvidas'}
            role="tab"
          >
            <svg className="nav-tab-icon" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.85" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              <path d="M8 9h8" />
              <path d="M8 13h5" />
            </svg>
            <span className="nav-tab-label">Tirar Dúvidas</span>
          </button>

          <button
            ref={(el) => {
              tabRefs.current.atendimentos = el
            }}
            type="button"
            className={'nav-tab ' + (activeTab === 'atendimentos' ? 'active' : '')}
            onClick={() => onSelectTab('atendimentos')}
            aria-selected={activeTab === 'atendimentos'}
            role="tab"
          >
            <svg className="nav-tab-icon" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.85" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            <span className="nav-tab-label">Atendimentos</span>
            {activeMatchesCount > 0 && (
              <span className="tab-count-badge" aria-label={`${activeMatchesCount} ativos`}>
                {activeMatchesCount}
              </span>
            )}
          </button>

          <button
            ref={(el) => {
              tabRefs.current.ranking = el
            }}
            type="button"
            className={'nav-tab ' + (activeTab === 'ranking' ? 'active' : '')}
            onClick={() => onSelectTab('ranking')}
            aria-selected={activeTab === 'ranking'}
            role="tab"
          >
            <svg className="nav-tab-icon" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.85" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
              <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
              <path d="M4 22h16" />
              <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
              <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
              <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
            </svg>
            <span className="nav-tab-label">Ranking do Campus</span>
          </button>
        </div>
      </div>
    </nav>
  )
}

