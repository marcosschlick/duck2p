export interface Message {
  id: string
  sender: 'assistant' | 'student'
  text: string
  timestamp: string
}
