import { useState } from 'react'
import type { LoginForm, RegisterForm, Screen } from '../types'
import { authApi } from '../services/api'

interface AuthCardProps {
  screen: 'login' | 'register'
  onNavigate: (s: Screen) => void
  onLoginSuccess: () => void
  onError: (msg: string) => void
  onSuccess: (msg: string) => void
}

export function AuthCard({
  screen,
  onNavigate,
  onLoginSuccess,
  onError,
  onSuccess,
}: AuthCardProps) {
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
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (
      !registerData.full_name ||
      !registerData.email ||
      !registerData.student_id ||
      !registerData.course ||
      !registerData.password ||
      !confirmPassword
    ) {
      onError('Por favor, preencha todos os campos.')
      return
    }

    if (registerData.password !== confirmPassword) {
      onError('As senhas não coincidem.')
      return
    }

    const hasMinLen = registerData.password.length >= 8
    const hasUpper = /[A-Z]/.test(registerData.password)
    const hasLower = /[a-z]/.test(registerData.password)
    const hasNumber = /[0-9]/.test(registerData.password)
    const hasSymbol = /[^A-Za-z0-9]/.test(registerData.password)

    if (!hasMinLen || !hasUpper || !hasLower || !hasNumber || !hasSymbol) {
      onError(
        'A senha deve ter no mínimo 8 caracteres, com letra maiúscula, minúscula, número e símbolo.'
      )
      return
    }

    setIsLoading(true)
    try {
      await authApi.register(registerData)
      onSuccess('Cadastro realizado com sucesso! Faça seu login.')
      setRegisterData({
        full_name: '',
        email: '',
        student_id: '',
        course: '',
        password: '',
      })
      setConfirmPassword('')
      onNavigate('login')
    } catch (err: unknown) {
      onError(err instanceof Error ? err.message : 'Erro ao realizar cadastro.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!loginData.email || !loginData.password) {
      onError('Por favor, informe e-mail e senha.')
      return
    }

    setIsLoading(true)
    try {
      const data = await authApi.login(loginData)
      localStorage.setItem('access_token', data.access_token)
      setLoginData({ email: '', password: '' })
      onLoginSuccess()
    } catch (err: unknown) {
      onError(err instanceof Error ? err.message : 'Falha na comunicação com o servidor.')
    } finally {
      setIsLoading(false)
    }
  }

  if (screen === 'register') {
    return (
      <main className="auth-card">
        <header className="auth-header">
          <h1>duck2p</h1>
          <p>Criar nova conta de estudante</p>
        </header>

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
            onClick={() => onNavigate('login')}
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
          onClick={() => onNavigate('register')}
        >
          Criar cadastro
        </button>
      </footer>
    </main>
  )
}
