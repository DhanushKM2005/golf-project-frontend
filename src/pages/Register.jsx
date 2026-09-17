import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../api/client.js'
import { useAuth } from '../auth.jsx'

export default function Register() {
  const [form, setForm] = useState({ username: '', email: '', password: '' })
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const { refreshUser } = useAuth()

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      const data = await api.register(form)
      localStorage.setItem('dh_tokens', JSON.stringify({ access: data.access, refresh: data.refresh }))
      await refreshUser()
      navigate('/dashboard')
    } catch (err) {
      setError('Registration failed — that username or email may already be taken.')
    }
  }

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={submit}>
        <h1>Create your account</h1>
        <p className="sub">Subscribe, log scores, and pick a charity next.</p>
        {error && <div className="error-banner">{error}</div>}
        <div className="field">
          <label>Username</label>
          <input value={form.username} onChange={set('username')} required />
        </div>
        <div className="field">
          <label>Email</label>
          <input type="email" value={form.email} onChange={set('email')} required />
        </div>
        <div className="field">
          <label>Password</label>
          <input type="password" value={form.password} onChange={set('password')} required />
        </div>
        <button className="btn btn-primary" style={{ width: '100%' }}>Create account</button>
        <div className="switch-link">Already a subscriber? <Link to="/login">Log in</Link></div>
      </form>
    </div>
  )
}
