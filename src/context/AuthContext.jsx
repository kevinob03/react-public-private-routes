import { createContext, useContext, useEffect, useState } from 'react'

const AuthContext = createContext(null)
const SESSION_KEY = 'coursehub_session'
const VALID_ROLES = ['usuario', 'admin']

export function AuthProvider({ children }) {
  const [authStatus, setAuthStatus] = useState('checking')
  const [user, setUser] = useState(null)

  useEffect(() => {
    const verificationTimer = setTimeout(() => {
      try {
        const savedSession = JSON.parse(localStorage.getItem(SESSION_KEY))
        const hasValidSession = savedSession?.isAuthenticated === true
          && savedSession.user?.email
          && VALID_ROLES.includes(savedSession.user.role)

        if (hasValidSession) {
          setUser(savedSession.user)
          setAuthStatus('authenticated')
        } else {
          localStorage.removeItem(SESSION_KEY)
          setAuthStatus('unauthenticated')
        }
      } catch {
        localStorage.removeItem(SESSION_KEY)
        setAuthStatus('unauthenticated')
      }
    }, 0)

    return () => clearTimeout(verificationTimer)
  }, [])

  function login({ email, role }) {
    const authenticatedUser = { email, role }
    localStorage.setItem(SESSION_KEY, JSON.stringify({
      isAuthenticated: true,
      user: authenticatedUser,
    }))
    setUser(authenticatedUser)
    setAuthStatus('authenticated')
  }

  function logout() {
    localStorage.removeItem(SESSION_KEY)
    setUser(null)
    setAuthStatus('unauthenticated')
  }

  const isAuthenticated = authStatus === 'authenticated'

  return (
    <AuthContext.Provider value={{ authStatus, isAuthenticated, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth debe utilizarse dentro de AuthProvider')
  return context
}
