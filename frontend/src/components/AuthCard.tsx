import { useState } from 'react'
import type { LoginForm, RegisterForm, Screen } from '../types'
import { authApi } from '../services/api'
import logoIcon from '../assets/logo_03.svg'

interface AuthCardProps {
  screen: 'login' | 'register'
  onNavigate: (s: Screen) => void
  onLoginSuccess: () => void
  onError: (msg: string) => void
  onSuccess: (msg: string) => void
  errorMessage?: string | null
  successMessage?: string | null
}

export function AuthCard({
  screen,
  onNavigate,
  onLoginSuccess,
  onError,
  onSuccess,
  errorMessage,
  successMessage,
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
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

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

  const eyeIcon = (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )

  const eyeOffIcon = (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  )

  const brandSide = (
    <div className="auth-brand-column">
      <div className="auth-brand-container">
        <div>
          <div className="auth-mascot-wrapper">
            <img src={logoIcon} alt="Duck2P" className="auth-mascot-img" />
          </div>
          <h2 className="auth-brand-headline">Dúvidas de código?</h2>
          <p className="auth-brand-tagline">Transforme o rubber duck debugging em mentoria real no campus.</p>
        </div>

        <div className="auth-pillars">
          <div className="auth-pillar-item">
            <span className="auth-pillar-icon">💬</span>
            <div className="auth-pillar-text">
              <strong>Relate seu problema</strong>
              <span>Descreva sua dúvida de programação em linguagem natural.</span>
            </div>
          </div>
          <div className="auth-pillar-item">
            <span className="auth-pillar-icon">
              <img src={logoIcon} alt="Duck2P" style={{ width: 22, height: 22, objectFit: 'contain', verticalAlign: 'middle' }} />
            </span>
            <div className="auth-pillar-text">
              <strong>O pato te direciona</strong>
              <span>A IA analisa o seu problema e faz o pareamento com o mentor ideal.</span>
            </div>
          </div>
          <div className="auth-pillar-item">
            <span className="auth-pillar-icon">👥</span>
            <div className="auth-pillar-text">
              <strong>Mentoria colaborativa</strong>
              <span>Conecte-se com outros alunos do IFSul para evoluir juntos.</span>
            </div>
          </div>
        </div>

        <div className="auth-brand-footer">
          <span>chmod 777 megabrain • CodeDay 2026 • IFSul Campus Santana do Livramento</span>
        </div>
      </div>
    </div>
  )

  if (screen === 'register') {
    return (
      <div className="auth-page">
        <div className="auth-card-split">
          <main className="auth-form-column">
            <div className="auth-form-container">
              <header className="auth-header">
                <div className="auth-brand-row">
                  <img src={logoIcon} alt="Duck2P" className="auth-logo-icon" />
                  <span className="auth-brand-title">Duck2P</span>
                </div>
                <h1>Criar cadastro</h1>
                <p>Cadastre-se para conectar-se a mentores no campus</p>
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
                    placeholder="Digite seu nome completo"
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
                    placeholder="Digite seu email acadêmico"
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
                    placeholder="Número da sua matrícula"
                    value={registerData.student_id}
                    onChange={(e) =>
                      setRegisterData({ ...registerData, student_id: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="course">Curso (IFSUL)</label>
                  <select
                    id="course"
                    value={registerData.course}
                    onChange={(e) =>
                      setRegisterData({ ...registerData, course: e.target.value })
                    }
                    required
                  >
                    <option value="">Selecione seu curso no IFSul.</option>
                    <option value="Análise e Desenvolvimento de Sistemas">
                      Análise e Desenvolvimento de Sistemas
                    </option>
                    <option value="Técnico em Informática">
                      Técnico em Informática
                    </option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="password">Senha</label>
                  <div className="password-input-wrapper">
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Crie uma senha forte"
                      value={registerData.password}
                      onChange={(e) =>
                        setRegisterData({ ...registerData, password: e.target.value })
                      }
                      required
                    />
                    <button
                      type="button"
                      className="password-toggle-btn"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? 'Ocultar senha' : 'Ver senha'}
                    >
                      {showPassword ? eyeOffIcon : eyeIcon}
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="confirm-password">Confirmar Senha</label>
                  <div className="password-input-wrapper">
                    <input
                      id="confirm-password"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Confirme sua senha"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      className="password-toggle-btn"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      aria-label={showConfirmPassword ? 'Ocultar confirmação de senha' : 'Ver confirmação de senha'}
                    >
                      {showConfirmPassword ? eyeOffIcon : eyeIcon}
                    </button>
                  </div>
                </div>

                <button type="submit" className="btn-primary" disabled={isLoading}>
                  {isLoading ? 'Cadastrando...' : 'Cadastrar'}
                </button>
              </form>

              <footer className="auth-footer">
                <span>Já possui conta?</span>
                <button
                  type="button"
                  className="btn-link"
                  onClick={() => onNavigate('login')}
                >
                  Fazer login
                </button>
              </footer>
            </div>
          </main>

          {brandSide}
        </div>
      </div>
    )
  }

  return (
    <div className="auth-page">
      <div className="auth-card-split">
        <main className="auth-form-column">
          <div className="auth-form-container">
            <header className="auth-header">
              <div className="auth-brand-row">
                <img src={logoIcon} alt="Duck2P" className="auth-logo-icon" />
                <span className="auth-brand-title">Duck2P</span>
              </div>
              <h1>Acessar conta</h1>
              <p>Conecte-se para tirar dúvidas ou mentorar colegas</p>
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
                  placeholder="Digite seu email acadêmico"
                  value={loginData.email}
                  onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="login-password">Senha</label>
                <div className="password-input-wrapper">
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Digite sua senha"
                    value={loginData.password}
                    onChange={(e) =>
                      setLoginData({ ...loginData, password: e.target.value })
                    }
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Ocultar senha' : 'Ver senha'}
                  >
                    {showPassword ? eyeOffIcon : eyeIcon}
                  </button>
                </div>
              </div>

              <button type="submit" className="btn-primary" disabled={isLoading}>
                {isLoading ? 'Entrando...' : 'Entrar'}
              </button>
            </form>

            <footer className="auth-footer">
              <span>Não possui conta?</span>
              <button
                type="button"
                className="btn-link"
                onClick={() => onNavigate('register')}
              >
                Criar cadastro
              </button>
            </footer>
          </div>
        </main>

        {brandSide}
      </div>
    </div>
  )
}
