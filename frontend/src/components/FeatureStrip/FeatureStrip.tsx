import './FeatureStrip.css'

export function FeatureStrip() {
  return (
    <footer className="feature-strip" aria-label="Como funciona o Duck2P">
      <div className="feature-item">
        <div className="feature-header">
          <svg
            className="feature-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          <span className="feature-title">1 — Explique</span>
        </div>
        <p className="feature-description">
          Conte o que está acontecendo no seu código com suas palavras.
        </p>
      </div>

      <div className="feature-item">
        <div className="feature-header">
          <svg
            className="feature-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2" />
            <path d="M12 20v2" />
            <path d="m4.93 4.93 1.41 1.41" />
            <path d="m17.66 17.66 1.41 1.41" />
            <path d="M2 12h2" />
            <path d="M20 12h2" />
            <path d="m6.34 17.66-1.41 1.41" />
            <path d="m19.07 4.93-1.41 1.41" />
          </svg>
          <span className="feature-title">2 — Orientações</span>
        </div>
        <p className="feature-description">
          O pato te ajuda a investigar o erro e encontrar o melhor caminho.
        </p>
      </div>

      <div className="feature-item">
        <div className="feature-header">
          <svg
            className="feature-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
          <span className="feature-title">3 — Conexão</span>
        </div>
        <p className="feature-description">
          Se precisar, te conecto a um mentor com a experiência certa.
        </p>
      </div>

      <div className="feature-item">
        <div className="feature-header">
          <svg
            className="feature-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="16 18 22 12 16 6" />
            <polyline points="8 6 2 12 8 18" />
          </svg>
          <span className="feature-title">4 — Evolução</span>
        </div>
        <p className="feature-description">
          Aprender a depurar também é a melhor forma de resolver.
        </p>
      </div>
    </footer>
  )
}
