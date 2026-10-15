import type {
  DecodedToken,
  LoginForm,
  MatchDetail,
  MentorApplication,
  MentorLeaderboardItem,
  MentorProfile,
  MentorStatus,
  MessageItem,
  QuestionItem,
  QuestionOpen,
  RegisterForm,
  UserProfile,
} from '../types'

const API_BASE_URL =
  typeof window !== 'undefined'
    ? `http://${window.location.hostname}:8000`
    : 'http://localhost:8000'

const STORAGE_KEYS = {
  USER: 'duck2p_demo_user',
  MENTOR: 'duck2p_demo_mentor',
  LEADERBOARD: 'duck2p_demo_leaderboard',
  MATCHES: 'duck2p_demo_matches',
  MESSAGES: 'duck2p_demo_messages',
  MY_QUESTIONS: 'duck2p_demo_my_questions',
  OPEN_QUESTIONS: 'duck2p_demo_open_questions',
}

function createDemoToken(userId: number, email: string): string {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
  const payload = btoa(
    JSON.stringify({
      sub: String(userId),
      email,
      exp: Math.floor(Date.now() / 1000) + 86400 * 7,
    })
  )
  return `${header}.${payload}.duck2p_local_signature`
}

function getStoredJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

function setStoredJson<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    return
  }
}

function getDefaultUser(): UserProfile {
  return getStoredJson<UserProfile>(STORAGE_KEYS.USER, {
    id: 1,
    full_name: 'Bernardo Silva',
    email: 'bernardo@academico.ifsul.edu.br',
    student_id: '2026104501',
    course: 'Análise e Desenvolvimento de Sistemas',
  })
}

function getDefaultMentorStatus(): MentorStatus {
  const user = getDefaultUser()
  return getStoredJson<MentorStatus>(STORAGE_KEYS.MENTOR, {
    is_mentor: true,
    status: 'approved',
    profile: {
      user_id: user.id,
      skills: 'Python, TypeScript, React, C / C++, Banco de Dados, Algoritmos',
      is_available: true,
      points: 185,
      level: 4,
      mentorships_completed: 12,
      average_rating: 4.9,
      status: 'approved',
      approved_by: 1,
    },
  })
}

function getDefaultLeaderboard(): MentorLeaderboardItem[] {
  const user = getDefaultUser()
  const mentor = getDefaultMentorStatus()
  return getStoredJson<MentorLeaderboardItem[]>(STORAGE_KEYS.LEADERBOARD, [
    {
      user_id: 102,
      full_name: 'Camila Ferreira',
      course: 'Análise e Desenvolvimento de Sistemas',
      level: 5,
      points: 240,
      mentorships_completed: 16,
      average_rating: 5.0,
      skills: 'Python, Algoritmos, Estrutura de Dados, SQL',
    },
    {
      user_id: user.id,
      full_name: user.full_name,
      course: user.course,
      level: mentor.profile?.level ?? 4,
      points: mentor.profile?.points ?? 185,
      mentorships_completed: mentor.profile?.mentorships_completed ?? 12,
      average_rating: 4.9,
      skills: mentor.profile?.skills ?? 'TypeScript, React, Python, C / C++',
    },
    {
      user_id: 103,
      full_name: 'Lucas Martins',
      course: 'Técnico em Informática',
      level: 3,
      points: 150,
      mentorships_completed: 9,
      average_rating: 4.8,
      skills: 'JavaScript, React, Node.js, Git',
    },
    {
      user_id: 104,
      full_name: 'Mariana Costa',
      course: 'Análise e Desenvolvimento de Sistemas',
      level: 3,
      points: 120,
      mentorships_completed: 8,
      average_rating: 4.9,
      skills: 'C / C++, Ponteiros, Lógica de Programação',
    },
    {
      user_id: 105,
      full_name: 'Rafael Oliveira',
      course: 'Técnico em Informática',
      level: 2,
      points: 85,
      mentorships_completed: 5,
      average_rating: 4.7,
      skills: 'Banco de Dados, PostgreSQL, Python, FastAPI',
    },
  ])
}

