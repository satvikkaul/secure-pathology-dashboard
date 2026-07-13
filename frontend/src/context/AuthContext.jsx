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
  // True only in the window between finishing onboarding and being approved, so
  // the wall can greet a brand-new user ("Request Received") differently from a
  // returning unapproved one. Kept in context (not router state) because
  // OnboardingPage's own redirect would otherwise drop a location-state flag.
  const [justOnboarded, setJustOnboarded] = useState(false)

  // Derived, never mirrored in state, so it can't desync from the loaded profile.
  const onboardingCompleted = profile?.onboarding_completed ?? false
  const isApproved = profile?.is_approved ?? false
  const isAdmin = profile?.is_admin ?? false

  // getMe() success = valid token. getProfile() is fetched separately: a
  // getProfile() failure keeps the user logged in but flags profileError, so a
  // transient 500 does NOT get misread as "not onboarded" and misroute them.
  async function loadSession() {
    setJustOnboarded(false) // a fresh login is never "just onboarded"
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
    setJustOnboarded(false)
  }

  // Profile-mutating endpoints (PUT /me, POST lock-org) return the full updated
  // profile, so callers apply it directly instead of issuing a second GET that
  // could fail on its own and desync the UI.
  function applyProfile(p) {
    setProfile(p)
    setProfileError(false)
  }

  // OnboardingPage calls this right after saving, so the wall shows the
  // brand-new-user wording. Cleared on the next login/logout.
  const markJustOnboarded = () => setJustOnboarded(true)

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
        isApproved,
        isAdmin,
        justOnboarded,
        login,
        logout,
        applyProfile,
        markJustOnboarded,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
