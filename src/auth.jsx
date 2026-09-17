import { createContext, useContext, useEffect, useState } from 'react'
import { api, clearTokens } from './api/client.js'

const AuthCtx = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const refreshUser = async () => {
    const hasTokens = localStorage.getItem('dh_tokens')
    if (!hasTokens) { setUser(null); setLoading(false); return }
    try {
      const me = await api.me()
      setUser(me)
    } catch {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { refreshUser() }, [])

  const logout = () => { clearTokens(); setUser(null) }

  return (
    <AuthCtx.Provider value={{ user, loading, refreshUser, logout }}>
      {children}
    </AuthCtx.Provider>
  )
}

export const useAuth = () => useContext(AuthCtx)
