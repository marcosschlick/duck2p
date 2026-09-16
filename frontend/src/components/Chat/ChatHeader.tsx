import logoIcon from '../../assets/logo_03.svg'

interface ChatHeaderProps {
  onResetChat?: () => void
}

export function ChatHeader({ onResetChat }: ChatHeaderProps) {
  return (
    <div className="chat-header">
      <div className="chat-header-info">
        <div className="chat-avatar" aria-hidden="true">
          <img src={logoIcon} alt="Duck2P" className="chat-avatar-img" />
        </div>
        <div className="chat-header-text">
          <h2 className="chat-header-title">Duck2P</h2>
          <span className="chat-header-subtitle">
            Seu rubber duck debugging de confiança
          </span>
        </div>
      </div>

      <button
        type="button"
        className="chat-header-action-btn"
        onClick={onResetChat}
        aria-label="Opções do chat"
        title="Reiniciar conversa"
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="1" />
          <circle cx="19" cy="12" r="1" />
          <circle cx="5" cy="12" r="1" />
        </svg>
      </button>
    </div>
  )
}
