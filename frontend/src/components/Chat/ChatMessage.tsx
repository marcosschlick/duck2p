import { useState } from 'react'
import type { Message } from '../../types/chat'
import logoIcon from '../../assets/logo_03.svg'

interface ChatMessageProps {
  message: Message
}

export function ChatMessage({ message }: ChatMessageProps) {
  const [copied, setCopied] = useState(false)
  const isAssistant = message.sender === 'assistant'

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      return
    }
  }

  return (
    <div
      className={`chat-message-row ${message.sender}`}
      role="listitem"
    >
      {isAssistant && (
        <div className="chat-avatar assistant-avatar" aria-hidden="true">
          <img src={logoIcon} alt="Duck2P" className="chat-avatar-img" />
        </div>
      )}

      <div className="message-bubble-wrapper">
        <div className="chat-message-meta">
          <strong className="chat-sender-name">
            {isAssistant ? 'Duck Bot' : 'Você'}
          </strong>
          {isAssistant && <span className="chat-meta-badge">IA</span>}
          <span className="chat-meta-time">{message.timestamp}</span>
        </div>

        <div className="message-bubble">
          <div className="message-text-content">{message.text}</div>
          {isAssistant && (
            <div className="message-bubble-actions">
              <button
                type="button"
                className="chat-copy-btn"
                onClick={handleCopy}
                aria-label="Copiar texto"
                title="Copiar resposta"
              >
                {copied ? (
                  <>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span>Copiado</span>
                  </>
                ) : (
                  <>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                    </svg>
                    <span>Copiar</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
