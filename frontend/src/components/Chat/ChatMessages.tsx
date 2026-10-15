import { useEffect, useRef } from 'react'
import type { Message } from '../../types/chat'
import { ChatMessage } from './ChatMessage'
import { TypingIndicator } from './TypingIndicator'

interface ChatMessagesProps {
  messages: Message[]
  isThinking?: boolean
}

export function ChatMessages({ messages, isThinking }: ChatMessagesProps) {
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isThinking])

  return (
    <div className="chat-messages-container" role="list" aria-label="Histórico de mensagens">
      <div className="chat-welcome-pill-banner">
        <span className="welcome-pill-icon" aria-hidden="true">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="16 18 22 12 16 6" />
            <polyline points="8 6 2 12 8 18" />
          </svg>
        </span>
        <span>
          Depuração por IA ativa. Se não resolver com o pato, um mentor do campus será chamado automaticamente.
        </span>
      </div>

      {messages.map((msg) => (
        <ChatMessage key={msg.id} message={msg} />
      ))}
      {isThinking && <TypingIndicator />}
      <div ref={endRef} aria-hidden="true" />
    </div>
  )
}