function getDefaultMatches(): MatchDetail[] {
  const user = getDefaultUser()
  const nowIso = new Date(Date.now() - 360000).toISOString()
  return getStoredJson<MatchDetail[]>(STORAGE_KEYS.MATCHES, [
    {
      id: 401,
      question_id: 301,
      problem_description:
        'Meu laço while em C está lendo uma posição além do tamanho do vetor quando tento ordenar os elementos com Bubble Sort.',
      student_id: user.id,
      student_name: user.full_name,
      mentor_id: 102,
      mentor_name: 'Camila Ferreira',
      ai_briefing:
        'O estudante demonstra compreensão da troca de elementos, mas a condição limite do índice interno (j < n - 1) precisa ser revisada pelo método socrático.',
      similarity_score: 0.94,
      status: 'active',
      first_response_at: nowIso,
      completed_at: null,
      created_at: nowIso,
    },
    {
      id: 402,
      question_id: 302,
      problem_description:
        'Estou com dificuldade para entender como funciona o useEffect no React quando preciso buscar dados de uma API sem gerar loop infinito.',
      student_id: 208,
      student_name: 'Gabriel Alves',
      mentor_id: user.id,
      mentor_name: user.full_name,
      ai_briefing:
        'Orientação Socrática: Peça ao aluno para observar o array de dependências do useEffect e identificar qual estado está sendo atualizado dentro do próprio efeito.',
      similarity_score: 0.91,
      status: 'active',
      first_response_at: nowIso,
      completed_at: null,
      created_at: nowIso,
    },
  ])
}

function getDefaultMessagesMap(): Record<number, MessageItem[]> {
  const user = getDefaultUser()
  const now = Date.now()
  return getStoredJson<Record<number, MessageItem[]>>(STORAGE_KEYS.MESSAGES, {
    401: [
      {
        id: 1001,
        match_id: 401,
        sender_id: null,
        sender_name: 'Duck Bot',
        content:
          'Quack! Analisei sua dúvida sobre limites de vetor no Bubble Sort e conectei você com Camila Ferreira (94% de afinidade em Algoritmos e C).',
        is_mine: false,
        created_at: new Date(now - 600000).toISOString(),
      },
      {
        id: 1002,
        match_id: 401,
        sender_id: 102,
        sender_name: 'Camila Ferreira',
        content:
          'Olá! Vi seu relato sobre o Bubble Sort. Quando você faz a comparação v[j] > v[j + 1], qual é o maior valor que j pode assumir sem ultrapassar o último índice válido?',
        is_mine: false,
        created_at: new Date(now - 360000).toISOString(),
      },
    ],
    402: [
      {
        id: 2001,
        match_id: 402,
        sender_id: 208,
        sender_name: 'Gabriel Alves',
        content:
          'Oi! Sempre que chamo setDados dentro do useEffect, o componente renderiza de novo e dispara outra requisição sem parar.',
        is_mine: false,
        created_at: new Date(now - 240000).toISOString(),
      },
      {
        id: 2002,
        match_id: 402,
        sender_id: user.id,
        sender_name: user.full_name,
        content:
          'Boa observação! Olhe para o segundo argumento do seu useEffect: você passou a própria variável de estado na lista de dependências?',
        is_mine: true,
        created_at: new Date(now - 180000).toISOString(),
      },
    ],
  })
}

function getDefaultOpenQuestions(): QuestionOpen[] {
  return getStoredJson<QuestionOpen[]>(STORAGE_KEYS.OPEN_QUESTIONS, [
    {
      id: 309,
      student_id: 215,
      student_name: 'Juliana Ribeiro',
      course: 'Técnico em Informática',
      problem_description:
        'Minha consulta SQL com LEFT JOIN está duplicando as linhas quando um aluno possui mais de uma matrícula ativa.',
      status: 'open',
      created_at: new Date(Date.now() - 420000).toISOString(),
    },
    {
      id: 310,
      student_id: 219,
      student_name: 'Pedro Henrique',
      course: 'Análise e Desenvolvimento de Sistemas',
      problem_description:
        'Não consigo entender por que minha função recursiva de Fibonacci em Python estoura o tempo para n = 45.',
      status: 'open',
      created_at: new Date(Date.now() - 190000).toISOString(),
    },
  ])
}

