import { useState } from 'react'
import type { MatchDetail } from '../types'

interface RatingModalProps {
  match: MatchDetail
  onClose: () => void
  onSubmitRate: (
    score: number,
    wasResolved: boolean,
    comment: string
  ) => Promise<void>
}

export function RatingModal({ match, onClose, onSubmitRate }: RatingModalProps) {
  const [score, setScore] = useState(5)
  const [wasResolved, setWasResolved] = useState(true)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      await onSubmitRate(score, wasResolved, '')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="modal-overlay">
      <div className="modal-dialog">
        <header className="modal-header">
          <h2>Concluir Atendimento</h2>
          <p>
            Confirme a resolução da dúvida com {match.mentor_name}.
          </p>
        </header>

        <form className="modal-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>A sua dúvida foi resolvida?</label>
            <div className="toggle-group">
              <button
                type="button"
                className={'toggle-btn ' + (wasResolved ? 'active' : '')}
                onClick={() => setWasResolved(true)}
              >
                Sim
              </button>
              <button
                type="button"
                className={'toggle-btn ' + (!wasResolved ? 'active' : '')}
                onClick={() => setWasResolved(false)}
              >
                Não
              </button>
            </div>
          </div>

          <div className="form-group">
            <label>Como foi a experiência com o mentor?</label>
            <div className="rating-stars">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className={'star-button ' + (score >= star ? 'selected' : '')}
                  onClick={() => setScore(star)}
                >
                  ★
                </button>
              ))}
              <span className="rating-label">
                {score === 1 && '1 estrela - Insatisfatório'}
                {score === 2 && '2 estrelas - Regular'}
                {score === 3 && '3 estrelas - Bom'}
                {score === 4 && '4 estrelas - Muito Bom'}
                {score === 5 && '5 estrelas - Excelente'}
              </span>
            </div>
          </div>

          <div className="modal-actions">
            <button
              type="button"
              className="btn-outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancelar
            </button>
            <button type="submit" className="btn-primary" disabled={isLoading}>
              {isLoading ? 'Concluindo...' : 'Finalizar Atendimento'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
