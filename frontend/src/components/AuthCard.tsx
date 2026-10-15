import { useState, useRef, useEffect } from 'react'
import { gsap } from 'gsap'
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

  const formScopeRef = useRef<HTMLDivElement>(null)
  const brandColumnRef = useRef<HTMLDivElement>(null)
  const brandCardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReduced || !formScopeRef.current) return

    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.auth-anim-item',
        { opacity: 0, y: 14, scale: 0.985 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.42,
          stagger: 0.045,
          ease: 'power3.out',
          clearProps: 'transform,opacity',
        }
      )
    }, formScopeRef)

    return () => ctx.revert()
  }, [screen])

  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const columnEl = brandColumnRef.current
    const cardEl = brandCardRef.current
    if (prefersReduced || !columnEl || !cardEl) return

    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.auth-brand-anim',
        { opacity: 0, y: 18 },
        {
          opacity: 1,
          y: 0,
          duration: 0.55,
          stagger: 0.08,
          ease: 'power3.out',
        }
      )
    }, columnEl)

    const rotateXTo = gsap.quickTo(cardEl, 'rotationX', { duration: 0.5, ease: 'power3.out' })
    const rotateYTo = gsap.quickTo(cardEl, 'rotationY', { duration: 0.5, ease: 'power3.out' })

    const handlePointerMove = (e: PointerEvent) => {
      const rect = columnEl.getBoundingClientRect()
      const relX = (e.clientX - rect.left) / rect.width - 0.5
      const relY = (e.clientY - rect.top) / rect.height - 0.5
      rotateYTo(relX * 5)
      rotateXTo(-relY * 5)
      columnEl.style.setProperty('--spot-x', `${e.clientX - rect.left}px`)
      columnEl.style.setProperty('--spot-y', `${e.clientY - rect.top}px`)
    }

    const handlePointerLeave = () => {
      rotateXTo(0)
      rotateYTo(0)
    }

    columnEl.addEventListener('pointermove', handlePointerMove)
    columnEl.addEventListener('pointerleave', handlePointerLeave)

    return () => {
      columnEl.removeEventListener('pointermove', handlePointerMove)
      columnEl.removeEventListener('pointerleave', handlePointerLeave)
      ctx.revert()
    }
  }, [])

  const hasMinLen = registerData.password.length >= 8
  const hasCase = /[A-Z]/.test(registerData.password) && /[a-z]/.test(registerData.password)
  const hasNumber = /[0-9]/.test(registerData.password)
  const hasSymbol = /[^A-Za-z0-9]/.test(registerData.password)
  const passwordChecksPassed = [hasMinLen, hasCase, hasNumber, hasSymbol].filter(Boolean).length

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

    const hasUpper = /[A-Z]/.test(registerData.password)
    const hasLower = /[a-z]/.test(registerData.password)

    if (!hasMinLen || !hasUpper || !hasLower || !hasNumber || !hasSymbol) {
      onError(
        'A senha deve ter no mínimo 8 caracteres, com letra maiúscula, minúscula, número e símbolo.'
      )
      return
    }

    setIsLoading(true)
    try {
      await authApi.register(registerData)
      onSuccess('Cadastro realizado com sucesso. Faça seu login.')
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

  const handleDemoLogin = async () => {
    setIsLoading(true)
    try {
      const data = await authApi.login({
        email: 'bernardo@academico.ifsul.edu.br',
        password: 'Demo@2026',
      })
      localStorage.setItem('access_token', data.access_token)
      onLoginSuccess()
    } catch (err: unknown) {
      onError(err instanceof Error ? err.message : 'Falha ao iniciar modo demonstração.')
    } finally {
      setIsLoading(false)
    }
  }

  const eyeIcon = (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )

  const eyeOffIcon = (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  )

  const arrowIcon = (
    <span className="btn-trailing-circle" aria-hidden="true">
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 12h14" />
        <path d="m12 5 7 7-7 7" />
      </svg>
    </span>
  )

  const brandSide = (
    <aside className="auth-brand-column" ref={brandColumnRef} aria-label="Apresentação institucional Duck2P">
      <div className="auth-brand-spotlight" aria-hidden="true" />
      <div className="auth-brand-container" ref={brandCardRef}>
        <div className="auth-brand-hero auth-brand-anim">
          <div className="auth-mascot-shell">
            <div className="auth-mascot-wrapper">
              <img src={logoIcon} alt="Mascote Duck2P" className="auth-mascot-img" />
            </div>
          </div>
          <div className="auth-brand-status-pill">
            <span className="status-dot-pulse" />
            <span>Pareamento Semântico Ativo • IFSul</span>
          </div>
          <h2 className="auth-brand-headline">
            Dúvidas de código? Depure com IA e mentores reais.
          </h2>
          <p className="auth-brand-tagline">
            Transforme o rubber duck debugging solitário em mentoria colaborativa guiada por Inteligência Artificial no campus.
          </p>
        </div>

        <div className="auth-pillars">
          <div className="auth-pillar-shell auth-brand-anim">
            <div className="auth-pillar-item">
              <span className="auth-pillar-icon" aria-hidden="true">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="16 18 22 12 16 6" />
                  <polyline points="8 6 2 12 8 18" />
                </svg>
              </span>
              <div className="auth-pillar-text">
                <strong>Relate seu problema</strong>
                <span>Descreva sua dúvida ou erro de compilação em linguagem natural.</span>
              </div>
              <span className="auth-pillar-step">01</span>
            </div>
          </div>

          <div className="auth-pillar-shell auth-brand-anim">
            <div className="auth-pillar-item">
              <span className="auth-pillar-icon" aria-hidden="true">
                <img src={logoIcon} alt="" style={{ width: 22, height: 22, objectFit: 'contain' }} />
              </span>
              <div className="auth-pillar-text">
                <strong>O pato analisa e direciona</strong>
                <span>Embeddings vetoriais conectam sua questão ao veterano com maior afinidade.</span>
              </div>
              <span className="auth-pillar-step">02</span>
            </div>
          </div>

          <div className="auth-pillar-shell auth-brand-anim">
            <div className="auth-pillar-item">
              <span className="auth-pillar-icon" aria-hidden="true">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </span>
              <div className="auth-pillar-text">
                <strong>Mentoria peer-to-peer</strong>
                <span>Sala de chat em tempo real com briefing pedagógico gerado para o mentor.</span>
              </div>
              <span className="auth-pillar-step">03</span>
            </div>
          </div>
        </div>

        <div className="auth-brand-footer auth-brand-anim">
          <span className="auth-footer-mono">chmod 777 megabrain</span>
          <span className="auth-footer-dot" aria-hidden="true">•</span>
          <span>CodeDay 2026 • IFSul Santana do Livramento</span>
        </div>
      </div>
    </aside>
  )

  return (
    <div className="auth-page">
      <div className="auth-card-split">
        <main className="auth-form-column" ref={formScopeRef}>
          <div className="auth-form-shell">
            <div className="auth-form-container">
              <header className="auth-header auth-anim-item">
                <div className="auth-brand-row">
                  <div className="auth-logo-badge">
                    <img src={logoIcon} alt="Duck2P" className="auth-logo-icon" />
                  </div>
                  <span className="auth-brand-title">Duck2P</span>
                </div>

                <div className="auth-mode-switcher" role="tablist" aria-label="Alternar entre login e cadastro">
                  <button
                    type="button"
                    role="tab"
                    aria-selected={screen === 'login'}
                    className={'auth-mode-tab ' + (screen === 'login' ? 'active' : '')}
                    onClick={() => onNavigate('login')}
                  >
                    Entrar
                  </button>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={screen === 'register'}
                    className={'auth-mode-tab ' + (screen === 'register' ? 'active' : '')}
                    onClick={() => onNavigate('register')}
                  >
                    Criar conta
                  </button>
                </div>

                <h1>{screen === 'register' ? 'Criar cadastro acadêmico' : 'Acessar sua conta'}</h1>
                <p>
                  {screen === 'register'
                    ? 'Cadastre-se para conectar-se a mentores voluntários no campus'
                    : 'Conecte-se para tirar dúvidas de código ou mentorar colegas'}
                </p>
              </header>

              {errorMessage && (
                <div className="alert-message alert-error auth-anim-item" role="alert">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  <span>{errorMessage}</span>
                </div>
              )}
              {successMessage && (
                <div className="alert-message alert-success auth-anim-item" role="status">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span>{successMessage}</span>
                </div>
              )}

              {screen === 'register' ? (
                <form className="auth-form" onSubmit={handleRegister}>
                  <div className="form-group auth-anim-item">
                    <label htmlFor="full_name">Nome Completo</label>
                    <input
                      id="full_name"
                      type="text"
                      placeholder="Ex.: Ana Carolina Ferreira"
                      value={registerData.full_name}
                      onChange={(e) =>
                        setRegisterData({ ...registerData, full_name: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className="form-row-2col auth-anim-item">
                    <div className="form-group">
                      <label htmlFor="email">E-mail Acadêmico</label>
                      <input
                        id="email"
                        type="email"
                        placeholder="seu.nome@academico.ifsul.edu.br"
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
                        placeholder="Ex.: 202610482"
                        value={registerData.student_id}
                        onChange={(e) =>
                          setRegisterData({ ...registerData, student_id: e.target.value })
                        }
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group auth-anim-item">
                    <label htmlFor="course">Curso (IFSul)</label>
                    <select
                      id="course"
                      value={registerData.course}
                      onChange={(e) =>
                        setRegisterData({ ...registerData, course: e.target.value })
                      }
                      required
                    >
                      <option value="">Selecione seu curso no IFSul</option>
                      <option value="Análise e Desenvolvimento de Sistemas">
                        Análise e Desenvolvimento de Sistemas
                      </option>
                      <option value="Técnico em Informática">
                        Técnico em Informática
                      </option>
                    </select>
                  </div>

                  <div className="form-group auth-anim-item">
                    <label htmlFor="password">Senha</label>
                    <div className="password-input-wrapper">
                      <input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Mínimo 8 caracteres, letras, número e símbolo"
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
                    {registerData.password.length > 0 && (
                      <div className="password-strength-meter" aria-live="polite">
                        <div className="password-strength-bars">
                          {[1, 2, 3, 4].map((level) => (
                            <span
                              key={level}
                              className={
                                'strength-bar ' +
                                (passwordChecksPassed >= level
                                  ? passwordChecksPassed === 4
                                    ? 'strong'
                                    : 'medium'
                                  : '')
                              }
                            />
                          ))}
                        </div>
                        <span className="password-strength-label">
                          {passwordChecksPassed === 4
                            ? 'Senha segura nos padrões acadêmicos'
                            : 'Use 8+ dígitos, maiúscula, minúscula, número e símbolo'}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="form-group auth-anim-item">
                    <label htmlFor="confirm-password">Confirmar Senha</label>
                    <div className="password-input-wrapper">
                      <input
                        id="confirm-password"
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="Repita a senha criada"
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

                  <button type="submit" className="btn-primary btn-island auth-anim-item" disabled={isLoading}>
                    <span>{isLoading ? 'Criando conta...' : 'Concluir cadastro'}</span>
                    {arrowIcon}
                  </button>
                </form>
              ) : (
                <form className="auth-form" onSubmit={handleLogin}>
                  <div className="form-group auth-anim-item">
                    <label htmlFor="login-email">E-mail Acadêmico</label>
                    <input
                      id="login-email"
                      type="email"
                      placeholder="Digite seu e-mail institucional"
                      value={loginData.email}
                      onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group auth-anim-item">
                    <label htmlFor="login-password">Senha</label>
                    <div className="password-input-wrapper">
                      <input
                        id="login-password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Digite sua senha de acesso"
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

                  <button type="submit" className="btn-primary btn-island auth-anim-item" disabled={isLoading}>
                    <span>{isLoading ? 'Autenticando...' : 'Entrar na plataforma'}</span>
                    {arrowIcon}
                  </button>
                </form>
              )}

              <div className="auth-demo-box auth-anim-item">
                <button
                  type="button"
                  className="btn-demo-access"
                  onClick={handleDemoLogin}
                  disabled={isLoading}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                  </svg>
                  <span>Acesso Rápido Demo (CodeDay IFSul)</span>
                </button>
              </div>

              <footer className="auth-footer auth-anim-item">
                <span>{screen === 'register' ? 'Já possui conta?' : 'Ainda não tem cadastro?'}</span>
                <button
                  type="button"
                  className="btn-link"
                  onClick={() => onNavigate(screen === 'register' ? 'login' : 'register')}
                >
                  {screen === 'register' ? 'Fazer login' : 'Criar conta gratuita'}
                </button>
              </footer>
            </div>
          </div>
        </main>

        {brandSide}
      </div>
    </div>
  )
}