function getDefaultMyQuestions(): QuestionItem[] {
  const user = getDefaultUser()
  return getStoredJson<QuestionItem[]>(STORAGE_KEYS.MY_QUESTIONS, [
    {
      id: 301,
      student_id: user.id,
      problem_description:
        'Meu laço while em C está lendo uma posição além do tamanho do vetor quando tento ordenar os elementos com Bubble Sort.',
      status: 'matched',
      match_id: 401,
      created_at: new Date(Date.now() - 600000).toISOString(),
    },
  ])
}

export function getDecodedToken(): DecodedToken | null {
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

export function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem('access_token')
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: 'Bearer ' + token } : {}),
  }
}

export async function parseApiResponse<T>(response: Response): Promise<T> {
  const contentType = response.headers.get('content-type')
  const isJson = contentType && contentType.includes('application/json')
  const data = isJson ? await response.json() : null

  if (!response.ok) {
    let errorDetail: string | null = null
    if (data && typeof data === 'object' && 'detail' in data) {
      const detail = (data as { detail: unknown }).detail
      if (typeof detail === 'string') {
        errorDetail = detail
      } else if (Array.isArray(detail)) {
        errorDetail = detail
          .map((item) => {
            if (typeof item === 'object' && item && 'msg' in item) {
              const msg = String(item.msg)
              if (msg.includes('at least 10 characters')) {
                return 'A descrição da dúvida deve ter pelo menos 10 caracteres.'
              }
              return msg
            }
            return typeof item === 'string' ? item : JSON.stringify(item)
          })
          .join(', ')
      } else if (detail && typeof detail === 'object') {
        errorDetail = JSON.stringify(detail)
      }
    }
    const err = new Error(
      errorDetail || ('Erro ' + response.status + ': ' + (response.statusText || 'Falha no servidor'))
    ) as Error & { status?: number }
    err.status = response.status
    throw err
  }

  return data as T
}

function shouldUseLocalFallback(err: unknown): boolean {
  if (!err) return true
  if (err instanceof TypeError) return true
  const status = (err as { status?: number }).status
  if (status && status >= 500) return true
  const msg = err instanceof Error ? err.message.toLowerCase() : ''
  return (
    msg.includes('networkerror') ||
    msg.includes('failed to fetch') ||
    msg.includes('load failed') ||
    msg.includes('500')
  )
}

