import { useEffect, useRef, useState } from 'react'
import AppLayout from '../components/AppLayout'
import { listUsers, decideUser } from '../api/admin'
import './DashboardPage.css'
import './AdminPage.css'

const FILTERS = ['all', 'pending', 'approved', 'declined']

const BADGE_CLASS = {
  pending: 'dash-badge--pending',
  approved: 'dash-badge--completed',
  declined: 'dash-badge--failed',
}

function AdminPage() {
  const [users, setUsers] = useState(null) // null = loading
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('all')
  // { email, fullName, decision } — the decision awaiting a reason.
  const [target, setTarget] = useState(null)
  const [reason, setReason] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const dialogRef = useRef(null)

  useEffect(() => {
    listUsers()
      .then(setUsers)
      .catch((err) => setError(err.message || 'Could not load the user list.'))
  }, [])

  // A native <dialog> needs showModal() for its backdrop, focus trap, and Escape
  // handling; rendering it open from JSX gets none of those.
  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (target && !dialog.open) dialog.showModal()
    if (!target && dialog.open) dialog.close()
  }, [target])

  function openDecision(user, decision) {
    setReason('')
    setError('')
    setTarget({ email: user.email, fullName: user.full_name, decision })
  }

  async function handleConfirm(event) {
    event.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      const updated = await decideUser(target.email, target.decision, reason.trim())
      // The response is the updated user, so patch the row instead of refetching.
      setUsers((list) => list.map((u) => (u.email === updated.email ? updated : u)))
      setTarget(null)
    } catch (err) {
      setError(err.message || 'Could not record the decision.')
    } finally {
      setSubmitting(false)
    }
  }

  const declining = target?.decision === 'declined'
  const shown = users?.filter((u) => filter === 'all' || u.status === filter) ?? []
  const countFor = (f) =>
    f === 'all' ? users?.length ?? 0 : users?.filter((u) => u.status === f).length ?? 0

  return (
    <AppLayout pageTitle="Admin" pageSub="User accounts and access decisions">
      <div className="dash-body">
        <div className="dash-card">
          <div className="ad-toolbar" role="group" aria-label="Filter users by status">
            {FILTERS.map((f) => (
              <button
                key={f}
                type="button"
                className="ad-filter"
                aria-pressed={filter === f}
                onClick={() => setFilter(f)}
              >
                <span style={{ textTransform: 'capitalize' }}>{f}</span>
                <span className="ad-filter-count">{countFor(f)}</span>
              </button>
            ))}
          </div>

          {error && !target && <p className="dash-error ad-scoped-error">{error}</p>}

          {users === null ? (
            <p className="ad-empty">Loading…</p>
          ) : shown.length === 0 ? (
            <p className="ad-empty">
              {users.length === 0 ? 'No user accounts yet.' : `No ${filter} accounts.`}
            </p>
          ) : (
            <ul className="ad-list">
              {shown.map((u) => {
                const meta = [u.role, u.department, u.employee_id && `ID ${u.employee_id}`]
                  .filter(Boolean)
                  .join(' · ')
                return (
                  <li key={u.id} className="ad-row">
                    <div className="ad-row-main">
                      <div className="ad-name-line">
                        <span className="ad-name">{u.full_name}</span>
                        <span className={`dash-badge ${BADGE_CLASS[u.status]}`}>{u.status}</span>
                      </div>

                      <span className="ad-email">{u.email}</span>

                      <p className="ad-meta">
                        {[u.organization_name, meta].filter(Boolean).join(' · ')}
                        {!u.onboarding_completed && (
                          <span className="ad-meta-flag">
                            Has not submitted their professional context yet
                          </span>
                        )}
                      </p>

                      {u.intended_use && (
                        <p className="ad-context">
                          <span className="ad-context-label">Intended use</span>
                          {u.intended_use}
                        </p>
                      )}

                      {u.status === 'declined' && u.decision_reason && (
                        <p className="ad-reason">
                          <span className="ad-reason-label">Reason given</span>
                          {u.decision_reason}
                        </p>
                      )}
                    </div>

                    <div className="ad-actions">
                      {u.status !== 'approved' && (
                        <button
                          type="button"
                          // Filled only while a decision is still owed. Reversing
                          // a settled decline is deliberate, not the default act.
                          className={`ad-btn ${
                            u.status === 'pending' ? 'ad-btn--primary' : 'ad-btn--quiet'
                          }`}
                          onClick={() => openDecision(u, 'approved')}
                        >
                          Approve
                        </button>
                      )}
                      {u.status !== 'declined' && (
                        <button
                          type="button"
                          className="ad-btn ad-btn--quiet ad-btn--danger"
                          onClick={() => openDecision(u, 'declined')}
                        >
                          {u.status === 'approved' ? 'Revoke' : 'Decline'}
                        </button>
                      )}
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </div>

      {/* The reason prompt doubles as the confirmation step, so revoking someone's
          access cannot happen on a single stray click. */}
      <dialog
        ref={dialogRef}
        className="ad-dialog"
        aria-labelledby="ad-dialog-title"
        onClose={() => setTarget(null)}
      >
        {target && (
          <form className="ad-dialog-form" onSubmit={handleConfirm}>
            <h2 className="ad-dialog-title" id="ad-dialog-title">
              {declining ? 'Decline' : 'Approve'} {target.fullName}?
            </h2>
            <p className="ad-dialog-note">
              {declining
                ? 'They will still be able to sign in, read this reason, and re-apply. Their organisation details unlock so they can correct them.'
                : 'They get access to the dashboard immediately.'}
            </p>

            <label className="ad-label" htmlFor="ad-reason">
              Reason{' '}
              <span className="ad-label-opt">{declining ? '(required)' : '(optional)'}</span>
            </label>
            <textarea
              id="ad-reason"
              className="ad-textarea"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={4}
              maxLength={1000}
              autoFocus
              required={declining}
              placeholder={
                declining
                  ? 'What does the applicant need to correct before re-applying?'
                  : 'Optional note included with the approval.'
              }
            />
            <p className="ad-hint">This is sent to the applicant, so write it for them to read.</p>

            {error && <p className="dash-error" style={{ marginTop: 12, marginBottom: 0 }}>{error}</p>}

            <div className="ad-dialog-actions">
              <button
                type="button"
                className="ad-btn ad-btn--quiet"
                onClick={() => setTarget(null)}
              >
                Cancel
              </button>
              <button
                type="submit"
                className={`ad-btn ${declining ? 'ad-btn--solid-danger' : 'ad-btn--primary'}`}
                disabled={submitting || (declining && !reason.trim())}
              >
                {submitting ? 'Saving…' : declining ? 'Decline account' : 'Approve account'}
              </button>
            </div>
          </form>
        )}
      </dialog>
    </AppLayout>
  )
}

export default AdminPage
