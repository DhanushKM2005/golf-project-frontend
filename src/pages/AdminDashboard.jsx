import { useEffect, useState } from 'react'
import { api } from '../api/client.js'
import { useAuth } from '../auth.jsx'

const TABS = ['Users', 'Draws', 'Charities', 'Winners', 'Reports']

export default function AdminDashboard() {
  const { logout } = useAuth()
  const [tab, setTab] = useState('Users')

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="brand">digital<em>heroes</em> · admin</div>
        <button className="btn btn-ghost btn-small" onClick={logout}>Log out</button>
      </header>
      <main className="app-body">
        <div className="tabs">
          {TABS.map((t) => (
            <div key={t} className={`tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>{t}</div>
          ))}
        </div>
        {tab === 'Users' && <UsersPanel />}
        {tab === 'Draws' && <DrawsPanel />}
        {tab === 'Charities' && <CharitiesPanel />}
        {tab === 'Winners' && <WinnersPanel />}
        {tab === 'Reports' && <ReportsPanel />}
      </main>
    </div>
  )
}

function UsersPanel() {
  const [users, setUsers] = useState([])
  useEffect(() => { api.adminUsers().then((d) => setUsers(d.results || d)) }, [])
  return (
    <div className="card">
      <h3>All users</h3>
      <table>
        <thead><tr><th>Username</th><th>Email</th><th>Role</th></tr></thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id}><td>{u.username}</td><td>{u.email}</td><td>{u.role}</td></tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function DrawsPanel() {
  const [draws, setDraws] = useState([])
  const [form, setForm] = useState({ month: '', year: '', draw_type: 'random' })
  const [preview, setPreview] = useState(null)

  const load = () => api.adminDraws().then((d) => setDraws(d.results || d))
  useEffect(load, [])

  const create = async (e) => {
    e.preventDefault()
    await api.createDraw({ month: Number(form.month), year: Number(form.year), draw_type: form.draw_type })
    setForm({ month: '', year: '', draw_type: 'random' })
    load()
  }

  const simulate = async (id) => {
    const result = await api.simulateDraw(id)
    setPreview({ id, result })
  }

  const publish = async (id) => {
    await api.publishDraw(id)
    setPreview(null)
    load()
  }

  return (
    <>
      <div className="card">
        <h3>Create a draw</h3>
        <form className="score-input-row" onSubmit={create}>
          <input type="number" placeholder="Month (1-12)" required value={form.month}
            onChange={(e) => setForm({ ...form, month: e.target.value })} />
          <input type="number" placeholder="Year" required value={form.year}
            onChange={(e) => setForm({ ...form, year: e.target.value })} />
          <select value={form.draw_type} onChange={(e) => setForm({ ...form, draw_type: e.target.value })}>
            <option value="random">Random</option>
            <option value="algorithmic">Algorithmic</option>
          </select>
          <button className="btn btn-primary btn-small">Create</button>
        </form>
      </div>

      <div className="card">
        <h3>Draws</h3>
        <table>
          <thead><tr><th>Month/Year</th><th>Type</th><th>Status</th><th>Pool</th><th></th></tr></thead>
          <tbody>
            {draws.map((d) => (
              <tr key={d.id}>
                <td>{d.month}/{d.year}</td>
                <td>{d.draw_type}</td>
                <td><span className={`pill ${d.status === 'published' ? 'pill-approved' : 'pill-pending'}`}>{d.status}</span></td>
                <td>{d.total_pool ? `₹${d.total_pool}` : '—'}</td>
                <td style={{ display: 'flex', gap: 8 }}>
                  <button className="btn btn-ghost btn-small" onClick={() => simulate(d.id)}>Simulate</button>
                  <button className="btn btn-primary btn-small" onClick={() => publish(d.id)}>Publish</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {preview && (
        <div className="card">
          <h3>Simulation preview — draw #{preview.id}</h3>
          <div className="card-row"><span className="label">Winning numbers</span><span>{preview.result.winning_numbers.join(', ')}</span></div>
          <div className="card-row"><span className="label">Total pool</span><span>₹{preview.result.total_pool}</span></div>
          {Object.entries(preview.result.winners_by_tier).map(([tier, names]) => (
            <div className="card-row" key={tier}>
              <span className="label">{tier}-match winners</span>
              <span>{names.length ? names.join(', ') : 'None — rolls over' }</span>
            </div>
          ))}
        </div>
      )}
    </>
  )
}

function CharitiesPanel() {
  const [charities, setCharities] = useState([])
  const [form, setForm] = useState({ name: '', description: '' })

  const load = () => api.adminCharities().then((d) => setCharities(d.results || d))
  useEffect(load, [])

  const create = async (e) => {
    e.preventDefault()
    await api.createCharity(form)
    setForm({ name: '', description: '' })
    load()
  }

  return (
    <>
      <div className="card">
        <h3>Add a charity</h3>
        <form className="score-input-row" onSubmit={create}>
          <input placeholder="Name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <input placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <button className="btn btn-primary btn-small">Add</button>
        </form>
      </div>
      <div className="card">
        <h3>Charity directory</h3>
        {charities.map((c) => (
          <div className="card-row" key={c.id}><span>{c.name}</span><span className="muted">{c.subscribers_count ?? ''}</span></div>
        ))}
      </div>
    </>
  )
}

function WinnersPanel() {
  const [winners, setWinners] = useState([])
  const load = () => api.adminWinners().then((d) => setWinners(d.results || d))
  useEffect(load, [])

  const review = async (id, review_status) => { await api.reviewWinner(id, { review_status }); load() }
  const markPaid = async (id) => { await api.reviewWinner(id, { payment_status: 'paid' }); load() }

  return (
    <div className="card">
      <h3>Winner verification</h3>
      <table>
        <thead><tr><th>User</th><th>Draw</th><th>Match</th><th>Prize</th><th>Review</th><th>Payment</th><th></th></tr></thead>
        <tbody>
          {winners.map((w) => (
            <tr key={w.id}>
              <td>{w.username}</td>
              <td>{w.draw_label}</td>
              <td>{w.match_count}</td>
              <td>₹{w.prize_amount}</td>
              <td><span className={`pill pill-${w.review_status}`}>{w.review_status}</span></td>
              <td><span className={`pill pill-${w.payment_status === 'paid' ? 'approved' : 'pending'}`}>{w.payment_status}</span></td>
              <td style={{ display: 'flex', gap: 6 }}>
                <button className="btn btn-ghost btn-small" onClick={() => review(w.id, 'approved')}>Approve</button>
                <button className="btn btn-ghost btn-small" onClick={() => review(w.id, 'rejected')}>Reject</button>
                <button className="btn btn-primary btn-small" onClick={() => markPaid(w.id)}>Mark paid</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function ReportsPanel() {
  const [report, setReport] = useState(null)
  useEffect(() => { api.reports().then(setReport) }, [])
  if (!report) return <p className="muted">Loading…</p>
  return (
    <div className="card">
      <h3>Platform reports</h3>
      <div className="card-row"><span className="label">Total users</span><span>{report.total_users}</span></div>
      <div className="card-row"><span className="label">Active subscribers</span><span>{report.active_subscribers}</span></div>
      <div className="card-row"><span className="label">Draws published</span><span>{report.draws_published}</span></div>
      <div className="card-row"><span className="label">Total prize pool paid</span><span>₹{report.total_prize_pool_paid_out}</span></div>
      <h3 style={{ marginTop: 20 }}>Charity totals</h3>
      {report.charity_contribution_totals.map((c) => (
        <div className="card-row" key={c.charity}>
          <span className="label">{c.charity}</span>
          <span>{c.subscriber_count} subscribers · ₹{c.estimated_total}</span>
        </div>
      ))}
    </div>
  )
}
