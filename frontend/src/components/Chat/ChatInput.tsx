import { useState, useRef, useEffect } from 'react'

interface ChatInputProps {
  onSendMessage: (text: string) => void
  disabled?: boolean
}

const QUICK_PROMPTS = [
  {
    label: 'Loop infinito',
    prompt: 'Meu laço de repetição entrou em loop infinito e não atinge a condição de parada quando testo com entradas limites.',
  },
  {
    label: 'Erro de lógica / Vetores',
    prompt: 'Estou recebendo índice fora do limite ao percorrer um vetor e acumular os valores. Preciso revisar a lógica de iteração.',
  },
  {
    label: 'Bug em API / Banco',
    prompt: 'Minha requisição retorna erro ao validar os parâmetros enviados e não consigo identificar onde o estado está quebrando.',
  },
]

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

  const handleSelectPrompt = (promptText: string) => {
    if (disabled) return
    setText(promptText)
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }

  useEffect(() => {
    if (!disabled && inputRef.current) {
      inputRef.current.focus()
    }
  }, [disabled])

  const canSubmit = text.trim().length >= 10 && !disabled

  return (
    <div className="chat-composer-area">
      {text.length === 0 && !disabled && (
        <div className="composer-quick-chips" aria-label="Sugestões rápidas de dúvida">
          {QUICK_PROMPTS.map((item) => (
            <button
              key={item.label}
              type="button"
              className="composer-quick-chip"
              onClick={() => handleSelectPrompt(item.prompt)}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
              </svg>
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      )}

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
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="12" cy="12" r="10" />
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                <path d="M12 17h.01" />
              </svg>
              <span>Rubber Duck Debugging</span>
            </span>
          </div>

          <div className="composer-toolbar-right">
            <span className="composer-char-count">
              {text.length}/2000
            </span>
            <kbd className="composer-kbd">Enter</kbd>
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
