import { createContext, useContext, useState, useEffect } from 'react'
import { getMe } from '../api/auth'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('token'))
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  // On mount: validate any existing token by calling /auth/me.
  // If it fails the token is stale — clear it so ProtectedRoute redirects correctly.
  useEffect(() => {
    if (!token) {
      setIsLoading(false)
      return
    }
    getMe()
      .then(setUser)
      .catch(() => {
        localStorage.removeItem('token')
        setToken(null)
      })
      .finally(() => setIsLoading(false))
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  function login(newToken) {
    localStorage.setItem('token', newToken)
    setToken(newToken)
    return getMe().then(setUser)
  }

  function logout() {
    localStorage.removeItem('token')
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider
      value={{ token, user, isAuthenticated: !!user, isLoading, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
