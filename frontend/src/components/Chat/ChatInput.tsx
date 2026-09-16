import { useState, useRef, useEffect } from 'react'

interface ChatInputProps {
  onSendMessage: (text: string) => void
  disabled?: boolean
}

export function ChatInput({ onSendMessage, disabled }: ChatInputProps) {
  const [text, setText] = useState('')
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!text.trim() || disabled) return
    onSendMessage(text.trim())
    setText('')
    if (inputRef.current) {
      inputRef.current.style.height = 'auto'
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value)
    e.target.style.height = 'auto'
    e.target.style.height = `${Math.min(e.target.scrollHeight, 100)}px`
  }

  useEffect(() => {
    if (!disabled && inputRef.current) {
      inputRef.current.focus()
    }
  }, [disabled])

  const canSubmit = text.trim().length > 0 && !disabled

  return (
    <div className="chat-input-area">
      <form className="chat-form" onSubmit={handleSubmit}>
        <textarea
          ref={inputRef}
          rows={1}
          maxLength={2000}
          className="chat-text-input"
          placeholder="Digite sua dúvida aqui..."
          value={text}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          aria-label="Mensagem para o assistente"
        />

        <button
          type="submit"
          className="chat-send-btn"
          disabled={!canSubmit}
          aria-label="Enviar mensagem"
          title="Enviar (Enter)"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M5 12h14" />
            <path d="m12 5 7 7-7 7" />
          </svg>
        </button>
      </form>
    </div>
  )
}
