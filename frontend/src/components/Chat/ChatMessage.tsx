import type { Message } from '../../types/chat'

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
          <svg viewBox="0 0 24 24" fill="none" style={{ width: 17, height: 17 }}>
            <path
              d="M12 3a4 4 0 0 0-4 4c0 .85.27 1.63.72 2.28L4 13c-1.1 1.1-1.1 2.9 0 4l3 3c1.1 1.1 2.9 1.1 4 0l3.72-3.72c.65.45 1.43.72 2.28.72a4 4 0 0 0 4-4c0-1.3-.63-2.45-1.6-3.17L18.4 7.4C18.15 4.9 16.27 3 13.75 3H12Z"
              fill="#f59e0b"
            />
            <circle cx="10" cy="6.5" r="1" fill="#0D0D0D" />
          </svg>
        </div>
      )}

      <div className="message-bubble-wrapper">
        <div className="message-bubble">{message.text}</div>
        <span className="message-timestamp">{message.timestamp}</span>
      </div>
    </div>
  )
}
