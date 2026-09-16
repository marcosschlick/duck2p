import { useState } from 'react'
import type { MentorApplication, MentorStatus } from '../types'

interface MentoriaTabProps {
  mentorStatus: MentorStatus | null
  applications: MentorApplication[]
  onApply: (skills: string) => Promise<void>
  onReview: (userId: number, action: 'approve' | 'reject') => Promise<void>
  onError: (msg: string) => void
  onSuccess: (msg: string) => void
}

export function MentoriaTab({
  mentorStatus,
  applications,
  onApply,
  onReview,
  onError,
}: MentoriaTabProps) {
  const [applySkills, setApplySkills] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const isApprovedMentor = Boolean(mentorStatus?.is_mentor)

  const handleApplySubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!applySkills.trim()) {
      onError('Preencha suas habilidades e linguagens.')
      return
    }

    setIsLoading(true)
    try {
      await onApply(applySkills.trim())
      setApplySkills('')
    } catch (err: unknown) {
      onError(err instanceof Error ? err.message : 'Falha ao enviar candidatura.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleReviewAction = async (userId: number, action: 'approve' | 'reject') => {
    setIsLoading(true)
    try {
      await onReview(userId, action)
    } catch (err: unknown) {
      onError(err instanceof Error ? err.message : 'Falha ao avaliar candidatura.')
    } finally {
      setIsLoading(false)
    }
  }

  if (isApprovedMentor) {
    return (
      <div className="tab-container">
        <div className="tab-grid">
          <section className="dashboard-card">
            <header className="card-header">
              <h2>Meu Desempenho como Mentor</h2>
              <p>Métricas e gamificação da sua contribuição na comunidade duck2p.</p>
            </header>
            <div className="metrics-grid">
              <div className="metric-box">
                <span className="metric-value">{mentorStatus?.profile?.level ?? 1}</span>
                <span className="metric-label">Nível</span>
              </div>
              <div className="metric-box">
                <span className="metric-value">{mentorStatus?.profile?.points ?? 0}</span>
                <span className="metric-label">Pontos</span>
              </div>
              <div className="metric-box">
                <span className="metric-value">
                  {mentorStatus?.profile?.average_rating !== undefined
                    ? mentorStatus.profile.average_rating.toFixed(1)
                    : '5.0'}{' '}
                  ★
                </span>
                <span className="metric-label">Média de Avaliação</span>
              </div>
              <div className="metric-box">
                <span className="metric-value">
                  {mentorStatus?.profile?.mentorships_completed ?? 0}
                </span>
                <span className="metric-label">Atendimentos Concluídos</span>
              </div>
            </div>
            <div className="profile-details">
              <p>
                <strong>Habilidades:</strong> {mentorStatus?.profile?.skills}
              </p>
            </div>
          </section>

          <section className="dashboard-card">
            <header className="card-header">
              <h2>Candidaturas de Mentores Pendentes</h2>
              <p>Avalie novos candidatos para se tornarem mentores voluntários.</p>
            </header>
            <div className="card-list">
              {applications.length === 0 ? (
                <p className="empty-state">Nenhuma candidatura pendente de revisão.</p>
              ) : (
                applications.map((app) => (
                  <article key={app.user_id} className="item-card">
                    <div className="item-meta">
                      <span className="item-author">{app.full_name}</span>
                      <span className="item-course">
                        {app.course} • Matrícula {app.student_id}
                      </span>
                    </div>
                    <p className="item-text">
                      <strong>E-mail:</strong> {app.email}
                    </p>
                    <p className="item-text">
                      <strong>Habilidades:</strong> {app.skills}
                    </p>
                    <div className="item-actions">
                      <button
                        type="button"
                        className="btn-primary"
                        disabled={isLoading}
                        onClick={() => handleReviewAction(app.user_id, 'approve')}
                      >
                        Aprovar
                      </button>
                      <button
                        type="button"
                        className="btn-outline"
                        disabled={isLoading}
                        onClick={() => handleReviewAction(app.user_id, 'reject')}
                      >
                        Rejeitar
                      </button>
                    </div>
                  </article>
                ))
              )}
            </div>
          </section>
        </div>
      </div>
    )
  }

  return (
    <div className="tab-container">
      <section className="dashboard-card form-centered">
        <header className="card-header">
          <h2>
            {mentorStatus?.status === 'pending'
              ? 'Candidatura em Análise'
              : 'Quero Ser Mentor duck2p'}
          </h2>
          <p>
            {mentorStatus?.status === 'pending'
              ? 'Sua solicitação está pendente de aprovação por mentores ativos. Você pode atualizar seus dados abaixo se desejar.'
              : 'Ajude calouros a superar desafios de código, ganhe pontos e construa sua reputação no campus.'}
          </p>
        </header>

        <form className="card-form" onSubmit={handleApplySubmit}>
          <div className="form-group">
            <label htmlFor="mentor_skills">Habilidades e Linguagens</label>
            <input
              id="mentor_skills"
              type="text"
              placeholder="Ex: Python, React, C++, Algoritmos e Estrutura de Dados"
              value={applySkills}
              onChange={(e) => setApplySkills(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn-primary" disabled={isLoading}>
            {isLoading
              ? 'Enviando...'
              : mentorStatus?.status === 'pending'
              ? 'Atualizar Candidatura'
              : 'Enviar Candidatura'}
          </button>
        </form>
      </section>
    </div>
  )
}
