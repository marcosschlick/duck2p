export type Screen = 'login' | 'register' | 'home'
export type Tab = 'duvidas' | 'atendimentos' | 'mentoria'

export interface RegisterForm {
  full_name: string
  email: string
  student_id: string
  course: string
  password: string
}

export interface LoginForm {
  email: string
  password: string
}

export interface DecodedToken {
  sub: string
  email: string
}

export interface MentorProfile {
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

export interface MentorStatus {
  is_mentor: boolean
  status: string
  profile: MentorProfile | null
}

export interface MentorApplication {
  user_id: number
  full_name: string
  email: string
  student_id: string
  course: string
  contact: string
  skills: string
  status: string
}

export interface QuestionOpen {
  id: number
  student_id: number
  student_name: string
  course: string
  problem_description: string
  status: string
  created_at: string | null
}

export interface MatchDetail {
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

export interface MessageItem {
  id: number
  match_id: number
  sender_id: number
  sender_name: string
  content: string
  created_at: string | null
  is_mine: boolean
}
