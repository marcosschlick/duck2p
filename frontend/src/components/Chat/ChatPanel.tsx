import type { Message } from '../../types/chat'
import { ChatHeader } from './ChatHeader'
import { ChatMessages } from './ChatMessages'
import { ChatInput } from './ChatInput'
import './Chat.css'

interface ChatPanelProps {
  messages: Message[]
  isThinking: boolean
  onSendMessage: (text: string) => void
  onResetChat: () => void
}

export function ChatPanel({
  messages,
  isThinking,
  onSendMessage,
  onResetChat,
}: ChatPanelProps) {
  return (
    <section className="chat-panel" aria-label="Painel de depuração com Duck2P">
      <ChatHeader onResetChat={onResetChat} />
      <ChatMessages messages={messages} isThinking={isThinking} />
      <ChatInput onSendMessage={onSendMessage} disabled={isThinking} />
    </section>
  )
}
