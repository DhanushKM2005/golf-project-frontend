import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../api/client.js'
import { useAuth } from '../auth.jsx'

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const { refreshUser } = useAuth()

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      await api.login({ username, password })
      await refreshUser()
      navigate('/dashboard')
    } catch (err) {
      setError('Could not log in. Check your username and password.')
    }
  }

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={submit}>
        <h1>Welcome back</h1>
        <p className="sub">Log in to your Digital Heroes account.</p>
        {error && <div className="error-banner">{error}</div>}
        <div className="field">
          <label>Username</label>
          <input value={username} onChange={(e) => setUsername(e.target.value)} required />
        </div>
        <div className="field">
          <label>Password</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        <button className="btn btn-primary" style={{ width: '100%' }}>Log in</button>
        <div className="switch-link">No account yet? <Link to="/register">Join now</Link></div>
      </form>
    </div>
  )
}
