import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { reapply } from '../api/profile'
import './auth.css'

// The wall shown to anyone who is not approved. Three wordings:
//  - declined: the admin's reason, plus a Re-apply button that puts them back in
//    the queue. The reason is shown here rather than only emailed, because the
//    decision email is still a stubbed log line (see routers/admin.py).
//  - justOnboarded (from context, set by OnboardingPage): a brand-new user who
//    just submitted their professional context — "request placed, watch inbox".
//  - otherwise (a returning pending user): "still waiting, contact the admin".
function AccountStatusPage() {
  const { profile, logout, justOnboarded, isDeclined, decisionReason, applyProfile } = useAuth()
  const [submitting, setSubmitting] = useState(false)
  const [reapplied, setReapplied] = useState(false)
  const [error, setError] = useState('')

  async function handleReapply() {
    setSubmitting(true)
    setError('')
    try {
      // The response is the updated profile, so apply it directly — this page
      // re-renders into the pending wording without a second fetch.
      applyProfile(await reapply())
      setReapplied(true)
    } catch (err) {
      setError(err.message || 'Could not submit your request. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  let title = 'Awaiting Approval'
  if (isDeclined) title = 'Request Declined'
  else if (reapplied) title = 'Request Re-submitted'
  else if (justOnboarded) title = 'Request Received'

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <h1 className="auth-title">{title}</h1>
          <p className="auth-subtitle">Secure Pathology Dashboard</p>
        </div>

        {isDeclined ? (
          <>
            <p className="auth-banner auth-banner--neutral">
              An administrator reviewed your request and did not approve it.
            </p>

            {decisionReason && (
              <div
                style={{
                  background: 'var(--c-warning-bg, #fff1d6)',
                  color: 'var(--c-warning, #7a4b00)',
                  borderRadius: '6px',
                  padding: '0.85rem 1rem',
                  margin: '0.25rem 0 1rem',
                  fontSize: '0.95rem',
                  lineHeight: 1.6,
                }}
              >
                <strong style={{ display: 'block', marginBottom: '0.25rem' }}>Reason given</strong>
                {decisionReason}
              </div>
            )}

            <p style={{ color: 'var(--c-text-muted, #555)', fontSize: '0.95rem', lineHeight: 1.6 }}>
              You can update your professional context on your profile and submit your request
              again. Re-applying returns your account to the review queue, and you will not be
              able to sign in again until an administrator has reviewed it. If anything is
              unclear, please contact the administrator.
            </p>

            {error && <p className="auth-error">{error}</p>}

            <button
              className="auth-btn"
              type="button"
              onClick={handleReapply}
              disabled={submitting}
              style={{ marginTop: '1.25rem' }}
            >
              {submitting ? 'Submitting…' : 'Re-apply for Access'}
            </button>
          </>
        ) : reapplied ? (
          <>
            <p className="auth-banner">
              Your request has been sent back to the administrator for review.
            </p>
            <p style={{ color: 'var(--c-text-muted, #555)', fontSize: '0.95rem', lineHeight: 1.6 }}>
              The earlier decision no longer applies. You will not be able to sign in again
              until an administrator has reviewed your account, so please watch your inbox
              {profile?.email ? ` (${profile.email})` : ''} for their reply.
            </p>
          </>
        ) : justOnboarded ? (
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
            <p className="auth-banner">Your account is still waiting on administrator approval.</p>
            <p style={{ color: 'var(--c-text-muted, #555)', fontSize: '0.95rem', lineHeight: 1.6 }}>
              You cannot sign in to the dashboard until your account is approved. If this is
              taking longer than expected, please contact the administrator.
            </p>
          </>
        )}

        <button
          className="auth-btn"
          type="button"
          onClick={logout}
          // Demoted to secondary only when Re-apply is present and should lead.
          style={
            isDeclined
              ? {
                  marginTop: '0.6rem',
                  background: 'transparent',
                  color: 'var(--c-text-muted, #555)',
                  border: '1px solid var(--c-border, #e5e7eb)',
                }
              : { marginTop: '1.25rem' }
          }
        >
          Sign Out
        </button>
      </div>

      <p className="auth-notice">Prototype only — not for clinical use</p>
    </div>
  )
}

export default AccountStatusPage
