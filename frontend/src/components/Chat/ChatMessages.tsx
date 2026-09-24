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
        <span className="welcome-pill-icon">🦆</span>
        <span>
          Depuração por IA ativa. Se não resolver com o pato, um mentor do campus será chamado!
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
