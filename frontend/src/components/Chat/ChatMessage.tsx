import type { Message } from '../../types/chat'
import logoIcon from '../../assets/logo_03.svg'

interface ChatMessageProps {
  message: Message
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isAssistant = message.sender === 'assistant'

  return (
    <div
      className={`chat-message-row ${message.sender}`}
      role="listitem"
    >
      {isAssistant && (
        <div className="chat-avatar" aria-hidden="true" style={{ width: 28, height: 28, borderRadius: 6 }}>
          <img src={logoIcon} alt="Duck2P" className="chat-avatar-img" />
        </div>
      )}

      <div className="message-bubble-wrapper">
        <div className="message-bubble">{message.text}</div>
        <span className="message-timestamp">{message.timestamp}</span>
      </div>
    </div>
  )
}
