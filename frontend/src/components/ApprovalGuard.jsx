import { useAuth } from '../context/AuthContext'
import AccountStatusPage from '../pages/AccountStatusPage'

// Sits inside OnboardingGuard (onboarding already ensured). Blocks the dashboard
// until an admin approves the account. Backend enforces the same via
// get_approved_user — this is just the user-facing wall. Pending and declined
// both land here; AccountStatusPage picks the wording.
function ApprovalGuard({ children }) {
  const { isLoading, isApproved, profileError } = useAuth()
  if (isLoading) return null
  if (profileError) return children // OnboardingGuard already renders the profile-load error
  if (!isApproved) return <AccountStatusPage />
  return children
}

export default ApprovalGuard
