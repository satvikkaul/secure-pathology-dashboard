import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function OnboardingGuard({ children }) {
  const { isLoading, onboardingCompleted } = useAuth()
  if (isLoading) return null
  if (!onboardingCompleted) return <Navigate to="/onboarding" replace />
  return children
}

export default OnboardingGuard
