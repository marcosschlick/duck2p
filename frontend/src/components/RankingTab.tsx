import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import type { MentorLeaderboardItem } from '../types'

interface RankingTabProps {
  leaderboard: MentorLeaderboardItem[]
  isLoading?: boolean
}

function MedalSvg({ rank }: { rank: 1 | 2 | 3 }) {
  const colors = {
    1: { fill: '#FACC15', stroke: '#CA8A04', ribbon: '#73030D' },
    2: { fill: '#E2E8F0', stroke: '#64748B', ribbon: '#475569' },
    3: { fill: '#FDBA74', stroke: '#C2410C', ribbon: '#9A3412' },
  }[rank]

  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className="podium-medal-svg"
    >
      <path
        d="M7.21 15 2.66 7.14a2 2 0 0 1 .13-2.2L4.4 2.8A2 2 0 0 1 6 2h12a2 2 0 0 1 1.6.8l1.6 2.14a2 2 0 0 1 .14 2.2L16.79 15"
        stroke={colors.ribbon}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M11 12 5.12 2.2" stroke={colors.ribbon} strokeWidth="1.75" strokeLinecap="round" />
      <path d="m13 12 5.88-9.8" stroke={colors.ribbon} strokeWidth="1.75" strokeLinecap="round" />
      <circle
        cx="12"
        cy="17"
        r="5"
        fill={colors.fill}
        stroke={colors.stroke}
        strokeWidth="2"
      />
      <path
        d="M12 15v4"
        stroke={colors.stroke}
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function RankingTab({ leaderboard, isLoading }: RankingTabProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  const getCleanSkills = (rawSkills: string) => {
    return rawSkills
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0 && s.length < 35)
      .slice(0, 4)
  }

  const topThree = leaderboard.slice(0, 3)

  const firstPlace = topThree[0]
  const secondPlace = topThree[1]
  const thirdPlace = topThree[2]

  useEffect(() => {
    if (isLoading || leaderboard.length === 0 || !containerRef.current) return
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReduced) return

    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.podium-card',
        { y: 24, opacity: 0, scale: 0.96 },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 0.52,
          stagger: 0.08,
          ease: 'back.out(1.25)',
          clearProps: 'transform,opacity',
        }
      )

      gsap.fromTo(
        '.leaderboard-row',
        { y: 10, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.36,
          stagger: 0.04,
          delay: 0.15,
          ease: 'power2.out',
          clearProps: 'transform,opacity',
        }
      )

      const pointNodes = containerRef.current?.querySelectorAll<HTMLElement>('[data-points-target]')
      pointNodes?.forEach((node) => {
        const targetVal = Number(node.getAttribute('data-points-target') || '0')
        const counter = { val: 0 }
        gsap.to(counter, {
          val: targetVal,
          duration: 0.9,
          ease: 'power3.out',
          onUpdate: () => {
            node.textContent = String(Math.round(counter.val))
          },
        })
      })
    }, containerRef)

    return () => ctx.revert()
  }, [isLoading, leaderboard])

  return (
    <div className="tab-container" ref={containerRef}>
      <div className="dashboard-card-shell">
        <section className="dashboard-card leaderboard-card">
          <header className="card-header leaderboard-header">
            <div className="leaderboard-header-badge">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
                <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
                <path d="M4 22h16" />
                <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
                <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
                <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
              </svg>
              <span>Gamificação IFSUL</span>
            </div>
            <h2>Quadro de Honra dos Mentores</h2>
            <p>
              Reconhecimento comunitário aos alunos voluntários que compartilham conhecimento e apoiam calouros.
            </p>
          </header>

          {isLoading ? (
            <div className="loading-state-container">
              <div className="spinner-loader" />
              <p>Carregando classificação dos mentores...</p>
            </div>
          ) : leaderboard.length === 0 ? (
            <div className="empty-state-card">
              <div className="empty-state-icon" aria-hidden="true">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
                  <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
                  <path d="M4 22h16" />
                  <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
                  <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
                  <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
                </svg>
              </div>
              <h3>Nenhum mentor pontuado ainda</h3>
              <p>Seja o primeiro a se cadastrar e ajudar colegas no campus!</p>
            </div>
          ) : (
            <>
              {topThree.length > 0 && (
                <div className="podium-container" aria-label="Pódio dos três melhores mentores">
                  {secondPlace && (
                    <div className="podium-card podium-rank-2">
                      <div className="podium-medal-crown">
                        <span className="podium-medal-pill silver-medal">2º Lugar</span>
                        <MedalSvg rank={2} />
                      </div>
                      <div className="podium-avatar-ring silver-ring">
                        <span>{secondPlace.full_name.charAt(0).toUpperCase()}</span>
                      </div>
                      <h3 className="podium-name">{secondPlace.full_name}</h3>
                      <span className="podium-course">{secondPlace.course}</span>
                      <div className="podium-stats-row">
                        <span className="podium-level-tag">Nível {secondPlace.level}</span>
                        <span className="podium-points-tag">
                          <strong data-points-target={secondPlace.points}>{secondPlace.points}</strong> pts
                        </span>
                      </div>
                      <div className="podium-atendimentos-text">
                        {secondPlace.mentorships_completed} {secondPlace.mentorships_completed === 1 ? 'atendimento' : 'atendimentos'}
                      </div>
                      <div className="podium-skills-wrap">
                        {getCleanSkills(secondPlace.skills).map((skill) => (
                          <span key={skill} className="podium-skill-chip">{skill}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {firstPlace && (
                    <div className="podium-card podium-rank-1">
                      <div className="podium-crown-badge">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="#EAB308" stroke="#CA8A04" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14" />
                        </svg>
                      </div>
                      <div className="podium-medal-crown">
                        <span className="podium-medal-pill gold-medal">1º Lugar</span>
                        <MedalSvg rank={1} />
                      </div>
                      <div className="podium-avatar-ring gold-ring">
                        <span>{firstPlace.full_name.charAt(0).toUpperCase()}</span>
                      </div>
                      <h3 className="podium-name">{firstPlace.full_name}</h3>
                      <span className="podium-course">{firstPlace.course}</span>
                      <div className="podium-stats-row">
                        <span className="podium-level-tag gold-tag">Nível {firstPlace.level}</span>
                        <span className="podium-points-tag gold-points">
                          <strong data-points-target={firstPlace.points}>{firstPlace.points}</strong> pts
                        </span>
                      </div>
                      <div className="podium-atendimentos-text">
                        {firstPlace.mentorships_completed} {firstPlace.mentorships_completed === 1 ? 'atendimento' : 'atendimentos'}
                      </div>
                      <div className="podium-skills-wrap">
                        {getCleanSkills(firstPlace.skills).map((skill) => (
                          <span key={skill} className="podium-skill-chip gold-chip">{skill}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {thirdPlace && (
                    <div className="podium-card podium-rank-3">
                      <div className="podium-medal-crown">
                        <span className="podium-medal-pill bronze-medal">3º Lugar</span>
                        <MedalSvg rank={3} />
                      </div>
                      <div className="podium-avatar-ring bronze-ring">
                        <span>{thirdPlace.full_name.charAt(0).toUpperCase()}</span>
                      </div>
                      <h3 className="podium-name">{thirdPlace.full_name}</h3>
                      <span className="podium-course">{thirdPlace.course}</span>
                      <div className="podium-stats-row">
                        <span className="podium-level-tag">Nível {thirdPlace.level}</span>
                        <span className="podium-points-tag">
                          <strong data-points-target={thirdPlace.points}>{thirdPlace.points}</strong> pts
                        </span>
                      </div>
                      <div className="podium-atendimentos-text">
                        {thirdPlace.mentorships_completed} {thirdPlace.mentorships_completed === 1 ? 'atendimento' : 'atendimentos'}
                      </div>
                      <div className="podium-skills-wrap">
                        {getCleanSkills(thirdPlace.skills).map((skill) => (
                          <span key={skill} className="podium-skill-chip">{skill}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="leaderboard-table-section">
                <div className="leaderboard-table-title-row">
                  <span className="table-section-title">Classificação Geral dos Mentores</span>
                  <span className="table-section-count">{leaderboard.length} mentores ativos</span>
                </div>

                <div className="leaderboard-table-wrapper">
                  <table className="leaderboard-table">
                    <thead>
                      <tr>
                        <th className="th-rank">Posição</th>
                        <th className="th-mentor">Mentor</th>
                        <th className="th-course">Curso</th>
                        <th className="th-level">Nível</th>
                        <th className="th-points">Pontos</th>
                        <th className="th-completed">Atendimentos</th>
                      </tr>
                    </thead>
                    <tbody>
                      {leaderboard.map((mentor, index) => {
                        const rank = index + 1
                        const isTopThree = rank <= 3
                        const skills = getCleanSkills(mentor.skills)
                        return (
                          <tr key={mentor.user_id} className={'leaderboard-row' + (isTopThree ? ' row-highlight-' + rank : '')}>
                            <td className="td-rank">
                              <span className={'rank-pill rank-' + rank}>
                                {rank <= 3 ? (
                                  <>
                                    <MedalSvg rank={rank as 1 | 2 | 3} />
                                    <span>{rank}º</span>
                                  </>
                                ) : (
                                  '#' + rank
                                )}
                              </span>
                            </td>
                            <td className="td-mentor">
                              <div className="mentor-name-cell">
                                <div className="mentor-name-avatar-row">
                                  <span className="mentor-cell-avatar">
                                    {mentor.full_name.charAt(0).toUpperCase()}
                                  </span>
                                  <span className="mentor-fullname">{mentor.full_name}</span>
                                </div>
                                {skills.length > 0 && (
                                  <div className="mentor-skills-tags">
                                    {skills.map((skill) => (
                                      <span key={skill} className="skill-pill">
                                        {skill}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="td-course">{mentor.course}</td>
                            <td className="td-level">
                              <span className="badge-level">Nível {mentor.level}</span>
                            </td>
                            <td className="td-points">
                              <span className="points-badge">
                                <strong data-points-target={mentor.points}>{mentor.points}</strong> pts
                              </span>
                            </td>
                            <td className="td-completed">
                              <span className="completed-badge">
                                {mentor.mentorships_completed}
                              </span>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  )
}
