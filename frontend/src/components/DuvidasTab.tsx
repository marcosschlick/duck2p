import { useState } from 'react'
import type { QuestionOpen } from '../types'
import { questionApi } from '../services/api'

interface DuvidasTabProps {
  isMentor: boolean
  openQuestions: QuestionOpen[]
  onAcceptQuestion: (id: number) => Promise<void>
  onQuestionCreated: () => void
  onError: (msg: string) => void
  onSuccess: (msg: string) => void
}

export function DuvidasTab({
  isMentor,
  openQuestions,
  onAcceptQuestion,
  onQuestionCreated,
  onError,
  onSuccess,
}: DuvidasTabProps) {
  const [questionDescription, setQuestionDescription] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (questionDescription.trim().length < 10) {
      onError('A descrição da dúvida deve ter no mínimo 10 caracteres.')
      return
    }

    setIsLoading(true)
    try {
      await questionApi.create(questionDescription.trim())
      setQuestionDescription('')
      onSuccess('Dúvida publicada com sucesso! Aguarde um mentor aceitar.')
      onQuestionCreated()
    } catch (err: unknown) {
      onError(err instanceof Error ? err.message : 'Falha ao enviar dúvida.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="tab-grid">
      <section className="dashboard-card">
        <header className="card-header">
          <h2>Enviar Nova Dúvida</h2>
          <p>Explique seu problema ou erro de código para receber apoio de um mentor.</p>
        </header>
        <form className="card-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="problem_description">Descrição do Problema</label>
            <textarea
              id="problem_description"
              rows={5}
              placeholder="Descreva o que você está tentando fazer, o erro encontrado e o que já tentou (mínimo 10 caracteres)..."
              value={questionDescription}
              onChange={(e) => setQuestionDescription(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn-primary" disabled={isLoading}>
            {isLoading ? 'Publicando...' : 'Publicar Dúvida'}
          </button>
        </form>
      </section>

      {isMentor && (
        <section className="dashboard-card">
          <header className="card-header">
            <h2>Dúvidas Abertas da Comunidade</h2>
            <p>Dúvidas enviadas por calouros aguardando auxílio de um mentor.</p>
          </header>
          <div className="card-list">
            {openQuestions.length === 0 ? (
              <p className="empty-state">Nenhuma dúvida aberta no momento.</p>
            ) : (
              openQuestions.map((q) => (
                <article key={q.id} className="item-card">
                  <div className="item-meta">
                    <span className="item-author">{q.student_name}</span>
                    <span className="item-course">{q.course}</span>
                  </div>
                  <p className="item-description">{q.problem_description}</p>
                  <div className="item-actions">
                    <button
                      type="button"
                      className="btn-primary"
                      onClick={() => onAcceptQuestion(q.id)}
                    >
                      Aceitar Dúvida
                    </button>
                  </div>
                </article>
              ))
            )}
          </div>
        </section>
      )}
    </div>
  )
}
