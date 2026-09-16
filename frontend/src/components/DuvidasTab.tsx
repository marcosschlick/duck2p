import { useState, useRef, useEffect } from 'react'
import type { MatchDetail, MessageItem, QuestionItem } from '../types'
import type { Message } from '../types/chat'
import { ChatPanel } from './Chat/ChatPanel'
import { DuckScene } from './DuckScene/DuckScene'
import logoIcon from '../assets/logo_03.svg'

interface DuvidasTabProps {
  activeMatch: MatchDetail | null
  pendingQuestion: QuestionItem | null
  messages: MessageItem[]
  onSendMessage: (content: string) => Promise<void>
  onCreateQuestion: (problemDescription: string) => Promise<void>
  onRequestRate: (match: MatchDetail) => void
  onNewQuestion: () => void
}

const INITIAL_MESSAGES: Message[] = [
  {
    id: 'welcome-msg',
    sender: 'assistant',
    text: 'Olá! Sou o Duck2P, seu pato de depuração no IFSUL.\n\nConte-me o que você está tentando programar, qual erro apareceu ou onde você travou. Explicar o código em voz alta já é o primeiro passo para encontrar o bug!',
    timestamp: 'Agora',
  },
]

function formatAffinity(score?: number | null): string {
  if (score === null || score === undefined) return ''
  const percent = Math.round(score * 100)
  return `${percent}% Afinidade`
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

export function DuvidasTab({
  activeMatch,
  pendingQuestion,
  messages,
  onSendMessage,
  onCreateQuestion,
  onRequestRate,
  onNewQuestion,
}: DuvidasTabProps) {
  const [initialMessages, setInitialMessages] = useState<Message[]>(INITIAL_MESSAGES)
  const [isThinking, setIsThinking] = useState(false)
  const [messageInput, setMessageInput] = useState('')
  const chatEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleCreate = async (text: string) => {
    setIsThinking(true)
    try {
      await onCreateQuestion(text)
    } finally {
      setIsThinking(false)
    }
  }

  const handleSendActiveMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!messageInput.trim()) return
    const text = messageInput.trim()
    setMessageInput('')
    await onSendMessage(text)
  }

  const handleResetChat = () => {
    setInitialMessages(INITIAL_MESSAGES)
    setIsThinking(false)
    onNewQuestion()
  }

  if (activeMatch) {
    return (
      <div className="duvidas-layout">
        <div className="duvidas-chat-column">
          <section className="chat-container">
            <header className="chat-header">
              <div className="chat-header-info">
                <div className="chat-title-group">
                  <div className="chat-avatar" aria-hidden="true">
                    <img src={logoIcon} alt="Duck2P" className="chat-avatar-img" />
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                      <h2>Mentor: {activeMatch.mentor_name}</h2>
                      {activeMatch.status === 'completed' ? (
                        <span className="status-badge status-badge-encerrado">● Encerrado</span>
                      ) : activeMatch.first_response_at ? (
                        <span className="status-badge status-badge-andamento">● Em andamento</span>
                      ) : (
                        <span className="status-badge status-badge-conectado">● Mentor conectado</span>
                      )}
                      {activeMatch.similarity_score !== undefined &&
                        activeMatch.similarity_score !== null && (
                          <span className="affinity-badge">
                            {formatAffinity(activeMatch.similarity_score)}
                          </span>
                        )}
                    </div>
                    <p className="chat-contact">Atendimento #{activeMatch.id}</p>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <button
                  type="button"
                  className="btn-outline"
                  style={{ padding: '0.45rem 0.85rem', fontSize: '0.825rem' }}
                  onClick={onNewQuestion}
                >
                  + Nova Dúvida
                </button>
                {activeMatch.status === 'active' && (
                  <button
                    type="button"
                    className="btn-primary btn-complete"
                    onClick={() => onRequestRate(activeMatch)}
                  >
                    Finalizar Atendimento
                  </button>
                )}
              </div>
            </header>

            <div className="chat-question-banner">
              <strong>Dúvida do Aluno:</strong> {activeMatch.problem_description}
            </div>

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
                        {isDuckBot && (
                          <img
                            src={logoIcon}
                            alt="Duck2P"
                            style={{
                              width: 16,
                              height: 16,
                              objectFit: 'contain',
                              verticalAlign: 'middle',
                              marginRight: 4,
                            }}
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

            {activeMatch.status === 'completed' ? (
              <div className="chat-completed-notice">
                <span>● Este atendimento foi encerrado e concluído.</span>
              </div>
            ) : (
              <form className="chat-form" onSubmit={handleSendActiveMessage}>
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
            )}
          </section>
        </div>

        <aside className="duvidas-mascot-column">
          <div className="duvidas-scene-wrap">
            <DuckScene />
          </div>
        </aside>
      </div>
    )
  }

  if (pendingQuestion) {
    return (
      <div className="duvidas-layout">
        <div className="duvidas-chat-column">
          <section className="chat-container">
            <header className="chat-header">
              <div className="chat-header-info">
                <div className="chat-title-group">
                  <div className="chat-avatar" aria-hidden="true">
                    <img src={logoIcon} alt="Duck2P" className="chat-avatar-img" />
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <h2>Dúvida #{pendingQuestion.id}</h2>
                      <span className="status-badge-pending">● Aguardando mentor</span>
                    </div>
                    <p className="chat-contact">Pareamento por IA ativo no campus</p>
                  </div>
                </div>
              </div>

              <button
                type="button"
                className="btn-outline"
                style={{ padding: '0.45rem 0.85rem', fontSize: '0.825rem' }}
                onClick={onNewQuestion}
              >
                + Nova Dúvida
              </button>
            </header>

            <div className="chat-question-banner">
              <strong>Sua Dúvida:</strong> {pendingQuestion.problem_description}
            </div>

            <div className="chat-messages">
              <div className="message-bubble message-duckbot">
                <span className="message-sender">
                  <img
                    src={logoIcon}
                    alt="Duck2P"
                    style={{
                      width: 16,
                      height: 16,
                      objectFit: 'contain',
                      verticalAlign: 'middle',
                      marginRight: 4,
                    }}
                  />
                  Duck Bot
                </span>
                <p className="message-text">
                  Quack! Já recebi e processei sua dúvida. Enquanto você revisa o código com o pato, o sistema está buscando um mentor voluntário no campus com as habilidades necessárias.
                  {'\n\n'}
                  Assim que um mentor aceitar, a conversa será liberada automaticamente aqui nesta tela!
                </p>
                {pendingQuestion.created_at && (
                  <span className="message-time">
                    {formatTime(pendingQuestion.created_at)}
                  </span>
                )}
              </div>
            </div>

            <div className="chat-form" style={{ opacity: 0.7 }}>
              <input
                type="text"
                disabled
                placeholder="Aguardando aceite de um mentor para liberar o chat em tempo real..."
                style={{ cursor: 'not-allowed', backgroundColor: 'var(--color-bg)' }}
              />
            </div>
          </section>
        </div>

        <aside className="duvidas-mascot-column">
          <div className="duvidas-scene-wrap">
            <DuckScene isThinking={true} />
          </div>
        </aside>
      </div>
    )
  }

  return (
    <div className="duvidas-layout">
      <div className="duvidas-chat-column">
        <ChatPanel
          messages={initialMessages}
          isThinking={isThinking}
          onSendMessage={handleCreate}
          onResetChat={handleResetChat}
        />
      </div>

      <div className="duvidas-mascot-column">
        <div className="duvidas-scene-wrap">
          <DuckScene isThinking={isThinking} />
        </div>
      </div>
    </div>
  )
}
