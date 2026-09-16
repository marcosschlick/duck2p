import { useState } from 'react'
import type { Message } from './types/chat'
import { Header } from './components/Header/Header'
import { ChatPanel } from './components/Chat/ChatPanel'
import { DuckScene } from './components/DuckScene/DuckScene'
import { FeatureStrip } from './components/FeatureStrip/FeatureStrip'
import './App.css'

type Screen = 'home' | 'login' | 'register'

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

const API_BASE_URL = 'http://localhost:8000'

const INITIAL_MESSAGES: Message[] = [
  {
    id: 'msg-1',
    sender: 'assistant',
    text: 'Olá! 👋\n\nPode me contar qual é a sua dúvida? Tente explicar com o máximo de detalhes possível. Vou te ajudar a entender o problema e, se precisar, te direcionar para um mentor.',
    timestamp: '08:30',
  },
  {
    id: 'msg-2',
    sender: 'student',
    text: 'Meu código está dando um erro de undefined quando tento acessar o user.name no meu componente React.',
    timestamp: '08:32',
  },
  {
    id: 'msg-3',
    sender: 'assistant',
    text: 'Entendi! Vamos investigar isso juntos.\n\nVocê pode me mostrar:\n\n1. Como o objeto user está sendo preenchido?\n2. Em qual parte do código o erro acontece?\n3. Qual é a estrutura do seu user (exemplo de retorno da API)?',
    timestamp: '08:33',
  },
]

function EyeIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}

function EyeOffIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
      <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
      <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
      <line x1="2" y1="2" x2="22" y2="22" />
    </svg>
  )
}

