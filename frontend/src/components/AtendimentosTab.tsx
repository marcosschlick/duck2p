import { useState, useRef, useEffect } from 'react'
import type { MatchDetail, MessageItem, QuestionItem, QuestionOpen } from '../types'
import { DuckScene } from './DuckScene/DuckScene'
import logoIcon from '../assets/logo_03.svg'

interface AtendimentosTabProps {
  matches: MatchDetail[]
  selectedMatch: MatchDetail | null
  currentUserId: number | null
  messages: MessageItem[]
  isMentor?: boolean
  openQuestions?: QuestionOpen[]
  myQuestions?: QuestionItem[]
  onAcceptQuestion?: (id: number) => Promise<void>
  onSelectMatch: (m: MatchDetail | null) => void
  onSendMessage: (content: string) => Promise<void>
  onRequestRate: (m: MatchDetail) => void
}

function formatAffinity(score?: number | null): string {
  if (score === null || score === undefined) return ''
  const percent = Math.min(100, Math.max(0, Math.round(score * 100)))
  return 'Afinidade: ' + percent + '%'
}

function formatTime(dateStr?: string | null): string {
  if (!dateStr) return ''
  try {
    const d = new Date(dateStr)
    return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  } catch {
    return ''
  }
}

export function AtendimentosTab({
  matches,
  selectedMatch,
  currentUserId,
  messages,
  isMentor,
  openQuestions = [],
  myQuestions = [],
  onAcceptQuestion,
  onSelectMatch,
  onSendMessage,
  onRequestRate,
}: AtendimentosTabProps) {
  const [subtab, setSubtab] = useState<'duvidas' | 'mentorias'>('duvidas')
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

  if (selectedMatch && selectedMatch.status === 'active') {
    const isStudent = currentUserId === selectedMatch.student_id
    const isMentorUser = currentUserId === selectedMatch.mentor_id
    const visibleMessages = isMentorUser
      ? messages.filter((msg) => msg.sender_name !== 'Duck Bot' && msg.sender_id !== null)
      : messages

    return (
      <div className="tab-container">
        <div className="duck-main-layout">
          <div className="duck-chat-column">
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
                    {selectedMatch.first_response_at ? (
                      <span className="status-badge status-badge-andamento">● Em andamento</span>
                    ) : (
                      <span className="status-badge status-badge-conectado">● Mentor conectado</span>
                    )}
                    {selectedMatch.similarity_score !== undefined &&
                      selectedMatch.similarity_score !== null && (
                        <span className="affinity-badge">
                          {formatAffinity(selectedMatch.similarity_score)}
                        </span>
                      )}
                  </div>
                  <p className="chat-contact">Atendimento #{selectedMatch.id}</p>
                </div>

                {isStudent && selectedMatch.status === 'active' && (
                  <button
                    type="button"
                    className="btn-primary btn-complete"
                    onClick={() => onRequestRate(selectedMatch)}
                  >
                    Finalizar Atendimento
                  </button>
                )}
              </header>

              <div className="chat-question-banner">
                <strong>Dúvida do Aluno:</strong> {selectedMatch.problem_description}
              </div>

              <div className="chat-messages">
                {visibleMessages.length === 0 ? (
                  <p className="empty-state">Nenhuma mensagem ainda. Inicie o diálogo!</p>
                ) : (
                  visibleMessages.map((msg) => {
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
                          {isDuckBot && (
                            <img
                              src={logoIcon}
                              alt="Duck2P"
                              style={{ width: 16, height: 16, objectFit: 'contain', verticalAlign: 'middle', marginRight: 4 }}
                            />
                          )}
                          {msg.sender_name}
                        </span>
                        <p className="message-text">{msg.content}</p>
                        {msg.created_at && (
                          <span className="message-time">
                            {formatTime(msg.created_at)}
                          </span>
                        )}
                      </div>
                    )
                  })
                )}
                <div ref={chatEndRef} />
              </div>

              <form className="chat-form" onSubmit={handleSend}>
                <input
                  type="text"
                  maxLength={2000}
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

          <aside className="duck-scene-column">
            <div className="duck-3d-wrapper">
              <DuckScene />
            </div>

            {isMentorUser && selectedMatch.ai_briefing ? (
              <div className="chat-briefing-card">
                <div className="briefing-header">
                  <img
                    src={logoIcon}
                    alt="Duck2P"
                    style={{ width: 18, height: 18, objectFit: 'contain', verticalAlign: 'middle', marginRight: 6 }}
                  />
                  <strong>Briefing Pedagógico da IA (Exclusivo do Mentor)</strong>
                </div>
                <div className="briefing-content">{selectedMatch.ai_briefing}</div>
              </div>
            ) : (
              <div className="chat-briefing-card">
                <div className="briefing-header">
                  <img
                    src={logoIcon}
                    alt="Duck2P"
                    style={{ width: 18, height: 18, objectFit: 'contain', verticalAlign: 'middle', marginRight: 6 }}
                  />
                  <strong>Rubber Duck Debugging</strong>
                </div>
                <div className="briefing-content">
                  Explique seu raciocínio passo a passo. Descrever o problema com clareza ajuda a estruturar o pensamento e encontrar a solução.
                </div>
              </div>
            )}
          </aside>
        </div>
      </div>
    )
  }

  const studentMatches = matches.filter((m) => currentUserId === m.student_id)
  const mentorMatches = matches.filter((m) => currentUserId === m.mentor_id)

  const matchedQuestionIds = new Set(matches.map((m) => m.question_id))
  const pendingQuestions = (myQuestions || []).filter(
    (q) => q.status === 'pending' || !matchedQuestionIds.has(q.id)
  )

  const totalDuvidasCount = studentMatches.length + pendingQuestions.length

  return (
    <div className="tab-container">
      <div className="subtabs-bar">
        <button
          type="button"
          className={'subtab-btn ' + (subtab === 'duvidas' ? 'active' : '')}
          onClick={() => setSubtab('duvidas')}
        >
          Minhas Dúvidas ({totalDuvidasCount})
        </button>
        <button
          type="button"
          className={'subtab-btn ' + (subtab === 'mentorias' ? 'active' : '')}
          onClick={() => setSubtab('mentorias')}
        >
          Minhas Mentorias ({mentorMatches.length})
        </button>
      </div>

      <section className="dashboard-card">
        <header className="card-header">
          <h2>
            {subtab === 'duvidas'
              ? 'Minhas Dúvidas'
              : 'Atendimentos que Estou Mentorando'}
          </h2>
          <p>
            {subtab === 'duvidas'
              ? 'Dúvidas que você enviou aguardando ou em atendimento por um mentor.'
              : 'Sessões onde você está ajudando outros estudantes do IFSUL.'}
          </p>
        </header>

        <div className="card-list">
          {subtab === 'duvidas' ? (
            studentMatches.length === 0 && pendingQuestions.length === 0 ? (
              <p className="empty-state">
                Você não possui nenhuma dúvida registrada no momento. Envie uma nova dúvida na aba Dúvidas para se conectar a um mentor!
              </p>
            ) : (
              <>
                {studentMatches.map((m) => (
                  <article key={m.id} className="item-card">
                    <div className="item-meta">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <span className="item-author">Mentor: {m.mentor_name}</span>
                        {m.status === 'completed' ? (
                          <span className="status-badge status-badge-encerrado">● Encerrado</span>
                        ) : m.first_response_at ? (
                          <span className="status-badge status-badge-andamento">● Em andamento</span>
                        ) : (
                          <span className="status-badge status-badge-conectado">● Mentor conectado</span>
                        )}
                      </div>
                      {m.similarity_score !== undefined && m.similarity_score !== null && (
                        <span className="affinity-badge">
                          {formatAffinity(m.similarity_score)}
                        </span>
                      )}
                    </div>
                    <p className="item-description">{m.problem_description}</p>
                    <div className="item-actions">
                      {m.status === 'active' ? (
                        <>
                          <button
                            type="button"
                            className="btn-primary"
                            onClick={() => onSelectMatch(m)}
                          >
                            Abrir Chat
                          </button>
                          <button
                            type="button"
                            className="btn-outline"
                            onClick={() => onRequestRate(m)}
                          >
                            Finalizar Atendimento
                          </button>
                        </>
                      ) : (
                        <span className="status-badge status-badge-encerrado">
                          Atendimento finalizado
                        </span>
                      )}
                    </div>
                  </article>
                ))}

                {pendingQuestions.map((q) => (
                  <article key={'pending-' + q.id} className="item-card pending-card">
                    <div className="item-meta">
                      <span className="item-author">Dúvida #{q.id}</span>
                      {q.status === 'resolved' ? (
                        <span className="status-badge status-badge-encerrado">● Encerrado</span>
                      ) : (
                        <span className="status-badge status-badge-pending">● Aguardando mentor</span>
                      )}
                    </div>
                    <p className="item-description">{q.problem_description}</p>
                    <div className="item-meta" style={{ marginTop: '0.25rem' }}>
                      <span className="item-contact">Pareamento por IA ativo no campus</span>
                    </div>
                  </article>
                ))}
              </>
            )
          ) : mentorMatches.length === 0 ? (
            <p className="empty-state">
              {isMentor
                ? 'Você não possui atendimentos ativos como mentor no momento.'
                : 'Você ainda não é mentor. Ative o modo mentor no perfil para ajudar colegas!'}
            </p>
          ) : (
            mentorMatches.map((m) => (
              <article key={m.id} className="item-card">
                <div className="item-meta">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <span className="item-author">Aluno: {m.student_name}</span>
                    {m.status === 'completed' ? (
                      <span className="status-badge status-badge-encerrado">● Encerrado</span>
                    ) : m.first_response_at ? (
                      <span className="status-badge status-badge-andamento">● Em andamento</span>
                    ) : (
                      <span className="status-badge status-badge-conectado">● Mentor conectado</span>
                    )}
                  </div>
                  {m.similarity_score !== undefined && m.similarity_score !== null && (
                    <span className="affinity-badge">
                      {formatAffinity(m.similarity_score)}
                    </span>
                  )}
                </div>
                <p className="item-description">{m.problem_description}</p>
                <div className="item-actions">
                  {m.status === 'active' ? (
                    <button
                      type="button"
                      className="btn-primary"
                      onClick={() => onSelectMatch(m)}
                    >
                      Abrir Chat
                    </button>
                  ) : (
                    <span className="status-badge status-badge-encerrado">
                      Atendimento finalizado
                    </span>
                  )}
                </div>
              </article>
            ))
          )}
        </div>
      </section>

      {subtab === 'mentorias' && isMentor && openQuestions.length > 0 && (
        <section className="dashboard-card" style={{ marginTop: '1.5rem' }}>
          <header className="card-header">
            <h2>Dúvidas Abertas no Campus</h2>
            <p>Dúvidas de calouros e colegas aguardando um mentor voluntário.</p>
          </header>
          <div className="card-list">
            {openQuestions.map((q) => (
              <article key={q.id} className="item-card">
                <div className="item-meta">
                  <span className="item-author">{q.student_name}</span>
                  <span className="item-course">{q.course}</span>
                </div>
                <p className="item-description">{q.problem_description}</p>
                <div className="item-actions">
                  <button
                    type="button"
                    className="btn-primary"
                    onClick={() => onAcceptQuestion && onAcceptQuestion(q.id)}
                  >
                    Aceitar Dúvida
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
