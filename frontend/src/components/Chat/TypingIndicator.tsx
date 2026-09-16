import logoIcon from '../../assets/logo_03.svg'

export function TypingIndicator() {
  return (
    <div className="typing-indicator-row" aria-label="Duck2P está digitando...">
      <div
        className="chat-avatar"
        aria-hidden="true"
        style={{ width: 28, height: 28, borderRadius: 6 }}
      >
        <img src={logoIcon} alt="Duck2P" className="chat-avatar-img" />
      </div>
      <div className="typing-bubble">
        <span className="typing-dot" />
        <span className="typing-dot" />
        <span className="typing-dot" />
      </div>
    </div>
  )
}
