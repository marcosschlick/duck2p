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
        Dúvidas
      </button>
      <button
        type="button"
        className={'nav-tab ' + (activeTab === 'atendimentos' ? 'active' : '')}
        onClick={() => onSelectTab('atendimentos')}
      >
        Meus Atendimentos{' '}
        {activeMatchesCount > 0 && (
          <span className="tab-count">{activeMatchesCount}</span>
        )}
      </button>
      <button
        type="button"
        className={'nav-tab ' + (activeTab === 'mentoria' ? 'active' : '')}
        onClick={() => onSelectTab('mentoria')}
      >
        Mentoria
      </button>
    </nav>
  )
}
