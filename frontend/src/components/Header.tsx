import './Header/Header.css'
import type { MentorStatus } from '../types'
import logoMain from '../assets/logo_03.svg'

interface HeaderProps {
  mentorStatus: MentorStatus | null
  userEmail?: string
  onOpenProfile: () => void
  onLogout: () => void
}

export function Header({
  mentorStatus,
  userEmail,
  onOpenProfile,
  onLogout,
}: HeaderProps) {
  const isApprovedMentor = Boolean(mentorStatus?.is_mentor)

  return (
    <header className="app-header">
      <div className="header-brand">
        <div className="header-logo-group">
          <img src={logoMain} alt="Duck2P" className="header-duck-icon" />
          <span className="header-brand-name">Duck2P</span>
        </div>
        <div className="header-divider" aria-hidden="true" />
        <p className="header-tagline">
          Dúvidas de código? Aqui tem um pato. E pessoas também.
        </p>
      </div>

      <div className="header-actions">
        {isApprovedMentor && (
          <span className="header-badge">
            Mentor • Nível {mentorStatus?.profile?.level ?? 1}
          </span>
        )}

        <button
          type="button"
          className="header-profile-btn"
          onClick={onOpenProfile}
          title="Abrir perfil"
        >
          <span className="header-profile-avatar">
            {userEmail ? userEmail.charAt(0).toUpperCase() : 'C'}
          </span>
          <span>Conta</span>
        </button>

        <button type="button" className="btn-outline" onClick={onLogout}>
          Sair
        </button>
      </div>
    </header>
  )
}

