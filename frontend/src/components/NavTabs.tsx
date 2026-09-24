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
  return (
    <nav className="app-nav" aria-label="Navegação de abas">
      <div className="nav-tabs-pill-container">
        <button
          type="button"
          className={'nav-tab ' + (activeTab === 'duvidas' ? 'active' : '')}
          onClick={() => onSelectTab('duvidas')}
          aria-selected={activeTab === 'duvidas'}
          role="tab"
        >
          <svg className="nav-tab-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            <path d="M8 9h8" />
            <path d="M8 13h5" />
          </svg>
          <span className="nav-tab-label">Tirar Dúvidas</span>
        </button>

        <button
          type="button"
          className={'nav-tab ' + (activeTab === 'atendimentos' ? 'active' : '')}
          onClick={() => onSelectTab('atendimentos')}
          aria-selected={activeTab === 'atendimentos'}
          role="tab"
        >
          <svg className="nav-tab-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
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
          type="button"
          className={'nav-tab ' + (activeTab === 'ranking' ? 'active' : '')}
          onClick={() => onSelectTab('ranking')}
          aria-selected={activeTab === 'ranking'}
          role="tab"
        >
          <svg className="nav-tab-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
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
    </nav>
  )
}
