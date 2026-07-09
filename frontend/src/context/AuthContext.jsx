import { createContext, useContext, useState, useEffect } from 'react'
import { getMe } from '../api/auth'
import { getProfile } from '../api/profile'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('token'))
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [profileError, setProfileError] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Derived, never mirrored in state, so it can't desync from the loaded profile.
  const onboardingCompleted = profile?.onboarding_completed ?? false

  // getMe() success = valid token. getProfile() is fetched separately: a
  // getProfile() failure keeps the user logged in but flags profileError, so a
  // transient 500 does NOT get misread as "not onboarded" and misroute them.
  async function loadSession() {
    const me = await getMe() // throws → caller treats token as stale
    setUser(me)
    try {
      setProfile(await getProfile())
      setProfileError(false)
    } catch {
      setProfileError(true)
    }
  }

  // Any API call that gets a 401 dispatches this event. Clear state so
  // ProtectedRoute redirects to /login without needing a page refresh.
  useEffect(() => {
    function handleUnauthorized() {
      setToken(null)
      setUser(null)
      setProfile(null)
      setProfileError(false)
    }
    window.addEventListener('auth:unauthorized', handleUnauthorized)
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized)
  }, [])

  // On mount: validate any existing token and load identity + profile.
  useEffect(() => {
    if (!token) {
      setIsLoading(false)
      return
    }
    loadSession()
      .catch(() => {
        localStorage.removeItem('token')
        setToken(null)
      })
      .finally(() => setIsLoading(false))
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  function login(newToken) {
    localStorage.setItem('token', newToken)
    setToken(newToken)
    return loadSession()
  }

  function logout() {
    localStorage.removeItem('token')
    setToken(null)
    setUser(null)
    setProfile(null)
    setProfileError(false)
  }

  // Profile-mutating endpoints (PUT /me, POST lock-org) return the full updated
  // profile, so callers apply it directly instead of issuing a second GET that
  // could fail on its own and desync the UI.
  function applyProfile(p) {
    setProfile(p)
    setProfileError(false)
  }

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        profile,
        profileError,
        isAuthenticated: !!user,
        isLoading,
        onboardingCompleted,
        login,
        logout,
        applyProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
