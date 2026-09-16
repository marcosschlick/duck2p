import { useState } from 'react'
import './App.css'

type Screen = 'login' | 'register' | 'home'

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

  const clearFeedback = () => {
    setErrorMessage(null)
    setSuccessMessage(null)
  }

  const navigateTo = (targetScreen: Screen) => {
    clearFeedback()
    setScreen(targetScreen)
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

  const handleLogout = () => {
    localStorage.removeItem('access_token')
    navigateTo('login')
  }

  if (screen === 'home') {
    return (
      <main className="home-card">
        <h1>duck2p</h1>
        <h2>Hello, World!</h2>
        <button type="button" className="btn-outline" onClick={handleLogout}>
          Sair da conta
        </button>
      </main>
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
