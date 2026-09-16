import { useState, useEffect, useCallback, useTransition } from 'react'
import './App.css'
import type {
  MatchDetail,
  MentorLeaderboardItem,
  MentorStatus,
  MessageItem,
  QuestionItem,
  QuestionOpen,
  Screen,
  Tab,
} from './types'
import { getDecodedToken, matchApi, mentorApi, questionApi } from './services/api'
import { Header } from './components/Header'
import { NavTabs } from './components/NavTabs'
import { DuvidasTab } from './components/DuvidasTab'
import { AtendimentosTab } from './components/AtendimentosTab'
import { RankingTab } from './components/RankingTab'
import { RatingModal } from './components/RatingModal'
import { ProfileModal } from './components/ProfileModal'
import { AuthCard } from './components/AuthCard'
import { Footer } from './components/Footer'

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
  const [myQuestions, setMyQuestions] = useState<QuestionItem[]>([])
  const [leaderboard, setLeaderboard] = useState<MentorLeaderboardItem[]>([])
  const [isLeaderboardLoading, setIsLeaderboardLoading] = useState(false)
  const [ratingModalMatch, setRatingModalMatch] = useState<MatchDetail | null>(null)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [isCreatingNewQuestion, setIsCreatingNewQuestion] = useState(false)

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
    setMyQuestions([])
    setLeaderboard([])
    setIsProfileOpen(false)
    setIsCreatingNewQuestion(false)
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

  const fetchMyQuestions = useCallback(async () => {
    try {
      const data = await questionApi.getMy()
      setMyQuestions(data)
    } catch {
      return
    }
  }, [])

  const fetchLeaderboard = useCallback(async () => {
    setIsLeaderboardLoading(true)
    try {
      const data = await mentorApi.getLeaderboard()
      setLeaderboard(data)
    } catch {
      return
    } finally {
      setIsLeaderboardLoading(false)
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
      void fetchOpenQuestions()
      void fetchMyQuestions()
      void fetchLeaderboard()
    }, 0)
    return () => clearTimeout(timer)
  }, [screen, fetchMentorStatus, fetchActiveMatches, fetchOpenQuestions, fetchMyQuestions, fetchLeaderboard])

  const studentActiveMatch = activeMatches.find(
    (m) => m.student_id === currentUserId && m.status === 'active'
  ) ?? null

  const activeStudentMatch = isCreatingNewQuestion
    ? null
    : selectedMatch && selectedMatch.student_id === currentUserId && selectedMatch.status === 'active'
    ? selectedMatch
    : studentActiveMatch

  const pendingStudentQuestion = isCreatingNewQuestion
    ? null
    : myQuestions.find((q) => q.status === 'pending') ?? null

  const currentChatMatchId = activeTab === 'duvidas' ? activeStudentMatch?.id : selectedMatch?.id

  useEffect(() => {
    if (!currentChatMatchId) return
    const timer = setTimeout(() => {
      void fetchMessages(currentChatMatchId)
    }, 0)
    const interval = setInterval(() => {
      void fetchMessages(currentChatMatchId)
    }, 3000)
    return () => {
      clearTimeout(timer)
      clearInterval(interval)
    }
  }, [currentChatMatchId, fetchMessages])

  const handleSelectTab = (tab: Tab) => {
    clearFeedback()
    if (tab === 'atendimentos') {
      void fetchActiveMatches()
      void fetchOpenQuestions()
      void fetchMyQuestions()
    }
    if (tab === 'ranking') {
      void fetchLeaderboard()
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
    const targetMatchId = activeTab === 'duvidas' ? activeStudentMatch?.id : selectedMatch?.id
    if (!targetMatchId) return
    try {
      await matchApi.sendMessage(targetMatchId, content)
      await fetchMessages(targetMatchId)
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Erro ao enviar mensagem.')
    }
  }

  const handleSaveSkills = async (skills: string) => {
    clearFeedback()
    await mentorApi.apply(skills)
    await fetchMentorStatus()
    await fetchLeaderboard()
    setSuccessMessage('Perfil e habilidades atualizados com sucesso!')
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
      setSuccessMessage('Atendimento concluído com sucesso!')
      setRatingModalMatch(null)
      setSelectedMatch(null)
      setIsCreatingNewQuestion(true)
      await fetchActiveMatches()
      await fetchMyQuestions()
      await fetchMentorStatus()
      await fetchLeaderboard()
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Erro ao avaliar atendimento.')
    }
  }

  const handleCreateQuestion = async (text: string) => {
    clearFeedback()
    try {
      const created = await questionApi.create(text)
      await fetchOpenQuestions()
      await fetchMyQuestions()
      const updatedMatches = await matchApi.getMyActive()
      setActiveMatches(updatedMatches)
      setIsCreatingNewQuestion(false)

      if (created.match_id) {
        const detail = await matchApi.getDetail(created.match_id)
        setSelectedMatch(detail)
        setSuccessMessage('Mentor ideal encontrado pela IA! Atendimento iniciado.')
      } else {
        const found = updatedMatches.find((m) => m.question_id === created.id)
        if (found) {
          setSelectedMatch(found)
          setSuccessMessage('Mentor ideal encontrado pela IA! Atendimento iniciado.')
        } else {
          setSuccessMessage('Dúvida registrada e pareamento por IA acionado no campus!')
        }
      }
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Falha ao registrar dúvida.')
      throw err
    }
  }

  const handleNewQuestion = () => {
    setIsCreatingNewQuestion(true)
    setSelectedMatch(null)
  }

  const handleSelectMatch = (m: MatchDetail | null) => {
    if (m && m.status !== 'active') return
    setSelectedMatch(m)
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
        errorMessage={errorMessage}
        successMessage={successMessage}
      />
    )
  }

  return (
    <div className="app-layout">
      <Header
        mentorStatus={mentorStatus}
        userEmail={decoded?.email}
        onOpenProfile={() => setIsProfileOpen(true)}
        onLogout={handleLogout}
      />

      <div className="app-container">
        <NavTabs
          activeTab={activeTab}
          onSelectTab={handleSelectTab}
          activeMatchesCount={activeMatches.filter((m) => m.status === 'active').length}
        />

        {errorMessage && <div className="alert-message alert-error">{errorMessage}</div>}
        {successMessage && <div className="alert-message alert-success">{successMessage}</div>}

        <main className="app-main">
          {activeTab === 'duvidas' && (
            <DuvidasTab
              activeMatch={activeStudentMatch}
              pendingQuestion={pendingStudentQuestion}
              messages={messages}
              onSendMessage={handleSendMessage}
              onCreateQuestion={handleCreateQuestion}
              onRequestRate={setRatingModalMatch}
              onNewQuestion={handleNewQuestion}
            />
          )}

          {activeTab === 'atendimentos' && (
            <AtendimentosTab
              matches={activeMatches}
              selectedMatch={selectedMatch}
              currentUserId={currentUserId}
              messages={messages}
              isMentor={Boolean(mentorStatus?.is_mentor)}
              openQuestions={openQuestions}
              myQuestions={myQuestions}
              onAcceptQuestion={handleAcceptQuestion}
              onSelectMatch={handleSelectMatch}
              onSendMessage={handleSendMessage}
              onRequestRate={setRatingModalMatch}
            />
          )}

          {activeTab === 'ranking' && (
            <RankingTab
              leaderboard={leaderboard}
              isLoading={isLeaderboardLoading}
            />
          )}
        </main>
      </div>

      <Footer />

      {isProfileOpen && (
        <ProfileModal
          mentorStatus={mentorStatus}
          onClose={() => setIsProfileOpen(false)}
          onSaveSkills={handleSaveSkills}
          onLogout={handleLogout}
        />
      )}

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

