import type { MentorStatus } from '../types'

interface HeaderProps {
  mentorStatus: MentorStatus | null
  onLogout: () => void
}

export function Header({ mentorStatus, onLogout }: HeaderProps) {
  const isApprovedMentor = Boolean(mentorStatus?.is_mentor)

  return (
    <header className="app-header">
      <div className="brand-group">
        <span className="brand-logo">duck2p</span>
        <span className="brand-tagline">Rubber duck debugging colaborativo</span>
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
