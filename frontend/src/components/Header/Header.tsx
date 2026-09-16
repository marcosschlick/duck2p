import './Header.css'

interface HeaderProps {
  onLogout?: () => void
  userEmail?: string
}

export function Header({ onLogout, userEmail }: HeaderProps) {
  return (
    <header className="app-header">
      <div className="header-brand">
        <div className="header-logo-group">
          <div className="header-duck-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none">
              <path
                d="M12 3a4 4 0 0 0-4 4c0 .85.27 1.63.72 2.28L4 13c-1.1 1.1-1.1 2.9 0 4l3 3c1.1 1.1 2.9 1.1 4 0l3.72-3.72c.65.45 1.43.72 2.28.72a4 4 0 0 0 4-4c0-1.3-.63-2.45-1.6-3.17L18.4 7.4C18.15 4.9 16.27 3 13.75 3H12Z"
                fill="#f59e0b"
              />
              <circle cx="10" cy="6.5" r="1" fill="#0D0D0D" />
              <path
                d="M16 6.5c1.5 0 2.5 1 2.5 1s-1 1.5-2.5 1.5"
                stroke="#d97706"
                strokeWidth="1.2"
                strokeLinecap="round"
              />
            </svg>
          </div>
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
