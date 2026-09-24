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
  const [hoverScore, setHoverScore] = useState<number | null>(null)
  const [wasResolved, setWasResolved] = useState(true)
  const [isLoading, setIsLoading] = useState(false)

  const displayScore = hoverScore ?? score

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
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
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
                <span>✓</span> Sim, resolvida
              </button>
              <button
                type="button"
                className={'toggle-btn ' + (!wasResolved ? 'active' : '')}
                onClick={() => setWasResolved(false)}
              >
                <span>✕</span> Não resolvida
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
                  className={'star-button ' + (displayScore >= star ? 'selected' : '')}
                  onClick={() => setScore(star)}
                  onMouseEnter={() => setHoverScore(star)}
                  onMouseLeave={() => setHoverScore(null)}
                  aria-label={`${star} estrelas`}
                >
                  ★
                </button>
              ))}
              <span className="rating-label">
                {displayScore === 1 && '1 estrela - Insatisfatório'}
                {displayScore === 2 && '2 estrelas - Regular'}
                {displayScore === 3 && '3 estrelas - Bom'}
                {displayScore === 4 && '4 estrelas - Muito Bom'}
                {displayScore === 5 && '5 estrelas - Excelente'}
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
