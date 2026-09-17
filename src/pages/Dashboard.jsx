import { useEffect, useState } from 'react'
import { api } from '../api/client.js'
import { useAuth } from '../auth.jsx'

export default function Dashboard() {
  const { user, logout } = useAuth()
  const [sub, setSub] = useState(null)
  const [scores, setScores] = useState([])
  const [charities, setCharities] = useState([])
  const [entries, setEntries] = useState([])
  const [winnings, setWinnings] = useState([])
  const [newScore, setNewScore] = useState({ value: '', played_on: '' })
  const [error, setError] = useState('')

  const loadAll = () => {
    api.mySubscription().then(setSub).catch(() => {})
    api.myScores().then((d) => setScores(d.results || d)).catch(() => {})
    api.charities().then((d) => setCharities(d.results || d)).catch(() => {})
    api.myDrawEntries().then((d) => setEntries(d.results || d)).catch(() => {})
    api.myWinnings().then((d) => setWinnings(d.results || d)).catch(() => {})
  }

  useEffect(loadAll, [])

  const startSub = async (plan) => {
    await api.startSubscription(plan)
    loadAll()
  }

  const setCharity = async (charityId) => {
    await api.updateSubscription({ charity: charityId, charity_percentage: sub?.charity_percentage || 10 })
    loadAll()
  }

  const setCharityPct = async (pct) => {
    await api.updateSubscription({ charity: sub?.charity, charity_percentage: pct })
    loadAll()
  }

  const addScore = async (e) => {
    e.preventDefault()
    setError('')
    try {
      await api.addScore({ value: Number(newScore.value), played_on: newScore.played_on })
      setNewScore({ value: '', played_on: '' })
      loadAll()
    } catch (err) {
      setError(err.message || 'Could not save that score.')
    }
  }

  const deleteScore = async (id) => {
    await api.deleteScore(id)
    loadAll()
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="brand">digital<em>heroes</em></div>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <span className="muted">{user?.username}</span>
          <button className="btn btn-ghost btn-small" onClick={logout}>Log out</button>
        </div>
      </header>

      <main className="app-body">
        <div className="grid-2">
          <div>
            <div className="card">
              <h3>Subscription</h3>
              {!sub || sub.status !== 'active' ? (
                <>
                  <p className="muted">You're not on an active plan yet.</p>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <button className="btn btn-primary btn-small" onClick={() => startSub('monthly')}>Subscribe monthly</button>
                    <button className="btn btn-secondary btn-small" onClick={() => startSub('yearly')}>Subscribe yearly</button>
                  </div>
                </>
              ) : (
                <>
                  <div className="card-row"><span className="label">Plan</span><span>{sub.plan}</span></div>
                  <div className="card-row"><span className="label">Status</span><span className={`pill pill-${sub.status}`}>{sub.status}</span></div>
                  <div className="card-row"><span className="label">Renews</span><span>{new Date(sub.renews_at).toLocaleDateString()}</span></div>
                  <div className="card-row"><span className="label">Charity</span><span>{sub.charity_name || 'Not chosen'}</span></div>
                  <div className="card-row"><span className="label">Charity share</span><span>{sub.charity_percentage}%</span></div>
                </>
              )}
            </div>

            <div className="card">
              <h3>Your last 5 scores</h3>
              <p className="muted" style={{ marginTop: -8, marginBottom: 16 }}>
                Stableford, 1–45. Adding a 6th score replaces your oldest.
              </p>
              {error && <div className="error-banner">{error}</div>}
              <form className="score-input-row" onSubmit={addScore}>
                <input type="number" min="1" max="45" placeholder="Score" required
                  value={newScore.value} onChange={(e) => setNewScore({ ...newScore, value: e.target.value })} />
                <input type="date" required
                  value={newScore.played_on} onChange={(e) => setNewScore({ ...newScore, played_on: e.target.value })} />
                <button className="btn btn-primary btn-small">Add</button>
              </form>
              <table>
                <thead><tr><th>Date</th><th>Score</th><th></th></tr></thead>
                <tbody>
                  {scores.map((s) => (
                    <tr key={s.id}>
                      <td>{s.played_on}</td>
                      <td>{s.value}</td>
                      <td><button className="btn btn-ghost btn-small" onClick={() => deleteScore(s.id)}>Remove</button></td>
                    </tr>
                  ))}
                  {scores.length === 0 && <tr><td colSpan="3" className="muted">No rounds logged yet.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <div className="card">
              <h3>Choose your charity</h3>
              {charities.map((c) => (
                <div className="card-row" key={c.id}>
                  <span>{c.name}</span>
                  <button
                    className={`btn btn-small ${sub?.charity === c.id ? 'btn-primary' : 'btn-ghost'}`}
                    onClick={() => setCharity(c.id)}
                  >
                    {sub?.charity === c.id ? 'Selected' : 'Choose'}
                  </button>
                </div>
              ))}
              {sub?.charity && (
                <div style={{ marginTop: 16 }}>
                  <label className="muted" style={{ fontSize: 13 }}>Increase your share (min 10%)</label>
                  <div className="score-input-row" style={{ marginTop: 8 }}>
                    <input type="number" min="10" max="100" defaultValue={sub.charity_percentage}
                      onBlur={(e) => setCharityPct(Number(e.target.value))} />
                  </div>
                </div>
              )}
            </div>

            <div className="card">
              <h3>Participation</h3>
              {entries.length === 0 && <p className="muted">No draws entered yet — they run monthly once you're subscribed and have scores logged.</p>}
              {entries.map((e) => (
                <div className="card-row" key={e.id}>
                  <span className="label">Draw #{e.draw}</span>
                  <span>{e.match_count} match{e.match_count === 1 ? '' : 'es'}</span>
                </div>
              ))}
            </div>

            <div className="card">
              <h3>Winnings</h3>
              {winnings.length === 0 && <p className="muted">Nothing won yet — keep logging scores.</p>}
              {winnings.map((w) => (
                <div className="card-row" key={w.id}>
                  <span className="label">{w.draw_label} · {w.match_count}-match</span>
                  <span className={`pill pill-${w.payment_status === 'paid' ? 'approved' : 'pending'}`}>
                    ₹{w.prize_amount} · {w.payment_status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
