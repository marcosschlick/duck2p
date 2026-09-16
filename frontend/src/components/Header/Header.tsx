import './Header.css'
import logoIcon from '../../assets/logo_03.svg'

interface HeaderProps {
  onLogout?: () => void
  userEmail?: string
}

export function Header({ onLogout, userEmail }: HeaderProps) {
  return (
    <header className="app-header">
      <div className="header-brand">
        <div className="header-logo-group">
          <img src={logoIcon} alt="Duck2P" className="header-duck-icon" />
          <span className="header-brand-name">Duck2P</span>
        </div>

        <div className="header-divider" aria-hidden="true" />
        <p className="header-tagline">
          Dúvidas de código? Aqui tem um pato. E pessoas também.
        </p>
      </div>

      <div className="header-actions">
        <div className="header-status">
          <span className="status-dot" aria-hidden="true" />
          <span>Online</span>
        </div>

        <button
          type="button"
          className="header-profile-btn"
          onClick={onLogout}
          title={userEmail ? `Conectado como ${userEmail}` : 'Perfil do usuário'}
        >
          <span className="header-profile-avatar">
            {userEmail ? userEmail.charAt(0).toUpperCase() : 'E'}
          </span>
          <span>{userEmail ? 'Sair' : 'Conta'}</span>
        </button>
      </div>
    </header>
  )
}
