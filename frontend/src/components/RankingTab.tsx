import type { MentorLeaderboardItem } from '../types'

interface RankingTabProps {
  leaderboard: MentorLeaderboardItem[]
  isLoading?: boolean
}

export function RankingTab({ leaderboard, isLoading }: RankingTabProps) {
  return (
    <div className="tab-container">
      <section className="dashboard-card">
        <header className="card-header">
          <h2>Ranking da Comunidade</h2>
          <p>
            Mentores voluntários do IFSUL reconhecidos pelo engajamento e qualidade nas mentorias.
          </p>
        </header>

        {isLoading ? (
          <p className="empty-state">Carregando classificação dos mentores...</p>
        ) : leaderboard.length === 0 ? (
          <p className="empty-state">Nenhum mentor registrado no ranking até o momento.</p>
        ) : (
          <div className="leaderboard-table-wrapper">
            <table className="leaderboard-table">
              <thead>
                <tr>
                  <th className="th-rank">Posição</th>
                  <th className="th-mentor">Mentor</th>
                  <th className="th-course">Curso</th>
                  <th className="th-level">Nível</th>
                  <th className="th-points">Pontuação</th>
                  <th className="th-completed">Atendimentos</th>
                  <th className="th-rating">Avaliação</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((mentor, index) => {
                  const rank = index + 1
                  const isPodium = rank <= 3
                  return (
                    <tr key={mentor.user_id} className={isPodium ? 'podium-row podium-' + rank : ''}>
                      <td className="td-rank">
                        <span className={'rank-badge rank-' + rank}>
                          {rank === 1 ? '1º 🥇' : rank === 2 ? '2º 🥈' : rank === 3 ? '3º 🥉' : rank + 'º'}
                        </span>
                      </td>
                      <td className="td-mentor">
                        <div className="mentor-name-cell">
                          <span className="mentor-fullname">{mentor.full_name}</span>
                          <span className="mentor-skills-preview">{mentor.skills}</span>
                        </div>
                      </td>
                      <td className="td-course">{mentor.course}</td>
                      <td className="td-level">
                        <span className="badge-level">Nível {mentor.level}</span>
                      </td>
                      <td className="td-points">
                        <strong>{mentor.points}</strong> pts
                      </td>
                      <td className="td-completed">{mentor.mentorships_completed}</td>
                      <td className="td-rating">
                        <span className="rating-pill">
                          ★ {mentor.average_rating ? mentor.average_rating.toFixed(1) : '5.0'}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}
