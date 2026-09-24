import { useState, useEffect } from 'react'
import type { MentorStatus, UserProfile } from '../types'
import { authApi } from '../services/api'

interface ProfileModalProps {
  mentorStatus: MentorStatus | null
  onClose: () => void
  onSaveSkills: (skills: string) => Promise<void>
  onLogout: () => void
}

const SUGGESTED_SKILLS = [
  'Python',
  'C / C++',
  'JavaScript',
  'TypeScript',
  'React',
  'Banco de Dados',
  'Algoritmos',
  'Git',
]

export function ProfileModal({
  mentorStatus,
  onClose,
  onSaveSkills,
  onLogout,
}: ProfileModalProps) {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [skills, setSkills] = useState(mentorStatus?.profile?.skills || '')
  const [prevSkills, setPrevSkills] = useState(mentorStatus?.profile?.skills)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [feedback, setFeedback] = useState<string | null>(null)

  if (mentorStatus?.profile?.skills !== prevSkills) {
    setPrevSkills(mentorStatus?.profile?.skills)
    if (mentorStatus?.profile?.skills) {
      setSkills(mentorStatus.profile.skills)
    }
  }

  const isMentor = Boolean(mentorStatus?.is_mentor)

  const handleAddSkill = (tag: string) => {
    const current = skills.trim()
    if (!current) {
      setSkills(tag)
      return
    }
    const existing = current.split(',').map((s) => s.trim().toLowerCase())
    if (existing.includes(tag.toLowerCase())) return
    setSkills(`${current}, ${tag}`)
  }

  useEffect(() => {
    let isMounted = true
    authApi
      .getMe()
      .then((data) => {
        if (isMounted) setUser(data)
      })
      .catch(() => {})
      .finally(() => {
        if (isMounted) setIsLoading(false)
      })
    return () => {
      isMounted = false
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!skills.trim()) return
    setIsSaving(true)
    setFeedback(null)
    try {
      await onSaveSkills(skills.trim())
      setFeedback('Habilidades atualizadas com sucesso!')
    } catch {
      setFeedback('Erro ao atualizar habilidades.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog profile-modal" onClick={(e) => e.stopPropagation()}>
        <header className="modal-header">
          <div className="profile-header-title">
            <h2>Meu Perfil</h2>
            <button type="button" className="modal-close-btn" onClick={onClose}>
              ✕
            </button>
          </div>
          <p>Dados acadêmicos e perfil de mentoria no IFSUL.</p>
        </header>

        {isLoading ? (
          <p className="empty-state">Carregando dados da conta...</p>
        ) : user ? (
          <div className="profile-body">
            <div className="profile-info-grid">
              <div className="profile-info-item">
                <span className="profile-label">Nome Completo</span>
                <strong className="profile-value">{user.full_name}</strong>
              </div>
              <div className="profile-info-item">
                <span className="profile-label">E-mail Acadêmico</span>
                <strong className="profile-value">{user.email}</strong>
              </div>
              <div className="profile-info-item">
                <span className="profile-label">Matrícula</span>
                <strong className="profile-value">{user.student_id}</strong>
              </div>
              <div className="profile-info-item">
                <span className="profile-label">Curso</span>
                <strong className="profile-value">{user.course}</strong>
              </div>
            </div>

            <div className="profile-mentor-section">
              <div className="profile-mentor-header">
                <h3>{isMentor ? 'Perfil de Mentor' : 'Tornar-se Mentor'}</h3>
                {isMentor && (
                  <div className="profile-mentor-badges">
                    <span className="badge-level">Nível {mentorStatus?.profile?.level ?? 1}</span>
                    <span className="badge-points">{mentorStatus?.profile?.points ?? 0} pts</span>
                  </div>
                )}
              </div>

              <p className="profile-mentor-description">
                {isMentor
                  ? 'Atualize as linguagens e tópicos que você domina para receber dúvidas compatíveis:'
                  : 'Compartilhe seu conhecimento com calouros e outros alunos do IFSUL. Cadastre suas linguagens e vire mentor na hora:'}
              </p>

              <form onSubmit={handleSubmit} className="profile-mentor-form">
                <div className="form-group">
                  <label htmlFor="profile_skills">Tecnologias / Habilidades</label>
                  <input
                    id="profile_skills"
                    type="text"
                    maxLength={250}
                    value={skills}
                    onChange={(e) => setSkills(e.target.value)}
                    placeholder="Ex.: Python, C, React, SQL, Estruturas de Dados"
                    required
                  />
                  <div className="quick-skill-chips">
                    {SUGGESTED_SKILLS.map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        className="skill-chip-btn"
                        onClick={() => handleAddSkill(tag)}
                      >
                        + {tag}
                      </button>
                    ))}
                  </div>
                </div>

                {feedback && (
                  <p className="profile-feedback-text">{feedback}</p>
                )}

                <div className="profile-mentor-actions">
                  <button
                    type="submit"
                    className="btn-primary"
                    disabled={isSaving || !skills.trim()}
                  >
                    {isSaving
                      ? 'Salvando...'
                      : isMentor
                      ? 'Atualizar Habilidades'
                      : 'Ativar Modo Mentor'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        ) : null}

        <footer className="profile-modal-footer">
          <button type="button" className="btn-outline btn-danger-outline" onClick={onLogout}>
            Sair da Conta
          </button>
          <button type="button" className="btn-outline" onClick={onClose}>
            Fechar
          </button>
        </footer>
      </div>
    </div>
  )
}
