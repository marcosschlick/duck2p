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
  const userHandle = userEmail ? userEmail.split('@')[0] : 'Estudante'

  return (
    <header className="app-header">
      <div className="app-header-inner">
        <div className="header-brand">
          <div className="header-logo-group">
            <div className="header-logo-badge">
              <img src={logoMain} alt="Duck2P" className="header-duck-icon" />
            </div>
            <div className="header-brand-stack">
              <span className="header-brand-name">Duck2P</span>
              <span className="header-campus-tag">IFSul • CodeDay</span>
            </div>
          </div>
          <div className="header-divider" aria-hidden="true" />
          <p className="header-tagline">
            Dúvidas de código? Aqui tem um pato. E pessoas também.
          </p>
        </div>

        <div className="header-actions">
          {isApprovedMentor && (
            <span className="header-badge" title="Status de Mentor Ativo">
              <span className="status-dot-pulse" />
              <span>Mentor • Nv. {mentorStatus?.profile?.level ?? 1}</span>
              {mentorStatus?.profile?.points !== undefined && (
                <span className="header-badge-pts">{mentorStatus.profile.points} pts</span>
              )}
            </span>
          )}

          <button
            type="button"
            className="header-profile-btn"
            onClick={onOpenProfile}
            title="Abrir configurações de perfil e habilidades"
          >
            <span className="header-profile-avatar">
              {userEmail ? userEmail.charAt(0).toUpperCase() : 'C'}
            </span>
            <span className="header-profile-label">{userHandle}</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
          </button>

          <button type="button" className="btn-outline header-logout-btn" onClick={onLogout} title="Encerrar sessão">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            <span>Sair</span>
          </button>
        </div>
      </div>
    </header>
  )
}


