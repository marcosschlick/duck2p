import { useState, useEffect, useRef } from 'react'
import gsap from 'gsap'
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
  const shellRef = useRef<HTMLDivElement>(null)

  if (mentorStatus?.profile?.skills !== prevSkills) {
    setPrevSkills(mentorStatus?.profile?.skills)
    if (mentorStatus?.profile?.skills) {
      setSkills(mentorStatus.profile.skills)
    }
  }

  const isMentor = Boolean(mentorStatus?.is_mentor)

  const parsedSkillSet = new Set(
    skills
      .split(',')
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean)
  )

  const handleToggleSkill = (tag: string) => {
    const currentList = skills
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
    const existsIndex = currentList.findIndex(
      (s) => s.toLowerCase() === tag.toLowerCase()
    )
    if (existsIndex >= 0) {
      const next = currentList.filter((_, idx) => idx !== existsIndex)
      setSkills(next.join(', '))
    } else {
      setSkills([...currentList, tag].join(', '))
    }
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

  useEffect(() => {
    if (!shellRef.current) return
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReduced) return

    const ctx = gsap.context(() => {
      gsap.fromTo(
        shellRef.current,
        { y: 16, scale: 0.96, opacity: 0 },
        {
          y: 0,
          scale: 1,
          opacity: 1,
          duration: 0.34,
          ease: 'back.out(1.4)',
          clearProps: 'transform,opacity',
        }
      )
    }, shellRef)

    return () => ctx.revert()
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
      <div
        ref={shellRef}
        className="modal-dialog-shell profile-modal-shell"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-dialog profile-modal" role="dialog" aria-modal="true" aria-labelledby="profile-modal-title">
          <header className="modal-header">
            <div className="profile-header-title">
              <h2 id="profile-modal-title">Meu Perfil</h2>
              <button
                type="button"
                className="modal-close-btn"
                onClick={onClose}
                aria-label="Fechar modal"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M18 6 6 18" />
                  <path d="m6 6 12 12" />
                </svg>
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
                  <strong className="profile-value profile-value-mono">{user.student_id}</strong>
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
                      {SUGGESTED_SKILLS.map((tag) => {
                        const active = parsedSkillSet.has(tag.toLowerCase())
                        return (
                          <button
                            key={tag}
                            type="button"
                            className={'skill-chip-btn ' + (active ? 'is-active' : '')}
                            onClick={() => handleToggleSkill(tag)}
                          >
                            {active ? (
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                <polyline points="20 6 9 17 4 12" />
                              </svg>
                            ) : (
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                <path d="M5 12h14" />
                                <path d="M12 5v14" />
                              </svg>
                            )}
                            <span>{tag}</span>
                          </button>
                        )
                      })}
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
    </div>
  )
}