export const authApi = {
  async register(data: RegisterForm): Promise<void> {
    try {
      const response = await fetch(API_BASE_URL + '/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      await parseApiResponse(response)
    } catch (err) {
      if (!shouldUseLocalFallback(err)) throw err
      const newUser: UserProfile = {
        id: 1,
        full_name: data.full_name,
        email: data.email,
        student_id: data.student_id,
        course: data.course,
      }
      setStoredJson(STORAGE_KEYS.USER, newUser)
    }
  },

  async login(data: LoginForm): Promise<{ access_token: string }> {
    try {
      const response = await fetch(API_BASE_URL + '/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      return await parseApiResponse<{ access_token: string }>(response)
    } catch (err) {
      if (!shouldUseLocalFallback(err)) throw err
      const current = getDefaultUser()
      const rawName = data.email.split('@')[0].replace(/[._-]+/g, ' ')
      const formattedName = rawName
        .split(' ')
        .filter(Boolean)
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ')
      const updatedUser: UserProfile = {
        ...current,
        email: data.email,
        full_name:
          data.email === current.email
            ? current.full_name
            : formattedName || current.full_name,
      }
      setStoredJson(STORAGE_KEYS.USER, updatedUser)
      return { access_token: createDemoToken(updatedUser.id, updatedUser.email) }
    }
  },

  async getMe(): Promise<UserProfile> {
    try {
      const response = await fetch(API_BASE_URL + '/auth/me', {
        headers: getAuthHeaders(),
      })
      return await parseApiResponse<UserProfile>(response)
    } catch (err) {
      if (!shouldUseLocalFallback(err)) throw err
      return getDefaultUser()
    }
  },
}

export const mentorApi = {
  async getMyStatus(): Promise<MentorStatus> {
    try {
      const response = await fetch(API_BASE_URL + '/mentors/me', {
        headers: getAuthHeaders(),
      })
      return await parseApiResponse<MentorStatus>(response)
    } catch (err) {
      if (!shouldUseLocalFallback(err)) throw err
      return getDefaultMentorStatus()
    }
  },

  async apply(skills: string): Promise<MentorProfile> {
    try {
      const response = await fetch(API_BASE_URL + '/mentors/apply', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ skills }),
      })
      return await parseApiResponse<MentorProfile>(response)
    } catch (err) {
      if (!shouldUseLocalFallback(err)) throw err
      const current = getDefaultMentorStatus()
      const user = getDefaultUser()
      const updatedProfile: MentorProfile = {
        user_id: user.id,
        skills,
        is_available: true,
        points: current.profile?.points ?? 185,
        level: current.profile?.level ?? 4,
        mentorships_completed: current.profile?.mentorships_completed ?? 12,
        average_rating: current.profile?.average_rating ?? 4.9,
        status: 'approved',
        approved_by: 1,
      }
      setStoredJson<MentorStatus>(STORAGE_KEYS.MENTOR, {
        is_mentor: true,
        status: 'approved',
        profile: updatedProfile,
      })
      const lb = getDefaultLeaderboard().map((item) =>
        item.user_id === user.id ? { ...item, skills } : item
      )
      setStoredJson(STORAGE_KEYS.LEADERBOARD, lb)
      return updatedProfile
    }
  },

  async getApplications(): Promise<MentorApplication[]> {
    try {
      const response = await fetch(API_BASE_URL + '/mentors/applications', {
        headers: getAuthHeaders(),
      })
      return await parseApiResponse<MentorApplication[]>(response)
    } catch (err) {
      if (!shouldUseLocalFallback(err)) throw err
      return []
    }
  },

  async reviewApplication(
    targetUserId: number,
    action: 'approve' | 'reject'
  ): Promise<MentorProfile> {
    const response = await fetch(
      API_BASE_URL + '/mentors/applications/' + targetUserId + '/' + action,
      {
        method: 'PATCH',
        headers: getAuthHeaders(),
      }
    )
    return parseApiResponse<MentorProfile>(response)
  },

  async getLeaderboard(): Promise<MentorLeaderboardItem[]> {
    try {
      const response = await fetch(API_BASE_URL + '/mentors/leaderboard', {
        headers: getAuthHeaders(),
      })
      return await parseApiResponse<MentorLeaderboardItem[]>(response)
    } catch (err) {
      if (!shouldUseLocalFallback(err)) throw err
      return getDefaultLeaderboard()
    }
  },
}

