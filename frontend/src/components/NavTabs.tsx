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
    <nav className="app-nav">
      <button
        type="button"
        className={'nav-tab ' + (activeTab === 'duvidas' ? 'active' : '')}
        onClick={() => onSelectTab('duvidas')}
      >
        <span className="nav-tab-label">Dúvidas</span>
      </button>
      <button
        type="button"
        className={'nav-tab ' + (activeTab === 'atendimentos' ? 'active' : '')}
        onClick={() => onSelectTab('atendimentos')}
      >
        <span className="nav-tab-label">Atendimentos</span>
        {activeMatchesCount > 0 && (
          <span className="tab-count">{activeMatchesCount}</span>
        )}
      </button>
      <button
        type="button"
        className={'nav-tab ' + (activeTab === 'ranking' ? 'active' : '')}
        onClick={() => onSelectTab('ranking')}
      >
        <span className="nav-tab-label">Ranking</span>
      </button>
    </nav>
  )
}
