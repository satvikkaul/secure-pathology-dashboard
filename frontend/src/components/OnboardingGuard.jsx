import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function OnboardingGuard({ children }) {
  const { isLoading, onboardingCompleted, profileError } = useAuth()
  if (isLoading) return null
  // Profile couldn't load: don't guess onboarding status (guessing "false" would
  // misroute onboarded/locked users to /onboarding). Offer a reload instead.
  if (profileError) {
    return (
      <div className="dash-error" style={{ padding: '2rem', textAlign: 'center' }}>
        <p>Couldn’t load your profile.</p>
        <button type="button" onClick={() => window.location.reload()}>Retry</button>
      </div>
    )
  }
  if (!onboardingCompleted) return <Navigate to="/onboarding" replace />
  return children
}

export default OnboardingGuard
