import type {
  DecodedToken,
  LoginForm,
  MatchDetail,
  MentorApplication,
  MentorLeaderboardItem,
  MentorProfile,
  MentorStatus,
  MessageItem,
  QuestionOpen,
  RegisterForm,
} from '../types'

const API_BASE_URL = 'http://localhost:8000'

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
    const errorDetail =
      data && typeof data === 'object' && 'detail' in data
        ? (data as { detail: string }).detail
        : null
    throw new Error(
      errorDetail || ('Erro ' + response.status + ': ' + (response.statusText || 'Falha no servidor'))
    )
  }

  return data as T
}

export const authApi = {
  async register(data: RegisterForm): Promise<void> {
    const response = await fetch(API_BASE_URL + '/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    await parseApiResponse(response)
  },

  async login(data: LoginForm): Promise<{ access_token: string }> {
    const response = await fetch(API_BASE_URL + '/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    return parseApiResponse<{ access_token: string }>(response)
  },
}

export const mentorApi = {
  async getMyStatus(): Promise<MentorStatus> {
    const response = await fetch(API_BASE_URL + '/mentors/me', {
      headers: getAuthHeaders(),
    })
    return parseApiResponse<MentorStatus>(response)
  },

  async apply(skills: string): Promise<MentorProfile> {
    const response = await fetch(API_BASE_URL + '/mentors/apply', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ skills }),
    })
    return parseApiResponse<MentorProfile>(response)
  },

  async getApplications(): Promise<MentorApplication[]> {
    const response = await fetch(API_BASE_URL + '/mentors/applications', {
      headers: getAuthHeaders(),
    })
    return parseApiResponse<MentorApplication[]>(response)
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
    const response = await fetch(API_BASE_URL + '/mentors/leaderboard', {
      headers: getAuthHeaders(),
    })
    return parseApiResponse<MentorLeaderboardItem[]>(response)
  },
}

export const questionApi = {
  async create(problem_description: string): Promise<{ id: number }> {
    const response = await fetch(API_BASE_URL + '/questions', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ problem_description }),
    })
    return parseApiResponse<{ id: number }>(response)
  },

  async getOpen(): Promise<QuestionOpen[]> {
    const response = await fetch(API_BASE_URL + '/questions/open', {
      headers: getAuthHeaders(),
    })
    return parseApiResponse<QuestionOpen[]>(response)
  },

  async accept(questionId: number): Promise<{ id: number }> {
    const response = await fetch(API_BASE_URL + '/questions/' + questionId + '/accept', {
      method: 'POST',
      headers: getAuthHeaders(),
    })
    return parseApiResponse<{ id: number }>(response)
  },
}

export const matchApi = {
  async getMyActive(): Promise<MatchDetail[]> {
    const response = await fetch(API_BASE_URL + '/matches/my-active', {
      headers: getAuthHeaders(),
    })
    return parseApiResponse<MatchDetail[]>(response)
  },

  async getDetail(matchId: number): Promise<MatchDetail> {
    const response = await fetch(API_BASE_URL + '/matches/' + matchId, {
      headers: getAuthHeaders(),
    })
    return parseApiResponse<MatchDetail>(response)
  },

  async getMessages(matchId: number): Promise<MessageItem[]> {
    const response = await fetch(API_BASE_URL + '/matches/' + matchId + '/messages', {
      headers: getAuthHeaders(),
    })
    return parseApiResponse<MessageItem[]>(response)
  },

  async sendMessage(matchId: number, content: string): Promise<MessageItem> {
    const response = await fetch(API_BASE_URL + '/matches/' + matchId + '/messages', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ content }),
    })
    return parseApiResponse<MessageItem>(response)
  },

  async rate(
    matchId: number,
    score: number,
    was_resolved: boolean,
    comment: string | null
  ): Promise<void> {
    const response = await fetch(API_BASE_URL + '/matches/' + matchId + '/rate', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ score, was_resolved, comment }),
    })
    await parseApiResponse(response)
  },
}
