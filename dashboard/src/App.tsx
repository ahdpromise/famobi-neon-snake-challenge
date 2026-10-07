import { useEffect, useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import './App.css'

type SessionResult = 'completed' | 'failed' | 'left'

interface GameplaySession {
  sessionId: string
  level: number
  startedAt: number
  endedAt: number
  result: SessionResult
  score: number
  progress: number
  durationMs: number
}

const API_URL = 'http://localhost:3000/analytics/sessions'

const resultColors: Record<SessionResult, string> = {
  completed: '#22c55e',
  failed: '#ef4444',
  left: '#f59e0b',
}

function App() {
  const [sessions, setSessions] = useState<GameplaySession[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const controller = new AbortController()

    async function loadSessions() {
      try {
        const response = await fetch(API_URL, {
          signal: controller.signal,
        })

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`)
        }

        const data: { sessions: GameplaySession[] } =
          await response.json()

        if (!Array.isArray(data.sessions)) {
          throw new Error('Invalid API response')
        }

        setSessions(data.sessions)
        setError(null)
      } catch (error) {
        if (controller.signal.aborted) return

        setError(
          error instanceof Error
            ? error.message
            : 'Unable to load analytics',
        )
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false)
        }
      }
    }

    void loadSessions()

    return () => controller.abort()
  }, [])

  const totalSessions = sessions.length

  const completedSessions = sessions.filter(
    (session) => session.result === 'completed',
  ).length

  const completionRate = totalSessions
    ? Math.round((completedSessions / totalSessions) * 100)
    : 0

  const averageScore = totalSessions
    ? Math.round(
        sessions.reduce(
          (sum, session) => sum + session.score,
          0,
        ) / totalSessions,
      )
    : 0

  const averageDuration = totalSessions
    ? Math.round(
        sessions.reduce(
          (sum, session) => sum + session.durationMs,
          0,
        ) /
          totalSessions /
          1000,
      )
    : 0

  const resultsData = (
    ['completed', 'failed', 'left'] as const
  ).map((result) => ({
    name: result,
    value: sessions.filter(
      (session) => session.result === result,
    ).length,
    color: resultColors[result],
  }))

  const levels = [...new Set(sessions.map(
    (session) => session.level,
  ))].sort((a, b) => a - b)

  const levelData = levels.map((level) => {
    const levelSessions = sessions.filter(
      (session) => session.level === level,
    )

    return {
      level: `Level ${level}`,
      averageScore: Math.round(
        levelSessions.reduce(
          (sum, session) => sum + session.score,
          0,
        ) / levelSessions.length,
      ),
    }
  })

  return (
    <main className="dashboard">
      <header className="dashboard-header">
        <div>
          <p className="eyebrow">NEON SNAKE</p>
          <h1>Gameplay Analytics</h1>
          <p className="subtitle">
            Session insights from the local Firebase emulator
          </p>
        </div>
        <span className="environment-label">Local Dashboard</span>
      </header>

      {loading && <p className="status">Loading analytics...</p>}

      {error && (
        <p className="status error" role="alert">
          Could not load analytics: {error}
        </p>
      )}

      {!loading && !error && (
        <>
          <section className="stats-grid" aria-label="Overview">
            <article className="stat-card">
              <span>Total Sessions</span>
              <strong>{totalSessions}</strong>
            </article>

            <article className="stat-card">
              <span>Completion Rate</span>
              <strong>{completionRate}%</strong>
            </article>

            <article className="stat-card">
              <span>Average Score</span>
              <strong>{averageScore}</strong>
            </article>

            <article className="stat-card">
              <span>Average Duration</span>
              <strong>{averageDuration}s</strong>
            </article>
          </section>

          {totalSessions === 0 ? (
            <section className="chart-card">
              <h2>No sessions yet</h2>
              <p>Play Neon Snake to generate analytics data.</p>
            </section>
          ) : (
            <section className="charts-grid">
              <article className="chart-card">
                <h2>Session Outcomes</h2>
                <p>Completed, failed and abandoned runs</p>

                <div className="chart-container">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={resultsData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        label
                      >
                        {resultsData.map((item) => (
                          <Cell
                            key={item.name}
                            fill={item.color}
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="legend">
                  {resultsData.map((item) => (
                    <span key={item.name}>
                      <i
                        style={{
                          backgroundColor: item.color,
                        }}
                      />
                      {item.name}: {item.value}
                    </span>
                  ))}
                </div>
              </article>

              <article className="chart-card">
                <h2>Average Score by Level</h2>
                <p>Mean score across recorded sessions</p>

                <div className="chart-container">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={levelData}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                      />
                      <XAxis dataKey="level" />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Bar
                        dataKey="averageScore"
                        name="Average Score"
                        fill="#6366f1"
                        radius={[6, 6, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </article>
            </section>
          )}
        </>
      )}
    </main>
  )
}

export default App