import { useAuth } from '../context/AuthContext'
import '../pages/auth.css'

// The wall shown until an admin approves the account. Two wordings:
//  - justOnboarded (from context, set by OnboardingPage): a brand-new user who
//    just submitted their professional context — "request placed, watch inbox".
//  - otherwise (a returning unapproved user signing in): "still waiting on
//    approval, contact the admin".
function PendingApprovalPage() {
  const { profile, logout, justOnboarded } = useAuth()

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <h1 className="auth-title">{justOnboarded ? 'Request Received' : 'Awaiting Approval'}</h1>
          <p className="auth-subtitle">Secure Pathology Dashboard</p>
        </div>

        {justOnboarded ? (
          <>
            <p className="auth-banner">
              Your registration is complete and a request has been placed with the administrator.
            </p>
            <p style={{ color: 'var(--c-text-muted, #555)', fontSize: '0.95rem', lineHeight: 1.6 }}>
              You do not have dashboard access yet. Please watch your inbox
              {profile?.email ? ` (${profile.email})` : ''} for a confirmation email once an
              administrator approves your account.
            </p>
          </>
        ) : (
          <>
            <p className="auth-banner">
              Your account is still waiting on administrator approval.
            </p>
            <p style={{ color: 'var(--c-text-muted, #555)', fontSize: '0.95rem', lineHeight: 1.6 }}>
              You cannot sign in to the dashboard until your account is approved. If this is
              taking longer than expected, please contact the administrator.
            </p>
          </>
        )}

        <button className="auth-btn" type="button" onClick={logout} style={{ marginTop: '1.25rem' }}>
          Sign Out
        </button>
      </div>

      <p className="auth-notice">Prototype only — not for clinical use</p>
    </div>
  )
}

export default PendingApprovalPage
