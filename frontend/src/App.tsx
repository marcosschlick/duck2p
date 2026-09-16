import { useState, useEffect, useCallback, useTransition } from 'react'
import './App.css'
import type {
  MatchDetail,
  MentorApplication,
  MentorStatus,
  MessageItem,
  QuestionOpen,
  Screen,
  Tab,
} from './types'
import { getDecodedToken, matchApi, mentorApi, questionApi } from './services/api'
import { Header } from './components/Header'
import { NavTabs } from './components/NavTabs'
import { DuvidasTab } from './components/DuvidasTab'
import { AtendimentosTab } from './components/AtendimentosTab'
import { MentoriaTab } from './components/MentoriaTab'
import { RatingModal } from './components/RatingModal'
import { AuthCard } from './components/AuthCard'

function App() {
  const [screen, setScreen] = useState<Screen>(() => {
    return localStorage.getItem('access_token') ? 'home' : 'login'
  })
  const [activeTab, setActiveTab] = useState<Tab>('duvidas')
  const [, startTransition] = useTransition()

  const [mentorStatus, setMentorStatus] = useState<MentorStatus | null>(null)
  const [activeMatches, setActiveMatches] = useState<MatchDetail[]>([])
  const [selectedMatch, setSelectedMatch] = useState<MatchDetail | null>(null)
  const [messages, setMessages] = useState<MessageItem[]>([])
  const [openQuestions, setOpenQuestions] = useState<QuestionOpen[]>([])
  const [mentorApplications, setMentorApplications] = useState<MentorApplication[]>([])
  const [ratingModalMatch, setRatingModalMatch] = useState<MatchDetail | null>(null)

  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const decoded = getDecodedToken()
  const currentUserId = decoded ? parseInt(decoded.sub, 10) : null

  const clearFeedback = useCallback(() => {
    setErrorMessage(null)
    setSuccessMessage(null)
  }, [])

  const handleLogout = useCallback(() => {
    localStorage.removeItem('access_token')
    setMentorStatus(null)
    setActiveMatches([])
    setSelectedMatch(null)
    setMessages([])
    setOpenQuestions([])
    setMentorApplications([])
    clearFeedback()
    setScreen('login')
  }, [clearFeedback])

  const fetchMentorStatus = useCallback(async () => {
    try {
      const data = await mentorApi.getMyStatus()
      setMentorStatus(data)
    } catch {
      return
    }
  }, [])

  const fetchActiveMatches = useCallback(async () => {
    try {
      const data = await matchApi.getMyActive()
      setActiveMatches(data)
    } catch {
      return
    }
  }, [])

  const fetchOpenQuestions = useCallback(async () => {
    try {
      const data = await questionApi.getOpen()
      setOpenQuestions(data)
    } catch {
      return
    }
  }, [])

  const fetchMentorApplications = useCallback(async () => {
    try {
      const data = await mentorApi.getApplications()
      setMentorApplications(data)
    } catch {
      return
    }
  }, [])

  const fetchMessages = useCallback(async (matchId: number) => {
    try {
      const data = await matchApi.getMessages(matchId)
      setMessages(data)
    } catch {
      return
    }
  }, [])

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

  const handleSelectTab = (tab: Tab) => {
    clearFeedback()
    if (tab === 'atendimentos') {
      void fetchActiveMatches()
    }
    if (tab === 'mentoria') {
      void fetchMentorStatus()
      if (mentorStatus?.is_mentor) {
        void fetchMentorApplications()
      }
    }
    startTransition(() => {
      setActiveTab(tab)
    })
  }

  const handleAcceptQuestion = async (questionId: number) => {
    clearFeedback()
    try {
      const match = await questionApi.accept(questionId)
      await fetchOpenQuestions()
      await fetchActiveMatches()

      const detail = await matchApi.getDetail(match.id)
      setSelectedMatch(detail)
      startTransition(() => {
        setActiveTab('atendimentos')
      })
      setSuccessMessage('Dúvida aceita! Sala de atendimento iniciada.')
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Erro ao aceitar dúvida.')
    }
  }

  const handleSendMessage = async (content: string) => {
    if (!selectedMatch) return
    try {
      await matchApi.sendMessage(selectedMatch.id, content)
      await fetchMessages(selectedMatch.id)
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Erro ao enviar mensagem.')
    }
  }

  const handleApplyMentor = async (contact: string, skills: string) => {
    clearFeedback()
    const profile = await mentorApi.apply(contact, skills)
    setSuccessMessage(
      profile.status === 'approved'
        ? 'Parabéns! Você é o primeiro mentor e foi aprovado automaticamente!'
        : 'Candidatura enviada com sucesso! Aguarde a avaliação de um mentor.'
    )
    await fetchMentorStatus()
  }

  const handleReviewApplication = async (
    targetUserId: number,
    action: 'approve' | 'reject'
  ) => {
    clearFeedback()
    await mentorApi.reviewApplication(targetUserId, action)
    setSuccessMessage(
      action === 'approve'
        ? 'Candidatura aprovada com sucesso!'
        : 'Candidatura rejeitada com sucesso.'
    )
    await fetchMentorApplications()
  }

  const handleRateMatch = async (
    score: number,
    wasResolved: boolean,
    comment: string
  ) => {
    if (!ratingModalMatch) return
    clearFeedback()
    try {
      await matchApi.rate(
        ratingModalMatch.id,
        score,
        wasResolved,
        comment.trim() || null
      )
      setSuccessMessage('Avaliação registrada com sucesso! Atendimento concluído.')
      setRatingModalMatch(null)
      setSelectedMatch(null)
      await fetchActiveMatches()
      await fetchMentorStatus()
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Erro ao avaliar atendimento.')
    }
  }

  if (screen !== 'home') {
    return (
      <AuthCard
        screen={screen}
        onNavigate={(s) => {
          clearFeedback()
          setScreen(s)
        }}
        onLoginSuccess={() => {
          clearFeedback()
          setScreen('home')
        }}
        onError={setErrorMessage}
        onSuccess={setSuccessMessage}
      />
    )
  }

  return (
    <div className="app-layout">
      <Header mentorStatus={mentorStatus} onLogout={handleLogout} />

      <NavTabs
        activeTab={activeTab}
        onSelectTab={handleSelectTab}
        activeMatchesCount={activeMatches.length}
      />

      {errorMessage && <div className="alert-message alert-error">{errorMessage}</div>}
      {successMessage && <div className="alert-message alert-success">{successMessage}</div>}

      <main className="app-main">
        {activeTab === 'duvidas' && (
          <DuvidasTab
            isMentor={Boolean(mentorStatus?.is_mentor)}
            openQuestions={openQuestions}
            onAcceptQuestion={handleAcceptQuestion}
            onQuestionCreated={fetchOpenQuestions}
            onError={setErrorMessage}
            onSuccess={setSuccessMessage}
          />
        )}

        {activeTab === 'atendimentos' && (
          <AtendimentosTab
            matches={activeMatches}
            selectedMatch={selectedMatch}
            currentUserId={currentUserId}
            messages={messages}
            onSelectMatch={setSelectedMatch}
            onSendMessage={handleSendMessage}
            onRequestRate={setRatingModalMatch}
          />
        )}

        {activeTab === 'mentoria' && (
          <MentoriaTab
            mentorStatus={mentorStatus}
            applications={mentorApplications}
            onApply={handleApplyMentor}
            onReview={handleReviewApplication}
            onError={setErrorMessage}
            onSuccess={setSuccessMessage}
          />
        )}
      </main>

      {ratingModalMatch && (
        <RatingModal
          match={ratingModalMatch}
          onClose={() => setRatingModalMatch(null)}
          onSubmitRate={handleRateMatch}
        />
      )}
    </div>
  )
}

export default App