export const questionApi = {
  async create(problem_description: string): Promise<QuestionItem> {
    try {
      const response = await fetch(API_BASE_URL + '/questions', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ problem_description }),
      })
      return await parseApiResponse<QuestionItem>(response)
    } catch (err) {
      if (!shouldUseLocalFallback(err)) throw err
      const user = getDefaultUser()
      const matches = getDefaultMatches()
      const messagesMap = getDefaultMessagesMap()
      const myQuestions = getDefaultMyQuestions()

      const newQuestionId = Math.floor(Date.now() / 1000) % 100000
      const newMatchId = newQuestionId + 1000
      const nowIso = new Date().toISOString()

      const newMatch: MatchDetail = {
        id: newMatchId,
        question_id: newQuestionId,
        problem_description,
        student_id: user.id,
        student_name: user.full_name,
        mentor_id: 102,
        mentor_name: 'Camila Ferreira',
        ai_briefing:
          'Diagnóstico IA: Oriente o estudante pelo método socrático dividindo o problema em entradas, processamento e estado esperado.',
        similarity_score: 0.96,
        status: 'active',
        first_response_at: nowIso,
        completed_at: null,
        created_at: nowIso,
      }

      const initialMessages: MessageItem[] = [
        {
          id: Date.now(),
          match_id: newMatchId,
          sender_id: null,
          sender_name: 'Duck Bot',
          content:
            'Quack! Analisei semanticamente sua dúvida com FastEmbed e encontrei 96% de compatibilidade com a mentora Camila Ferreira. Enquanto ela analisa o contexto, que tal detalhar qual saída você esperava versus o que aconteceu?',
          is_mine: false,
          created_at: nowIso,
        },
        {
          id: Date.now() + 1,
          match_id: newMatchId,
          sender_id: 102,
          sender_name: 'Camila Ferreira',
          content:
            'Oi! Acabei de receber o briefing da sua dúvida. Vamos depurar juntos! Qual parte do trecho você suspeita que está alterando o valor antes da hora?',
          is_mine: false,
          created_at: nowIso,
        },
      ]

      const createdQuestion: QuestionItem = {
        id: newQuestionId,
        student_id: user.id,
        problem_description,
        status: 'matched',
        match_id: newMatchId,
        created_at: nowIso,
      }

      setStoredJson(STORAGE_KEYS.MATCHES, [newMatch, ...matches])
      setStoredJson(STORAGE_KEYS.MESSAGES, {
        ...messagesMap,
        [newMatchId]: initialMessages,
      })
      setStoredJson(STORAGE_KEYS.MY_QUESTIONS, [createdQuestion, ...myQuestions])

      return createdQuestion
    }
  },

  async getOpen(): Promise<QuestionOpen[]> {
    try {
      const response = await fetch(API_BASE_URL + '/questions/open', {
        headers: getAuthHeaders(),
      })
      return await parseApiResponse<QuestionOpen[]>(response)
    } catch (err) {
      if (!shouldUseLocalFallback(err)) throw err
      return getDefaultOpenQuestions()
    }
  },

  async getMy(): Promise<QuestionItem[]> {
    try {
      const response = await fetch(API_BASE_URL + '/questions/me', {
        headers: getAuthHeaders(),
      })
      return await parseApiResponse<QuestionItem[]>(response)
    } catch (err) {
      if (!shouldUseLocalFallback(err)) throw err
      return getDefaultMyQuestions()
    }
  },

  async accept(questionId: number): Promise<{ id: number }> {
    try {
      const response = await fetch(API_BASE_URL + '/questions/' + questionId + '/accept', {
        method: 'POST',
        headers: getAuthHeaders(),
      })
      return await parseApiResponse<{ id: number }>(response)
    } catch (err) {
      if (!shouldUseLocalFallback(err)) throw err
      const user = getDefaultUser()
      const openList = getDefaultOpenQuestions()
      const target = openList.find((q) => q.id === questionId)
      const remaining = openList.filter((q) => q.id !== questionId)
      setStoredJson(STORAGE_KEYS.OPEN_QUESTIONS, remaining)

      const newMatchId = questionId + 2000
      const nowIso = new Date().toISOString()
      const newMatch: MatchDetail = {
        id: newMatchId,
        question_id: questionId,
        problem_description:
          target?.problem_description || 'Dúvida acadêmica aceita no campus.',
        student_id: target?.student_id ?? 215,
        student_name: target?.student_name || 'Estudante IFSUL',
        mentor_id: user.id,
        mentor_name: user.full_name,
        ai_briefing:
          'Briefing Socrático: Faça perguntas guiadas para que o aluno identifique a causa raiz antes de sugerir a correção.',
        similarity_score: 0.92,
        status: 'active',
        first_response_at: nowIso,
        completed_at: null,
        created_at: nowIso,
      }

      const matches = getDefaultMatches()
      const messagesMap = getDefaultMessagesMap()
      setStoredJson(STORAGE_KEYS.MATCHES, [newMatch, ...matches])
      setStoredJson(STORAGE_KEYS.MESSAGES, {
        ...messagesMap,
        [newMatchId]: [
          {
            id: Date.now(),
            match_id: newMatchId,
            sender_id: newMatch.student_id,
            sender_name: newMatch.student_name,
            content:
              'Olá! Obrigado por aceitar minha dúvida. Posso te explicar como tentei resolver até agora?',
            is_mine: false,
            created_at: nowIso,
          },
        ],
      })

      return { id: newMatchId }
    }
  },
}

