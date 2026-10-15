import { useState, useEffect, useRef } from 'react'
import gsap from 'gsap'
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
  const shellRef = useRef<HTMLDivElement>(null)

  const displayScore = hoverScore ?? score

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

  const handleSelectStar = (star: number, targetEl: HTMLButtonElement) => {
    setScore(star)
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (!prefersReduced) {
      gsap.fromTo(
        targetEl,
        { scale: 0.8 },
        { scale: 1.08, duration: 0.32, ease: 'back.out(2.2)' }
      )
    }
  }

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
      <div
        ref={shellRef}
        className="modal-dialog-shell"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-dialog" role="dialog" aria-modal="true" aria-labelledby="rating-modal-title">
          <header className="modal-header">
            <h2 id="rating-modal-title">Concluir Atendimento</h2>
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
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span>Sim, resolvida</span>
                </button>
                <button
                  type="button"
                  className={'toggle-btn ' + (!wasResolved ? 'active' : '')}
                  onClick={() => setWasResolved(false)}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M18 6 6 18" />
                    <path d="m6 6 12 12" />
                  </svg>
                  <span>Não resolvida</span>
                </button>
              </div>
            </div>

            <div className="form-group">
              <label>Como foi a experiência com o mentor?</label>
              <div className="rating-stars">
                {[1, 2, 3, 4, 5].map((star) => {
                  const isFilled = displayScore >= star
                  return (
                    <button
                      key={star}
                      type="button"
                      className={'star-button ' + (isFilled ? 'selected' : '')}
                      onClick={(e) => handleSelectStar(star, e.currentTarget)}
                      onMouseEnter={() => setHoverScore(star)}
                      onMouseLeave={() => setHoverScore(null)}
                      aria-label={`${star} estrelas`}
                    >
                      <svg
                        width="28"
                        height="28"
                        viewBox="0 0 24 24"
                        fill={isFilled ? 'currentColor' : 'none'}
                        stroke="currentColor"
                        strokeWidth="1.9"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                      </svg>
                    </button>
                  )
                })}
                <span className="rating-label">
                  {displayScore === 1 && '1 estrela · Insatisfatório'}
                  {displayScore === 2 && '2 estrelas · Regular'}
                  {displayScore === 3 && '3 estrelas · Bom'}
                  {displayScore === 4 && '4 estrelas · Muito Bom'}
                  {displayScore === 5 && '5 estrelas · Excelente'}
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
    </div>
  )
}
