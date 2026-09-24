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
    e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`
  }

  useEffect(() => {
    if (!disabled && inputRef.current) {
      inputRef.current.focus()
    }
  }, [disabled])

  const canSubmit = text.trim().length >= 10 && !disabled

  return (
    <div className="chat-composer-area">
      <form className="chat-composer-card" onSubmit={handleSubmit}>
        <textarea
          ref={inputRef}
          rows={2}
          maxLength={2000}
          className="chat-composer-textarea"
          placeholder="Explique o que seu código deveria fazer, qual erro ocorreu ou onde você travou..."
          value={text}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          aria-label="Mensagem para o assistente"
        />

        <div className="chat-composer-toolbar">
          <div className="composer-toolbar-left">
            <span className="composer-tip-badge">
              ✦ Rubber Duck Debugging
            </span>
          </div>

          <div className="composer-toolbar-right">
            <span className="composer-char-count">
              {text.length}/2000
            </span>
            <kbd className="composer-kbd">↵ Enter</kbd>
            <button
              type="submit"
              className="composer-send-btn"
              disabled={!canSubmit}
              aria-label="Enviar mensagem"
              title={text.trim().length < 10 ? 'Digite ao menos 10 caracteres' : 'Enviar mensagem'}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </form>

      {text.length > 0 && text.length < 10 && (
        <div className="composer-hint-warning">
          <span>Faltam {10 - text.length} caracteres para habilitar o pareamento com mentores.</span>
        </div>
      )}
    </div>
  )
}