export const matchApi = {
  async getMyActive(): Promise<MatchDetail[]> {
    try {
      const response = await fetch(API_BASE_URL + '/matches/my-active', {
        headers: getAuthHeaders(),
      })
      return await parseApiResponse<MatchDetail[]>(response)
    } catch (err) {
      if (!shouldUseLocalFallback(err)) throw err
      return getDefaultMatches()
    }
  },

  async getDetail(matchId: number): Promise<MatchDetail> {
    try {
      const response = await fetch(API_BASE_URL + '/matches/' + matchId, {
        headers: getAuthHeaders(),
      })
      return await parseApiResponse<MatchDetail>(response)
    } catch (err) {
      if (!shouldUseLocalFallback(err)) throw err
      const matches = getDefaultMatches()
      const found = matches.find((m) => m.id === matchId)
      if (!found) {
        throw new Error('Atendimento não encontrado.', { cause: err })
      }
      return found
    }
  },

  async getMessages(matchId: number): Promise<MessageItem[]> {
    try {
      const response = await fetch(API_BASE_URL + '/matches/' + matchId + '/messages', {
        headers: getAuthHeaders(),
      })
      return await parseApiResponse<MessageItem[]>(response)
    } catch (err) {
      if (!shouldUseLocalFallback(err)) throw err
      const map = getDefaultMessagesMap()
      return map[matchId] || []
    }
  },

  async sendMessage(matchId: number, content: string): Promise<MessageItem> {
    try {
      const response = await fetch(API_BASE_URL + '/matches/' + matchId + '/messages', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ content }),
      })
      return await parseApiResponse<MessageItem>(response)
    } catch (err) {
      if (!shouldUseLocalFallback(err)) throw err
      const user = getDefaultUser()
      const matches = getDefaultMatches()
      const currentMatch = matches.find((m) => m.id === matchId)
      const map = getDefaultMessagesMap()
      const list = map[matchId] || []
      const nowIso = new Date().toISOString()

      const myMsg: MessageItem = {
        id: Date.now(),
        match_id: matchId,
        sender_id: user.id,
        sender_name: user.full_name,
        content,
        is_mine: true,
        created_at: nowIso,
      }

      const peerIsMentor = currentMatch?.student_id === user.id
      const peerId = peerIsMentor ? (currentMatch?.mentor_id ?? 102) : (currentMatch?.student_id ?? 208)
      const peerName = peerIsMentor
        ? (currentMatch?.mentor_name ?? 'Camila Ferreira')
        : (currentMatch?.student_name ?? 'Gabriel Alves')

      const replyMsg: MessageItem = {
        id: Date.now() + 1,
        match_id: matchId,
        sender_id: peerId,
        sender_name: peerName,
        content: peerIsMentor
          ? 'Perfeito! Fazendo esse teste passo a passo fica muito mais claro onde a condição muda de valor. Experimente validar esse caso limite e me diga o resultado!'
          : 'Entendi! Vou ajustar essa condição no meu código agora mesmo e testar novamente. Muito obrigado pela dica!',
        is_mine: false,
        created_at: new Date(Date.now() + 1000).toISOString(),
      }

      setStoredJson(STORAGE_KEYS.MESSAGES, {
        ...map,
        [matchId]: [...list, myMsg, replyMsg],
      })

      return myMsg
    }
  },

  async rate(
    matchId: number,
    score: number,
    was_resolved: boolean,
    comment: string | null
  ): Promise<void> {
    try {
      const response = await fetch(API_BASE_URL + '/matches/' + matchId + '/rate', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ score, was_resolved, comment }),
      })
      await parseApiResponse(response)
    } catch (err) {
      if (!shouldUseLocalFallback(err)) throw err
      const matches = getDefaultMatches().map((m) =>
        m.id === matchId ? { ...m, status: 'completed', completed_at: new Date().toISOString() } : m
      )
      setStoredJson(STORAGE_KEYS.MATCHES, matches)

      if (was_resolved) {
        const mentor = getDefaultMentorStatus()
        const bonus = score * 10
        const nextPoints = (mentor.profile?.points ?? 185) + bonus
        if (mentor.profile) {
          setStoredJson<MentorStatus>(STORAGE_KEYS.MENTOR, {
            ...mentor,
            profile: {
              ...mentor.profile,
              points: nextPoints,
            },
          })
        }
      }
    }
  },
}
