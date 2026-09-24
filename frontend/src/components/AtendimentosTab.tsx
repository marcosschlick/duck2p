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

function AtendimentoMessageBubble({
  msg,
  isDuckBot,
  formatTimeFn,
}: {
  msg: MessageItem
  isDuckBot: boolean
  formatTimeFn: (t?: string | null) => string
}) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(msg.content)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      return
    }
  }

  const roleLabel = isDuckBot ? 'Duck Bot' : msg.is_mine ? 'Você' : msg.sender_name

  return (
    <div
      className={
        'atendimento-msg-row ' +
        (isDuckBot ? 'assistant' : msg.is_mine ? 'student' : 'peer')
      }
      role="listitem"
    >
      {!msg.is_mine && (
        <div className="atendimento-msg-avatar" aria-hidden="true">
          {isDuckBot ? (
            <img src={logoIcon} alt="Duck2P" className="atendimento-avatar-img" />
          ) : (
            <span className="atendimento-avatar-letter">
              {msg.sender_name.charAt(0).toUpperCase()}
            </span>
          )}
        </div>
      )}

      <div className="atendimento-bubble-wrapper">
        <div className="atendimento-msg-meta">
          <strong className="atendimento-sender-name">{roleLabel}</strong>
          {isDuckBot && <span className="atendimento-meta-badge">IA</span>}
          {msg.created_at && (
            <span className="atendimento-meta-time">{formatTimeFn(msg.created_at)}</span>
          )}
        </div>

        <div
          className={
            'message-bubble ' +
            (isDuckBot ? 'message-duckbot' : msg.is_mine ? 'message-mine' : 'message-other')
          }
        >
          <div className="message-text">{msg.content}</div>
          <div className="message-bubble-actions">
            <button
              type="button"
              className="chat-copy-btn"
              onClick={handleCopy}
              aria-label="Copiar texto"
              title="Copiar mensagem"
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
        </div>
      </div>
    </div>
  )
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
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)

  useEffect(() => {
    if (selectedMatch && chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, selectedMatch])

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!messageInput.trim()) return
    const text = messageInput.trim()
    setMessageInput('')
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
    await onSendMessage(text)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessageInput(e.target.value)
    e.target.style.height = 'auto'
    e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`
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
                    className="chat-back-btn"
                    onClick={() => onSelectMatch(null)}
                    aria-label="Voltar para a lista de atendimentos"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <line x1="19" y1="12" x2="5" y2="12" />
                      <polyline points="12 19 5 12 12 5" />
                    </svg>
                    <span>Voltar</span>
                  </button>

                  <div className="chat-peer-avatar-wrapper">
                    <div className="chat-peer-avatar">
                      {isStudent
                        ? selectedMatch.mentor_name.charAt(0).toUpperCase()
                        : selectedMatch.student_name.charAt(0).toUpperCase()}
                    </div>
                    <span className="avatar-online-dot" />
                  </div>

                  <div className="chat-header-text">
                    <div className="chat-header-title-row">
                      <h2 className="chat-header-title">
                        {isStudent
                          ? selectedMatch.mentor_name
                          : selectedMatch.student_name}
                      </h2>
                      <span className="chat-peer-role-badge">
                        {isStudent ? 'Mentor IFSUL' : 'Aluno IFSUL'}
                      </span>
                      {selectedMatch.first_response_at ? (
                        <span className="status-badge status-badge-andamento">
                          <span className="status-dot-pulse" /> Em andamento
                        </span>
                      ) : (
                        <span className="status-badge status-badge-conectado">
                          <span className="status-dot-pulse connected" /> Conectado
                        </span>
                      )}
                      {selectedMatch.similarity_score !== undefined &&
                        selectedMatch.similarity_score !== null && (
                          <span className="affinity-badge">
                            {formatAffinity(selectedMatch.similarity_score)}
                          </span>
                        )}
                    </div>
                    <span className="chat-header-subtitle">
                      Sessão #{selectedMatch.id} • Dúvida acadêmica vinculada
                    </span>
                  </div>
                </div>

                {isStudent && selectedMatch.status === 'active' && (
                  <button
                    type="button"
                    className="btn-complete-atendimento"
                    onClick={() => onRequestRate(selectedMatch)}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span>Finalizar Atendimento</span>
                  </button>
                )}
              </header>

              <div className="chat-question-card">
                <div className="chat-question-header">
                  <span className="question-tag">Dúvida Registrada</span>
                  <span className="question-id">#{selectedMatch.question_id}</span>
                </div>
                <p className="chat-question-text">{selectedMatch.problem_description}</p>
              </div>

              <div className="chat-messages" role="list" aria-label="Mensagens do atendimento">
                {visibleMessages.length === 0 ? (
                  <p className="empty-state">Nenhuma mensagem ainda. Inicie o diálogo de suporte!</p>
                ) : (
                  visibleMessages.map((msg) => {
                    const isDuckBot = msg.sender_name === 'Duck Bot' || msg.sender_id === null
                    return (
                      <AtendimentoMessageBubble
                        key={msg.id}
                        msg={msg}
                        isDuckBot={isDuckBot}
                        formatTimeFn={formatTime}
                      />
                    )
                  })
                )}
                <div ref={chatEndRef} aria-hidden="true" />
              </div>

              <div className="chat-composer-area">
                <form className="chat-composer-card" onSubmit={handleSend}>
                  <textarea
                    ref={textareaRef}
                    rows={2}
                    maxLength={2000}
                    className="chat-composer-textarea"
                    placeholder="Digite sua mensagem de suporte (Shift+Enter para nova linha)..."
                    value={messageInput}
                    onChange={handleChange}
                    onKeyDown={handleKeyDown}
                    aria-label="Mensagem de suporte"
                  />

                  <div className="chat-composer-toolbar">
                    <div className="composer-toolbar-left">
                      <span className="composer-tip-badge">
                        ✦ Chat em tempo real IFSUL
                      </span>
                    </div>

                    <div className="composer-toolbar-right">
                      <span className="composer-char-count">
                        {messageInput.length}/2000
                      </span>
                      <kbd className="composer-kbd">↵ Enter</kbd>
                      <button
                        type="submit"
                        className="composer-send-btn"
                        disabled={!messageInput.trim()}
                        aria-label="Enviar mensagem"
                        title="Enviar mensagem"
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
              </div>
            </section>
          </div>

          <aside className="duck-scene-column">
            <div className="duck-3d-wrapper">
              <DuckScene />
            </div>

            {isMentorUser && selectedMatch.ai_briefing ? (
              <div className="chat-briefing-card">
                <div className="briefing-header">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="16" x2="12" y2="12" />
                    <line x1="12" y1="8" x2="12.01" y2="8" />
                  </svg>
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
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
                        <span className="mentor-cell-avatar">
                          {m.mentor_name.charAt(0).toUpperCase()}
                        </span>
                        <span className="item-author">Mentor: {m.mentor_name}</span>
                        {m.status === 'completed' ? (
                          <span className="status-badge status-badge-encerrado">Encerrado</span>
                        ) : m.first_response_at ? (
                          <span className="status-badge status-badge-andamento">
                            <span className="status-dot-pulse" /> Em andamento
                          </span>
                        ) : (
                          <span className="status-badge status-badge-conectado">
                            <span className="status-dot-pulse connected" /> Mentor conectado
                          </span>
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
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
                        <span className="mentor-cell-avatar" style={{ background: '#fef3c7', color: '#b45309' }}>
                          #
                        </span>
                        <span className="item-author">Dúvida #{q.id}</span>
                      </div>
                      {q.status === 'resolved' ? (
                        <span className="status-badge status-badge-encerrado">Encerrado</span>
                      ) : (
                        <span className="status-badge status-badge-pending">
                          <span className="status-dot-pulse pending" /> Aguardando mentor
                        </span>
                      )}
                    </div>
                    <p className="item-description">{q.problem_description}</p>
                    <div className="item-meta" style={{ marginTop: '0.25rem' }}>
                      <span className="item-contact">Pareamento semântico por IA ativo no campus</span>
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
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
                    <span className="mentor-cell-avatar">
                      {m.student_name.charAt(0).toUpperCase()}
                    </span>
                    <span className="item-author">Aluno: {m.student_name}</span>
                    {m.status === 'completed' ? (
                      <span className="status-badge status-badge-encerrado">Encerrado</span>
                    ) : m.first_response_at ? (
                      <span className="status-badge status-badge-andamento">
                        <span className="status-dot-pulse" /> Em andamento
                      </span>
                    ) : (
                      <span className="status-badge status-badge-conectado">
                        <span className="status-dot-pulse connected" /> Mentor conectado
                      </span>
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
