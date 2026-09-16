import { useState, useEffect, useRef, useTransition, useCallback } from 'react'
import './App.css'

type Screen = 'login' | 'register' | 'home'
type Tab = 'duvidas' | 'atendimentos' | 'mentoria'

interface RegisterForm {
  full_name: string
  email: string
  student_id: string
  course: string
  password: string
}

interface LoginForm {
  email: string
  password: string
}

interface DecodedToken {
  sub: string
  email: string
}

interface MentorProfile {
  user_id: number
  contact: string
  skills: string
  is_available: boolean
  points: number
  level: number
  mentorships_completed: number
  average_rating: number
  status: string
  approved_by: number | null
}

interface MentorStatus {
  is_mentor: boolean
  status: string
  profile: MentorProfile | null
}

interface MentorApplication {
  user_id: number
  full_name: string
  email: string
  student_id: string
  course: string
  contact: string
  skills: string
  status: string
}

interface QuestionOpen {
  id: number
  student_id: number
  student_name: string
  course: string
  problem_description: string
  status: string
  created_at: string | null
}

interface MatchDetail {
  id: number
  question_id: number
  problem_description: string
  student_id: number
  student_name: string
  mentor_id: number
  mentor_name: string
  mentor_contact: string
  status: string
  first_response_at: string | null
  completed_at: string | null
  created_at: string | null
}

interface MessageItem {
  id: number
  match_id: number
  sender_id: number
  sender_name: string
  content: string
  created_at: string | null
  is_mine: boolean
}

const API_BASE_URL = 'http://localhost:8000'

function getDecodedToken(): DecodedToken | null {
  const token = localStorage.getItem('access_token')
  if (!token) return null
  try {
    const parts = token.split('.')
    if (parts.length < 2) return null
    const payloadBase64 = parts[1].replace(/-/g, '+').replace(/_/g, '/')
    return JSON.parse(atob(payloadBase64)) as DecodedToken
  } catch {
    return null
  }
}

function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem('access_token')
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