export function App() {
  const [screen, setScreen] = useState<Screen>('home')
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES)
  const [isThinking, setIsThinking] = useState<boolean>(false)
  const [userEmail, setUserEmail] = useState<string>(() => {
    return localStorage.getItem('user_email') || ''
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
  const [showRegisterPassword, setShowRegisterPassword] = useState<boolean>(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false)
  const [showLoginPassword, setShowLoginPassword] = useState<boolean>(false)

  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const clearFeedback = () => {
    setErrorMessage(null)
    setSuccessMessage(null)
  }

  const navigateTo = (targetScreen: Screen) => {
    clearFeedback()
    setScreen(targetScreen)
  }

  const handleSendMessage = (text: string) => {
    const now = new Date()
    const timeString = `${String(now.getHours()).padStart(2, '0')}:${String(
      now.getMinutes()
    ).padStart(2, '0')}`

    const userMsg: Message = {
      id: `msg-${Date.now()}`,
      sender: 'student',
      text,
      timestamp: timeString,
    }

    setMessages((prev) => [...prev, userMsg])
    setIsThinking(true)

    setTimeout(() => {
      const replyTime = new Date()
      const replyTimeString = `${String(replyTime.getHours()).padStart(2, '0')}:${String(
        replyTime.getMinutes()
      ).padStart(2, '0')}`

      let replyText =
        'Interessante! Vamos analisar passo a passo: o que você espera que essa variável contenha no momento da execução?'
      const lower = text.toLowerCase()
      if (
        lower.includes('api') ||
        lower.includes('fetch') ||
        lower.includes('useeffect') ||
        lower.includes('carreg') ||
        lower.includes('undefined')
      ) {
        replyText =
          'Como operações assíncronas levam tempo para responder, na primeira renderização o dado ainda não chegou. Experimente verificar se o estado inicial trata o carregamento ou use o encadeamento opcional user?.name para proteger o acesso.'
      } else if (
        lower.includes('mentor') ||
        lower.includes('veterano') ||
        lower.includes('ajuda')
      ) {
        replyText =
          'Posso te conectar a um mentor voluntário com a experiência exata nessa tecnologia para continuarem juntos!'
      }

      const botMsg: Message = {
        id: `msg-${Date.now() + 1}`,
        sender: 'assistant',
        text: replyText,
        timestamp: replyTimeString,
      }

      setMessages((prev) => [...prev, botMsg])
      setIsThinking(false)
    }, 1300)
  }

  const handleResetChat = () => {
    setMessages(INITIAL_MESSAGES)
    setIsThinking(false)
  }

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

    const missingRequirements: string[] = []
    if (registerData.password.length < 8) {
      missingRequirements.push('no mínimo 8 caracteres')
    }
    if (!/[A-Z]/.test(registerData.password)) {
      missingRequirements.push('ao menos uma letra maiúscula')
    }
    if (!/[a-z]/.test(registerData.password)) {
      missingRequirements.push('ao menos uma letra minúscula')
    }
    if (!/[0-9]/.test(registerData.password)) {
      missingRequirements.push('ao menos um número')
    }
    if (!/[^A-Za-z0-9]/.test(registerData.password)) {
      missingRequirements.push('ao menos um símbolo (ex: !, @, #, $, *)')
    }

    if (missingRequirements.length > 0) {
      setErrorMessage(`A senha deve conter: ${missingRequirements.join(', ')}.`)
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
        err instanceof Error
          ? err.message
          : 'Falha na comunicação com o servidor.'
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
      localStorage.setItem('user_email', loginData.email)
      setUserEmail(loginData.email)
      setLoginData({ email: '', password: '' })
      setScreen('home')
    } catch (err: unknown) {
      setErrorMessage(
        err instanceof Error
          ? err.message
          : 'Falha na comunicação com o servidor.'
      )
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('user_email')
    setUserEmail('')
    navigateTo('login')
  }

  if (screen === 'register') {
    return (
      <div className="auth-page-wrapper">
        <main className="auth-card">
          <header className="auth-header">
            <h1>Duck2P</h1>
            <p>Criar nova conta de estudante</p>
          </header>

          {errorMessage && (
            <div className="alert-message alert-error">{errorMessage}</div>
          )}
          {successMessage && (
            <div className="alert-message alert-success">{successMessage}</div>
          )}

          <form className="auth-form" onSubmit={handleRegister}>
            <div className="form-group">
              <label htmlFor="full_name">Nome Completo</label>
              <input
                id="full_name"
                type="text"
                placeholder="Ex: Bernardo Silva"
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
                placeholder="Ex: TADS"
                value={registerData.course}
                onChange={(e) =>
                  setRegisterData({ ...registerData, course: e.target.value })
                }
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Senha</label>
              <div className="password-input-wrapper">
                <input
                  id="password"
                  type={showRegisterPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={registerData.password}
                  onChange={(e) =>
                    setRegisterData({
                      ...registerData,
                      password: e.target.value,
                    })
                  }
                  required
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                  aria-label={
                    showRegisterPassword ? 'Ocultar senha' : 'Exibir senha'
                  }
                >
                  {showRegisterPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="confirm-password">Confirmar Senha</label>
              <div className="password-input-wrapper">
                <input
                  id="confirm-password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={
                    showConfirmPassword
                      ? 'Ocultar confirmação de senha'
                      : 'Exibir confirmação de senha'
                  }
                >
                  {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
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
            <div style={{ marginTop: '0.85rem' }}>
              <button
                type="button"
                className="btn-link"
                style={{ color: 'var(--color-text-muted)' }}
                onClick={() => navigateTo('home')}
              >
                ← Voltar para o Duck2P
              </button>
            </div>
          </footer>
        </main>
      </div>
    )
  }

  if (screen === 'login') {
    return (
      <div className="auth-page-wrapper">
        <main className="auth-card">
          <header className="auth-header">
            <h1>Duck2P</h1>
            <p>Acesse sua conta para continuar</p>
          </header>

          {errorMessage && (
            <div className="alert-message alert-error">{errorMessage}</div>
          )}
          {successMessage && (
            <div className="alert-message alert-success">{successMessage}</div>
          )}

          <form className="auth-form" onSubmit={handleLogin}>
            <div className="form-group">
              <label htmlFor="login-email">Email</label>
              <input
                id="login-email"
                type="email"
                placeholder="Ex: aluno@universidade.edu.br"
                value={loginData.email}
                onChange={(e) =>
                  setLoginData({ ...loginData, email: e.target.value })
                }
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="login-password">Senha</label>
              <div className="password-input-wrapper">
                <input
                  id="login-password"
                  type={showLoginPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={loginData.password}
                  onChange={(e) =>
                    setLoginData({ ...loginData, password: e.target.value })
                  }
                  required
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowLoginPassword(!showLoginPassword)}
                  aria-label={
                    showLoginPassword ? 'Ocultar senha' : 'Exibir senha'
                  }
                >
                  {showLoginPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
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
            <div style={{ marginTop: '0.85rem' }}>
              <button
                type="button"
                className="btn-link"
                style={{ color: 'var(--color-text-muted)' }}
                onClick={() => navigateTo('home')}
              >
                ← Entrar como convidado
              </button>
            </div>
          </footer>
        </main>
      </div>
    )
  }

  return (
    <div className="duck-app">
      <Header
        onLogout={userEmail ? handleLogout : () => navigateTo('login')}
        userEmail={userEmail}
      />
      <main className="duck-main-layout">
        <div className="duck-chat-column">
          <ChatPanel
            messages={messages}
            isThinking={isThinking}
            onSendMessage={handleSendMessage}
            onResetChat={handleResetChat}
          />
        </div>
        <div className="duck-scene-column">
          <div className="duck-3d-wrapper">
            <DuckScene isThinking={isThinking} />
          </div>
          <FeatureStrip />
        </div>
      </main>
    </div>
  )
}

export default App
