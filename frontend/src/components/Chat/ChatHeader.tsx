interface ChatHeaderProps {
  onResetChat?: () => void
}

export function ChatHeader({ onResetChat }: ChatHeaderProps) {
  return (
    <div className="chat-header">
      <div className="chat-header-info">
        <div className="chat-avatar" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none">
            <path
              d="M12 3a4 4 0 0 0-4 4c0 .85.27 1.63.72 2.28L4 13c-1.1 1.1-1.1 2.9 0 4l3 3c1.1 1.1 2.9 1.1 4 0l3.72-3.72c.65.45 1.43.72 2.28.72a4 4 0 0 0 4-4c0-1.3-.63-2.45-1.6-3.17L18.4 7.4C18.15 4.9 16.27 3 13.75 3H12Z"
              fill="#f59e0b"
            />
            <circle cx="10" cy="6.5" r="1" fill="#0D0D0D" />
            <path
              d="M16 6.5c1.5 0 2.5 1 2.5 1s-1 1.5-2.5 1.5"
              stroke="#d97706"
              strokeWidth="1.2"
              strokeLinecap="round"
            />
          </svg>
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
