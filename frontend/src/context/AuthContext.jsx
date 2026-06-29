import { createContext, useContext, useState, useEffect } from 'react'
import { getMe } from '../api/auth'
import { getProfile } from '../api/profile'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('token'))
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [onboardingCompleted, setOnboardingCompleted] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Any API call that gets a 401 dispatches this event. Clear state so
  // ProtectedRoute redirects to /login without needing a page refresh.
  useEffect(() => {
    function handleUnauthorized() {
      setToken(null)
      setUser(null)
      setProfile(null)
      setOnboardingCompleted(false)
    }
    window.addEventListener('auth:unauthorized', handleUnauthorized)
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized)
  }, [])

  // On mount: validate any existing token. Fetch identity + onboarding status together.
  useEffect(() => {
    if (!token) {
      setIsLoading(false)
      return
    }
    // getMe() failure = stale/invalid token → clear it.
    // getProfile() failure is non-fatal: default to false so the user lands on /onboarding.
    getMe()
      .then((me) => {
        setUser(me)
        return getProfile().catch(() => null)
      })
      .then((p) => {
        setProfile(p)
        setOnboardingCompleted(p?.onboarding_completed ?? false)
      })
      .catch(() => {
        localStorage.removeItem('token')
        setToken(null)
      })
      .finally(() => setIsLoading(false))
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  function login(newToken) {
    localStorage.setItem('token', newToken)
    setToken(newToken)
    return getMe()
      .then((me) => {
        setUser(me)
        return getProfile().catch(() => null)
      })
      .then((p) => {
        setProfile(p)
        setOnboardingCompleted(p?.onboarding_completed ?? false)
      })
  }

  function logout() {
    localStorage.removeItem('token')
    setToken(null)
    setUser(null)
    setProfile(null)
    setOnboardingCompleted(false)
  }

  function refreshProfile() {
    return getProfile().then((p) => {
      setProfile(p)
      setOnboardingCompleted(p.onboarding_completed)
    })
  }

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        profile,
        isAuthenticated: !!user,
        isLoading,
        onboardingCompleted,
        login,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
