import type { MentorStatus } from '../types'
import logoMain from '../assets/logo_03.svg'

interface HeaderProps {
  mentorStatus: MentorStatus | null
  onLogout: () => void
}

export function Header({ mentorStatus, onLogout }: HeaderProps) {
  const isApprovedMentor = Boolean(mentorStatus?.is_mentor)

  return (
    <header className="app-header">
      <div className="brand-group">
        <div className="brand-logo-wrap">
          <img src={logoMain} alt="Duck2P" className="brand-logo-img" />
          <span className="brand-logo">Duck2P</span>
        </div>
        <span className="brand-tagline">Dúvidas de código? Aqui tem um pato. E pessoas também.</span>
      </div>

      <div className="header-actions">
        <div className="user-status-badge">
          {isApprovedMentor ? (
            <span>
              Mentor • Nível {mentorStatus?.profile?.level ?? 1} •{' '}
              {mentorStatus?.profile?.average_rating !== undefined
                ? mentorStatus.profile.average_rating.toFixed(1)
                : '5.0'}{' '}
              ★
            </span>
          ) : mentorStatus?.status === 'pending' ? (
            <span>Aluno • Candidatura a mentor pendente</span>
          ) : (
            <span>Aluno</span>
          )}
        </div>

        <button type="button" className="btn-outline" onClick={onLogout}>
          Sair
        </button>
      </div>
    </header>
  )
}