function App() {
  const [screen, setScreen] = useState<Screen>(() => {
    return localStorage.getItem('access_token') ? 'home' : 'login'
  })

  const [registerData, setRegisterData] = useState<RegisterForm>({
    full_name: '',
    email: '',
    student_id: '',
    course: '',
    password: '',
  })

  const [loginData, setLoginData] = useState<LoginForm>({
    email: '',
    password: '',
  })
  const [confirmPassword, setConfirmPassword] = useState<string>('')

  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const [activeTab, setActiveTab] = useState<Tab>('duvidas')
  const [, startTransition] = useTransition()
  const [mentorStatus, setMentorStatus] = useState<MentorStatus | null>(null)
  const [activeMatches, setActiveMatches] = useState<MatchDetail[]>([])
  const [selectedMatch, setSelectedMatch] = useState<MatchDetail | null>(null)
  const [messages, setMessages] = useState<MessageItem[]>([])
  const [messageInput, setMessageInput] = useState<string>('')
  const [openQuestions, setOpenQuestions] = useState<QuestionOpen[]>([])
  const [questionDescription, setQuestionDescription] = useState<string>('')
  const [mentorApplications, setMentorApplications] = useState<MentorApplication[]>([])
  const [applyContact, setApplyContact] = useState<string>('')
  const [applySkills, setApplySkills] = useState<string>('')

  const [ratingModalMatch, setRatingModalMatch] = useState<MatchDetail | null>(null)
  const [ratingScore, setRatingScore] = useState<number>(5)
  const [ratingWasResolved, setRatingWasResolved] = useState<boolean>(true)
  const [ratingComment, setRatingComment] = useState<string>('')

  const chatEndRef = useRef<HTMLDivElement | null>(null)
  const currentDecoded = getDecodedToken()
  const currentUserId = currentDecoded ? parseInt(currentDecoded.sub, 10) : null

  const clearFeedback = () => {
    setErrorMessage(null)
    setSuccessMessage(null)
  }

  const navigateTo = useCallback((targetScreen: Screen) => {
    clearFeedback()
    setScreen(targetScreen)
  }, [])

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    clearFeedback()

    if (
      !registerData.full_name ||
      !registerData.email ||
      !registerData.student_id ||
      !registerData.course ||
      !registerData.password ||
      !confirmPassword
    ) {
      setErrorMessage('Por favor, preencha todos os campos.')
      return
    }

    if (registerData.password !== confirmPassword) {
      setErrorMessage('As senhas não coincidem.')
      return
    }

    const hasMinLen = registerData.password.length >= 8
    const hasUpper = /[A-Z]/.test(registerData.password)
    const hasLower = /[a-z]/.test(registerData.password)
    const hasNumber = /[0-9]/.test(registerData.password)
    const hasSymbol = /[^A-Za-z0-9]/.test(registerData.password)

    if (!hasMinLen || !hasUpper || !hasLower || !hasNumber || !hasSymbol) {
      setErrorMessage(
        'A senha deve ter no mínimo 8 caracteres, com letra maiúscula, minúscula, número e símbolo.'
      )
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registerData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.detail || 'Erro ao realizar cadastro.')
      }

      setSuccessMessage('Cadastro realizado com sucesso! Faça seu login.')
      setRegisterData({
        full_name: '',
        email: '',
        student_id: '',
        course: '',
        password: '',
      })
      setConfirmPassword('')
      setScreen('login')
    } catch (err: unknown) {
      setErrorMessage(
        err instanceof Error ? err.message : 'Falha na comunicação com o servidor.'
      )
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    clearFeedback()

    if (!loginData.email || !loginData.password) {
      setErrorMessage('Por favor, informe e-mail e senha.')
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.detail || 'E-mail ou senha incorretos.')
      }

      localStorage.setItem('access_token', data.access_token)
      setLoginData({ email: '', password: '' })
      setScreen('home')
    } catch (err: unknown) {
      setErrorMessage(
        err instanceof Error ? err.message : 'Falha na comunicação com o servidor.'
      )
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = useCallback(() => {
    localStorage.removeItem('access_token')
    setMentorStatus(null)
    setActiveMatches([])
    setSelectedMatch(null)
    setMessages([])
    setOpenQuestions([])
    setMentorApplications([])
    navigateTo('login')
  }, [navigateTo])

  const fetchMentorStatus = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/mentors/me`, {
        headers: getAuthHeaders(),
      })
      if (response.status === 401) {
        handleLogout()
        return
      }
      if (response.ok) {
        const data = await response.json()
        setMentorStatus(data)
      }
    } catch {
      return
    }
  }, [handleLogout])

  const fetchActiveMatches = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/matches/my-active`, {
        headers: getAuthHeaders(),
      })
      if (response.status === 401) {
        handleLogout()
        return
      }
      if (response.ok) {
        const data = await response.json()
        setActiveMatches(data)
      }
    } catch {
      return
    }
  }, [handleLogout])

  const fetchOpenQuestions = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/questions/open`, {
        headers: getAuthHeaders(),
      })
      if (response.status === 401) {
        handleLogout()
        return
      }
      if (response.ok) {
        const data = await response.json()
        setOpenQuestions(data)
      }
    } catch {
      return
    }
  }, [handleLogout])

  const fetchMentorApplications = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/mentors/applications`, {
        headers: getAuthHeaders(),
      })
      if (response.status === 401) {
        handleLogout()
        return
      }
      if (response.ok) {
        const data = await response.json()
        setMentorApplications(data)
      }
    } catch {
      return
    }
  }, [handleLogout])

  const fetchMessages = useCallback(async (matchId: number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/matches/${matchId}/messages`, {
        headers: getAuthHeaders(),
      })
      if (response.status === 401) {
        handleLogout()
        return
      }
      if (response.ok) {
        const data = await response.json()
        setMessages(data)
      }
    } catch {
      return
    }
  }, [handleLogout])

  useEffect(() => {
    if (screen !== 'home') return
    const timer = setTimeout(() => {
      void fetchMentorStatus()
      void fetchActiveMatches()
    }, 0)
    return () => clearTimeout(timer)
  }, [screen, fetchMentorStatus, fetchActiveMatches])

  useEffect(() => {
    if (screen !== 'home' || !mentorStatus?.is_mentor) return
    const timer = setTimeout(() => {
      void fetchOpenQuestions()
      void fetchMentorApplications()
    }, 0)
    return () => clearTimeout(timer)
  }, [screen, mentorStatus?.is_mentor, fetchOpenQuestions, fetchMentorApplications])

  useEffect(() => {
    if (!selectedMatch) return
    const timer = setTimeout(() => {
      void fetchMessages(selectedMatch.id)
    }, 0)
    const interval = setInterval(() => {
      void fetchMessages(selectedMatch.id)
    }, 3000)
    return () => {
      clearTimeout(timer)
      clearInterval(interval)
    }
  }, [selectedMatch, fetchMessages])

  useEffect(() => {
    if (selectedMatch && chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, selectedMatch])

  const handleCreateQuestion = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    clearFeedback()

    if (questionDescription.trim().length < 10) {
      setErrorMessage('A descrição da dúvida deve ter no mínimo 10 caracteres.')
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/questions`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ problem_description: questionDescription.trim() }),
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.detail || 'Erro ao enviar dúvida.')
      }

      setSuccessMessage('Dúvida publicada com sucesso! Aguarde um mentor aceitar.')
      setQuestionDescription('')
      if (mentorStatus?.is_mentor) {
        fetchOpenQuestions()
      }
    } catch (err: unknown) {
      setErrorMessage(
        err instanceof Error ? err.message : 'Falha na comunicação com o servidor.'
      )
    } finally {
      setIsLoading(false)
    }
  }

  const handleAcceptQuestion = async (questionId: number) => {
    clearFeedback()
    setIsLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/questions/${questionId}/accept`, {
        method: 'POST',
        headers: getAuthHeaders(),
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.detail || 'Erro ao aceitar dúvida.')
      }

      await fetchOpenQuestions()
      await fetchActiveMatches()

      const matchDetailRes = await fetch(`${API_BASE_URL}/matches/${data.id}`, {
        headers: getAuthHeaders(),
      })

      if (matchDetailRes.ok) {
        const detailData = await matchDetailRes.json()
        setSelectedMatch(detailData)
      }
      startTransition(() => {
        setActiveTab('atendimentos')
      })
      setSuccessMessage('Dúvida aceita! Sala de atendimento iniciada.')
    } catch (err: unknown) {
      setErrorMessage(
        err instanceof Error ? err.message : 'Falha na comunicação com o servidor.'
      )
    } finally {
      setIsLoading(false)
    }
  }

  const handleSendMessage = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!selectedMatch || !messageInput.trim()) return

    const content = messageInput.trim()
    setMessageInput('')

    try {
      const response = await fetch(
        `${API_BASE_URL}/matches/${selectedMatch.id}/messages`,
        {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify({ content }),
        }
      )

      if (response.ok) {
        await fetchMessages(selectedMatch.id)
      } else {
        const data = await response.json()
        setErrorMessage(data.detail || 'Erro ao enviar mensagem.')
      }
    } catch {
      setErrorMessage('Falha ao enviar mensagem.')
    }
  }

  const handleApplyMentor = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    clearFeedback()

    if (!applyContact.trim() || !applySkills.trim()) {
      setErrorMessage('Preencha seu contato e habilidades.')
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/mentors/apply`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          contact: applyContact.trim(),
          skills: applySkills.trim(),
        }),
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.detail || 'Erro ao submeter candidatura.')
      }

      setSuccessMessage(
        data.status === 'approved'
          ? 'Parabéns! Você é o primeiro mentor e foi aprovado automaticamente!'
          : 'Candidatura enviada com sucesso! Aguarde a avaliação de um mentor.'
      )
      setApplyContact('')
      setApplySkills('')
      await fetchMentorStatus()
    } catch (err: unknown) {
      setErrorMessage(
        err instanceof Error ? err.message : 'Falha na comunicação com o servidor.'
      )
    } finally {
      setIsLoading(false)
    }
  }

  const handleReviewApplication = async (
    targetUserId: number,
    action: 'approve' | 'reject'
  ) => {
    clearFeedback()
    setIsLoading(true)
    try {
      const response = await fetch(
        `${API_BASE_URL}/mentors/applications/${targetUserId}/${action}`,
        {
          method: 'PATCH',
          headers: getAuthHeaders(),
        }
      )

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.detail || 'Erro ao avaliar candidatura.')
      }

      setSuccessMessage(
        action === 'approve'
          ? 'Candidatura aprovada com sucesso!'
          : 'Candidatura rejeitada com sucesso.'
      )
      await fetchMentorApplications()
    } catch (err: unknown) {
      setErrorMessage(
        err instanceof Error ? err.message : 'Falha na comunicação com o servidor.'
      )
    } finally {
      setIsLoading(false)
    }
  }

  const handleRateMatch = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!ratingModalMatch) return
    clearFeedback()

    setIsLoading(true)
    try {
      const response = await fetch(
        `${API_BASE_URL}/matches/${ratingModalMatch.id}/rate`,
        {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify({
            score: ratingScore,
            was_resolved: ratingWasResolved,
            comment: ratingComment.trim() || null,
          }),
        }
      )

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.detail || 'Erro ao registrar avaliação.')
      }

      setSuccessMessage('Avaliação registrada com sucesso! Atendimento concluído.')
      setRatingModalMatch(null)
      setSelectedMatch(null)
      setRatingScore(5)
      setRatingWasResolved(true)
      setRatingComment('')
      await fetchActiveMatches()
      await fetchMentorStatus()
    } catch (err: unknown) {
      setErrorMessage(
        err instanceof Error ? err.message : 'Falha na comunicação com o servidor.'
      )
    } finally {
      setIsLoading(false)
    }
  }

  if (screen === 'home') {
    const isApprovedMentor = Boolean(mentorStatus?.is_mentor)

    return (
      <div className="app-layout">
        <header className="app-header">
          <div className="brand-group">
            <span className="brand-logo">duck2p</span>
            <span className="brand-tagline">Rubber duck debugging colaborativo</span>
          </div>

          <div className="header-actions">
            <div className="user-status-badge">
              {isApprovedMentor ? (
                <span>
                  Mentor • Nível {mentorStatus?.profile?.level ?? 1} •{' '}
                  {mentorStatus?.profile?.average_rating !== undefined
                    ? mentorStatus.profile.average_rating.toFixed(1)
                    : '5.0'}{' '}
                  ★
                </span>
              ) : mentorStatus?.status === 'pending' ? (
                <span>Aluno • Candidatura a mentor pendente</span>
              ) : (
                <span>Aluno</span>
              )}
            </div>

            <button type="button" className="btn-outline" onClick={handleLogout}>
              Sair
            </button>
          </div>
        </header>

        <nav className="app-nav">
          <button
            type="button"
            className={`nav-tab ${activeTab === 'duvidas' ? 'active' : ''}`}
            onClick={() => {
              clearFeedback()
              startTransition(() => {
                setActiveTab('duvidas')
              })
            }}
          >
            Dúvidas
          </button>
          <button
            type="button"
            className={`nav-tab ${activeTab === 'atendimentos' ? 'active' : ''}`}
            onClick={() => {
              clearFeedback()
              fetchActiveMatches()
              startTransition(() => {
                setActiveTab('atendimentos')
              })
            }}
          >
            Meus Atendimentos{' '}
            {activeMatches.length > 0 && (
              <span className="tab-count">{activeMatches.length}</span>
            )}
          </button>
          <button
            type="button"
            className={`nav-tab ${activeTab === 'mentoria' ? 'active' : ''}`}
            onClick={() => {
              clearFeedback()
              fetchMentorStatus()
              if (isApprovedMentor) {
                fetchMentorApplications()
              }
              startTransition(() => {
                setActiveTab('mentoria')
              })
            }}
          >
            Mentoria
          </button>
        </nav>

        {errorMessage && <div className="alert-message alert-error">{errorMessage}</div>}
        {successMessage && <div className="alert-message alert-success">{successMessage}</div>}

        <main className="app-main">
          {activeTab === 'duvidas' && (
            <div className="tab-grid">
              <section className="dashboard-card">
                <header className="card-header">
                  <h2>Enviar Nova Dúvida</h2>
                  <p>Explique seu problema ou erro de código para receber apoio de um mentor.</p>
                </header>
                <form className="card-form" onSubmit={handleCreateQuestion}>
                  <div className="form-group">
                    <label htmlFor="problem_description">Descrição do Problema</label>
                    <textarea
                      id="problem_description"
                      rows={5}
                      placeholder="Descreva o que você está tentando fazer, o erro encontrado e o que já tentou (mínimo 10 caracteres)..."
                      value={questionDescription}
                      onChange={(e) => setQuestionDescription(e.target.value)}
                      required
                    />
                  </div>
                  <button type="submit" className="btn-primary" disabled={isLoading}>
                    {isLoading ? 'Publicando...' : 'Publicar Dúvida'}
                  </button>
                </form>
              </section>

              {isApprovedMentor && (
                <section className="dashboard-card">
                  <header className="card-header">
                    <h2>Dúvidas Abertas da Comunidade</h2>
                    <p>Dúvidas enviadas por calouros aguardando auxílio de um mentor.</p>
                  </header>
                  <div className="card-list">
                    {openQuestions.length === 0 ? (
                      <p className="empty-state">Nenhuma dúvida aberta no momento.</p>
                    ) : (
                      openQuestions.map((q) => (
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
                              disabled={isLoading}
                              onClick={() => handleAcceptQuestion(q.id)}
                            >
                              Aceitar Dúvida
                            </button>
                          </div>
                        </article>
                      ))
                    )}
                  </div>
                </section>
              )}
            </div>
          )}

          {activeTab === 'atendimentos' && (
            <div className="tab-container">
              {selectedMatch ? (
                <section className="chat-container">
                  <header className="chat-header">
                    <div className="chat-header-info">
                      <button
                        type="button"
                        className="btn-link"
                        onClick={() => setSelectedMatch(null)}
                      >
                        ← Voltar para a lista
                      </button>
                      <h2>
                        {currentUserId === selectedMatch.student_id
                          ? `Mentor: ${selectedMatch.mentor_name}`
                          : `Aluno: ${selectedMatch.student_name}`}
                      </h2>
                      <p className="chat-contact">
                        {currentUserId === selectedMatch.student_id
                          ? `Contato do Mentor: ${selectedMatch.mentor_contact}`
                          : `Atendimento #${selectedMatch.id}`}
                      </p>
                    </div>

                    {currentUserId === selectedMatch.student_id && (
                      <button
                        type="button"
                        className="btn-primary btn-complete"
                        onClick={() => setRatingModalMatch(selectedMatch)}
                      >
                        Concluir e Avaliar
                      </button>
                    )}
                  </header>

                  <div className="chat-question-banner">
                    <strong>Dúvida:</strong> {selectedMatch.problem_description}
                  </div>

                  <div className="chat-messages">
                    {messages.length === 0 ? (
                      <p className="empty-state">Nenhuma mensagem ainda. Inicie o diálogo!</p>
                    ) : (
                      messages.map((msg) => (
                        <div
                          key={msg.id}
                          className={`message-bubble ${
                            msg.is_mine ? 'message-mine' : 'message-other'
                          }`}
                        >
                          <span className="message-sender">{msg.sender_name}</span>
                          <p className="message-text">{msg.content}</p>
                        </div>
                      ))
                    )}
                    <div ref={chatEndRef} />
                  </div>

                  <form className="chat-form" onSubmit={handleSendMessage}>
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
              ) : (
                <section className="dashboard-card">
                  <header className="card-header">
                    <h2>Meus Atendimentos Ativos</h2>
                    <p>Sessões de mentoria em andamento para resolução de problemas.</p>
                  </header>
                  <div className="card-list">
                    {activeMatches.length === 0 ? (
                      <p className="empty-state">
                        Você não possui nenhum atendimento ativo no momento.
                      </p>
                    ) : (
                      activeMatches.map((m) => (
                        <article key={m.id} className="item-card">
                          <div className="item-meta">
                            <span className="item-author">
                              {currentUserId === m.student_id
                                ? `Mentor: ${m.mentor_name}`
                                : `Aluno: ${m.student_name}`}
                            </span>
                            {currentUserId === m.student_id && (
                              <span className="item-contact">
                                Contato: {m.mentor_contact}
                              </span>
                            )}
                          </div>
                          <p className="item-description">{m.problem_description}</p>
                          <div className="item-actions">
                            <button
                              type="button"
                              className="btn-primary"
                              onClick={() => setSelectedMatch(m)}
                            >
                              Abrir Chat
                            </button>
                            {currentUserId === m.student_id && (
                              <button
                                type="button"
                                className="btn-outline"
                                onClick={() => setRatingModalMatch(m)}
                              >
                                Concluir e Avaliar
                              </button>
                            )}
                          </div>
                        </article>
                      ))
                    )}
                  </div>
                </section>
              )}
            </div>
          )}

          {activeTab === 'mentoria' && (
            <div className="tab-container">
              {isApprovedMentor ? (
                <div className="tab-grid">
                  <section className="dashboard-card">
                    <header className="card-header">
                      <h2>Meu Desempenho como Mentor</h2>
                      <p>Métricas e gamificação da sua contribuição na comunidade duck2p.</p>
                    </header>
                    <div className="metrics-grid">
                      <div className="metric-box">
                        <span className="metric-value">
                          {mentorStatus?.profile?.level ?? 1}
                        </span>
                        <span className="metric-label">Nível</span>
                      </div>
                      <div className="metric-box">
                        <span className="metric-value">
                          {mentorStatus?.profile?.points ?? 0}
                        </span>
                        <span className="metric-label">Pontos</span>
                      </div>
                      <div className="metric-box">
                        <span className="metric-value">
                          {mentorStatus?.profile?.average_rating !== undefined
                            ? mentorStatus.profile.average_rating.toFixed(1)
                            : '5.0'}{' '}
                          ★
                        </span>
                        <span className="metric-label">Média de Avaliação</span>
                      </div>
                      <div className="metric-box">
                        <span className="metric-value">
                          {mentorStatus?.profile?.mentorships_completed ?? 0}
                        </span>
                        <span className="metric-label">Atendimentos Concluídos</span>
                      </div>
                    </div>
                    <div className="profile-details">
                      <p>
                        <strong>Habilidades:</strong> {mentorStatus?.profile?.skills}
                      </p>
                      <p>
                        <strong>Contato de Atendimento:</strong>{' '}
                        {mentorStatus?.profile?.contact}
                      </p>
                    </div>
                  </section>

                  <section className="dashboard-card">
                    <header className="card-header">
                      <h2>Candidaturas de Mentores Pendentes</h2>
                      <p>Avalie novos candidatos para se tornarem mentores voluntários.</p>
                    </header>
                    <div className="card-list">
                      {mentorApplications.length === 0 ? (
                        <p className="empty-state">
                          Nenhuma candidatura pendente de revisão.
                        </p>
                      ) : (
                        mentorApplications.map((app) => (
                          <article key={app.user_id} className="item-card">
                            <div className="item-meta">
                              <span className="item-author">{app.full_name}</span>
                              <span className="item-course">
                                {app.course} • Matrícula {app.student_id}
                              </span>
                            </div>
                            <p className="item-text">
                              <strong>E-mail:</strong> {app.email}
                            </p>
                            <p className="item-text">
                              <strong>Contato:</strong> {app.contact}
                            </p>
                            <p className="item-text">
                              <strong>Habilidades:</strong> {app.skills}
                            </p>
                            <div className="item-actions">
                              <button
                                type="button"
                                className="btn-primary"
                                disabled={isLoading}
                                onClick={() =>
                                  handleReviewApplication(app.user_id, 'approve')
                                }
                              >
                                Aprovar
                              </button>
                              <button
                                type="button"
                                className="btn-outline"
                                disabled={isLoading}
                                onClick={() =>
                                  handleReviewApplication(app.user_id, 'reject')
                                }
                              >
                                Rejeitar
                              </button>
                            </div>
                          </article>
                        ))
                      )}
                    </div>
                  </section>
                </div>
              ) : (
                <section className="dashboard-card form-centered">
                  <header className="card-header">
                    <h2>
                      {mentorStatus?.status === 'pending'
                        ? 'Candidatura em Análise'
                        : 'Quero Ser Mentor duck2p'}
                    </h2>
                    <p>
                      {mentorStatus?.status === 'pending'
                        ? 'Sua solicitação está pendente de aprovação por mentores ativos. Você pode atualizar seus dados abaixo se desejar.'
                        : 'Ajude calouros a superar desafios de código, ganhe pontos e construa sua reputação no campus.'}
                    </p>
                  </header>

                  <form className="card-form" onSubmit={handleApplyMentor}>
                    <div className="form-group">
                      <label htmlFor="mentor_skills">Habilidades e Linguagens</label>
                      <input
                        id="mentor_skills"
                        type="text"
                        placeholder="Ex: Python, React, C++, Algoritmos e Estrutura de Dados"
                        value={applySkills}
                        onChange={(e) => setApplySkills(e.target.value)}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="mentor_contact">Contato para Atendimento</label>
                      <input
                        id="mentor_contact"
                        type="text"
                        placeholder="Ex: Discord: @usuario ou WhatsApp: (11) 99999-9999"
                        value={applyContact}
                        onChange={(e) => setApplyContact(e.target.value)}
                        required
                      />
                    </div>

                    <button type="submit" className="btn-primary" disabled={isLoading}>
                      {isLoading
                        ? 'Enviando...'
                        : mentorStatus?.status === 'pending'
                        ? 'Atualizar Candidatura'
                        : 'Enviar Candidatura'}
                    </button>
                  </form>
                </section>
              )}
            </div>
          )}
        </main>

        {ratingModalMatch && (
          <div className="modal-overlay">
            <div className="modal-dialog">
              <header className="modal-header">
                <h2>Concluir e Avaliar Atendimento</h2>
                <p>
                  Sua avaliação é anônima e reconhece o mentor {ratingModalMatch.mentor_name}.
                </p>
              </header>

              <form className="modal-form" onSubmit={handleRateMatch}>
                <div className="form-group">
                  <label>Nota do Atendimento (1 a 5 estrelas)</label>
                  <div className="rating-stars">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        className={`star-button ${ratingScore >= star ? 'selected' : ''}`}
                        onClick={() => setRatingScore(star)}
                      >
                        ★
                      </button>
                    ))}
                    <span className="rating-label">
                      {ratingScore === 1 && '1 estrela - Insatisfatório'}
                      {ratingScore === 2 && '2 estrelas - Regular'}
                      {ratingScore === 3 && '3 estrelas - Bom'}
                      {ratingScore === 4 && '4 estrelas - Muito Bom'}
                      {ratingScore === 5 && '5 estrelas - Excelente'}
                    </span>
                  </div>
                </div>

                <div className="form-group">
                  <label>A sua dúvida foi resolvida?</label>
                  <div className="toggle-group">
                    <button
                      type="button"
                      className={`toggle-btn ${ratingWasResolved ? 'active' : ''}`}
                      onClick={() => setRatingWasResolved(true)}
                    >
                      Sim
                    </button>
                    <button
                      type="button"
                      className={`toggle-btn ${!ratingWasResolved ? 'active' : ''}`}
                      onClick={() => setRatingWasResolved(false)}
                    >
                      Não
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="rating_comment">Comentário Adicional (Opcional)</label>
                  <textarea
                    id="rating_comment"
                    rows={3}
                    placeholder="Deixe um comentário sobre a mentoria..."
                    value={ratingComment}
                    onChange={(e) => setRatingComment(e.target.value)}
                  />
                </div>

                <div className="modal-actions">
                  <button
                    type="button"
                    className="btn-outline"
                    onClick={() => setRatingModalMatch(null)}
                    disabled={isLoading}
                  >
                    Cancelar
                  </button>
                  <button type="submit" className="btn-primary" disabled={isLoading}>
                    {isLoading ? 'Concluindo...' : 'Finalizar e Avaliar'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    )
  }

  if (screen === 'register') {
    return (
      <main className="auth-card">
        <header className="auth-header">
          <h1>duck2p</h1>
          <p>Criar nova conta de estudante</p>
        </header>

        {errorMessage && <div className="alert-message alert-error">{errorMessage}</div>}
        {successMessage && <div className="alert-message alert-success">{successMessage}</div>}

        <form className="auth-form" onSubmit={handleRegister}>
          <div className="form-group">
            <label htmlFor="full_name">Nome Completo</label>
            <input
              id="full_name"
              type="text"
              placeholder="Ex: Lucas Silva"
              value={registerData.full_name}
              onChange={(e) =>
                setRegisterData({ ...registerData, full_name: e.target.value })
              }
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              placeholder="Ex: aluno@universidade.edu.br"
              value={registerData.email}
              onChange={(e) =>
                setRegisterData({ ...registerData, email: e.target.value })
              }
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="student_id">Matrícula</label>
            <input
              id="student_id"
              type="text"
              placeholder="Ex: 2024100123"
              value={registerData.student_id}
              onChange={(e) =>
                setRegisterData({ ...registerData, student_id: e.target.value })
              }
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="course">Curso</label>
            <input
              id="course"
              type="text"
              placeholder="Ex: Ciência da Computação"
              value={registerData.course}
              onChange={(e) =>
                setRegisterData({ ...registerData, course: e.target.value })
              }
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Senha</label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              value={registerData.password}
              onChange={(e) =>
                setRegisterData({ ...registerData, password: e.target.value })
              }
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirm-password">Confirmar Senha</label>
            <input
              id="confirm-password"
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn-primary" disabled={isLoading}>
            {isLoading ? 'Cadastrando...' : 'Cadastrar'}
          </button>
        </form>

        <footer className="auth-footer">
          Já possui conta?
          <button
            type="button"
            className="btn-link"
            onClick={() => navigateTo('login')}
          >
            Fazer login
          </button>
        </footer>
      </main>
    )
  }

  return (
    <main className="auth-card">
      <header className="auth-header">
        <h1>duck2p</h1>
        <p>Acesse sua conta para continuar</p>
      </header>

      {errorMessage && <div className="alert-message alert-error">{errorMessage}</div>}
      {successMessage && <div className="alert-message alert-success">{successMessage}</div>}

      <form className="auth-form" onSubmit={handleLogin}>
        <div className="form-group">
          <label htmlFor="login-email">Email</label>
          <input
            id="login-email"
            type="email"
            placeholder="Ex: aluno@universidade.edu.br"
            value={loginData.email}
            onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="login-password">Senha</label>
          <input
            id="login-password"
            type="password"
            placeholder="••••••••"
            value={loginData.password}
            onChange={(e) =>
              setLoginData({ ...loginData, password: e.target.value })
            }
            required
          />
        </div>

        <button type="submit" className="btn-primary" disabled={isLoading}>
          {isLoading ? 'Entrando...' : 'Entrar'}
        </button>
      </form>

      <footer className="auth-footer">
        Não possui conta?
        <button
          type="button"
          className="btn-link"
          onClick={() => navigateTo('register')}
        >
          Criar cadastro
        </button>
      </footer>
    </main>
  )
}

export default App
