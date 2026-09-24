import logoIcon from '../../assets/logo_03.svg'

interface ChatHeaderProps {
  onResetChat?: () => void
}

export function ChatHeader({ onResetChat }: ChatHeaderProps) {
  return (
    <div className="chat-header">
      <div className="chat-header-info">
        <div className="chat-avatar-wrapper">
          <div className="chat-avatar" aria-hidden="true">
            <img src={logoIcon} alt="Duck2P" className="chat-avatar-img" />
          </div>
          <span className="avatar-online-dot" />
        </div>
        <div className="chat-header-text">
          <div className="chat-header-title-row">
            <h2 className="chat-header-title">Duck2P</h2>
            <span className="chat-header-badge">Rubber Duck IA</span>
          </div>
          <span className="chat-header-subtitle">
            Seu parceiro de depuração guiada no IFSUL
          </span>
        </div>
      </div>

      <button
        type="button"
        className="chat-header-reset-btn"
        onClick={onResetChat}
        aria-label="Limpar conversa"
        title="Reiniciar conversa com o pato"
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
          <path d="M21 3v5h-5" />
          <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
          <path d="M3 21v-5h5" />
        </svg>
        <span>Limpar conversa</span>
      </button>
    </div>
  )
}
