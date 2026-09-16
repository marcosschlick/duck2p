import { useState, useRef, useEffect } from 'react'
import type { MatchDetail, MessageItem } from '../types'

interface AtendimentosTabProps {
  matches: MatchDetail[]
  selectedMatch: MatchDetail | null
  currentUserId: number | null
  messages: MessageItem[]
  onSelectMatch: (m: MatchDetail | null) => void
  onSendMessage: (content: string) => Promise<void>
  onRequestRate: (m: MatchDetail) => void
}

function formatAffinity(score?: number | null): string {
  if (score === null || score === undefined) return ''
  const percent = Math.min(100, Math.max(0, Math.round(score * 100)))
  return 'Afinidade: ' + percent + '%'
}

export function AtendimentosTab({
  matches,
  selectedMatch,
  currentUserId,
  messages,
  onSelectMatch,
  onSendMessage,
  onRequestRate,
}: AtendimentosTabProps) {
  const [messageInput, setMessageInput] = useState('')
  const chatEndRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (selectedMatch && chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, selectedMatch])

  const handleSend = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!messageInput.trim()) return
    const text = messageInput.trim()
    setMessageInput('')
    await onSendMessage(text)
  }

  if (selectedMatch) {
    const isStudent = currentUserId === selectedMatch.student_id
    const isMentor = currentUserId === selectedMatch.mentor_id

    return (
      <div className="tab-container">
        <section className="chat-container">
          <header className="chat-header">
            <div className="chat-header-info">
              <button
                type="button"
                className="btn-link"
                onClick={() => onSelectMatch(null)}
              >
                ← Voltar para a lista
              </button>
              <div className="chat-title-group">
                <h2>
                  {isStudent
                    ? 'Mentor: ' + selectedMatch.mentor_name
                    : 'Aluno: ' + selectedMatch.student_name}
                </h2>
                {selectedMatch.similarity_score !== undefined &&
                  selectedMatch.similarity_score !== null && (
                    <span className="affinity-badge">
                      {formatAffinity(selectedMatch.similarity_score)}
                    </span>
                  )}
              </div>
              <p className="chat-contact">Atendimento #{selectedMatch.id}</p>
            </div>

            {isStudent && (
              <button
                type="button"
                className="btn-primary btn-complete"
                onClick={() => onRequestRate(selectedMatch)}
              >
                Concluir e Avaliar
              </button>
            )}
          </header>

          <div className="chat-question-banner">
            <strong>Dúvida do Aluno:</strong> {selectedMatch.problem_description}
          </div>

          {isMentor && selectedMatch.ai_briefing && (
            <div className="chat-briefing-card">
              <div className="briefing-header">
                <span className="briefing-icon">🦆</span>
                <strong>Briefing Pedagógico da IA (Exclusivo do Mentor)</strong>
              </div>
              <div className="briefing-content">{selectedMatch.ai_briefing}</div>
            </div>
          )}

          <div className="chat-messages">
            {messages.length === 0 ? (
              <p className="empty-state">Nenhuma mensagem ainda. Inicie o diálogo!</p>
            ) : (
              messages.map((msg) => {
                const isDuckBot = msg.sender_name === 'Duck Bot' || msg.sender_id === null
                return (
                  <div
                    key={msg.id}
                    className={
                      'message-bubble ' +
                      (isDuckBot
                        ? 'message-duckbot'
                        : msg.is_mine
                        ? 'message-mine'
                        : 'message-other')
                    }
                  >
                    <span className="message-sender">
                      {isDuckBot && '🦆 '}
                      {msg.sender_name}
                    </span>
                    <p className="message-text">{msg.content}</p>
                  </div>
                )
              })
            )}
            <div ref={chatEndRef} />
          </div>

          <form className="chat-form" onSubmit={handleSend}>
            <input
              type="text"
              placeholder="Digite sua mensagem de suporte..."
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              required
            />
            <button type="submit" className="btn-primary">
              Enviar
            </button>
          </form>
        </section>
      </div>
    )
  }

  return (
    <div className="tab-container">
      <section className="dashboard-card">
        <header className="card-header">
          <h2>Meus Atendimentos Ativos</h2>
          <p>Sessões de mentoria em andamento para resolução de problemas.</p>
        </header>
        <div className="card-list">
          {matches.length === 0 ? (
            <p className="empty-state">
              Você não possui nenhum atendimento ativo no momento.
            </p>
          ) : (
            matches.map((m) => {
              const isStudent = currentUserId === m.student_id
              return (
                <article key={m.id} className="item-card">
                  <div className="item-meta">
                    <span className="item-author">
                      {isStudent ? 'Mentor: ' + m.mentor_name : 'Aluno: ' + m.student_name}
                    </span>
                    {m.similarity_score !== undefined && m.similarity_score !== null && (
                      <span className="affinity-badge">
                        {formatAffinity(m.similarity_score)}
                      </span>
                    )}
                  </div>
                  <p className="item-description">{m.problem_description}</p>
                  <div className="item-actions">
                    <button
                      type="button"
                      className="btn-primary"
                      onClick={() => onSelectMatch(m)}
                    >
                      Abrir Chat
                    </button>
                    {isStudent && (
                      <button
                        type="button"
                        className="btn-outline"
                        onClick={() => onRequestRate(m)}
                      >
                        Concluir e Avaliar
                      </button>
                    )}
                  </div>
                </article>
              )
            })
          )}
        </div>
      </section>
    </div>
  )
}
