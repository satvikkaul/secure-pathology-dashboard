import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { lockOrg } from '../api/profile'
import AppLayout from '../components/AppLayout'
import './ProfilePage.css'

function formatDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleString(undefined, {
    month: 'short', day: 'numeric', year: 'numeric',
  })
}

const ACCOUNT_FIELDS = [
  ['Full Name',    (p) => p.full_name],
  ['Email',        (p) => p.email],
  ['Role',         (p) => p.role],
  ['Member Since', (p) => formatDate(p.created_at)],
]

// Labels mapped to profile keys for the editable org section
const ORG_FIELDS = [
  { label: 'Organization',        key: 'organization_name' },
  { label: 'Department',          key: 'department' },
  { label: 'Employee / Staff ID', key: 'employee_id' },
  { label: 'Intended Use',        key: 'intended_use' },
  { label: 'Organization ID',     key: 'organization_id' },
]

function emptyForm(profile) {
  return {
    organization_name: profile?.organization_name ?? '',
    department:        profile?.department        ?? '',
    employee_id:       profile?.employee_id       ?? '',
    intended_use:      profile?.intended_use      ?? '',
    organization_id:   profile?.organization_id   ?? '',
  }
}

function ProfilePage() {
  const { profile, isLoading, refreshProfile } = useAuth()

  // 'idle' | 'editing' | 'confirming'
  const [mode, setMode]         = useState('idle')
  const [form, setForm]         = useState({})
  const [error, setError]       = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  function startEdit() {
    setForm(emptyForm(profile))
    setError('')
    setMode('editing')
  }

  function cancelEdit() {
    setMode('idle')
    setError('')
  }

  function handleChange(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function handleReview(e) {
    e.preventDefault()
    setMode('confirming')
  }

  function handleBack() {
    setMode('editing')
  }

  async function handleConfirm() {
    setError('')
    setIsSubmitting(true)
    try {
      const payload = {
        organization_name: form.organization_name || null,
        department:        form.department        || null,
        employee_id:       form.employee_id       || null,
        intended_use:      form.intended_use      || null,
        organization_id:   form.organization_id   || null,
      }
      await lockOrg(payload)
      await refreshProfile()
      setMode('idle')
    } catch (err) {
      setError(err.message)
      setMode('editing')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AppLayout pageTitle="My Profile" pageSub="Account and professional context">
      <main className="pf-body">
        {isLoading && <p className="dash-loading">Loading…</p>}

        {profile && (
          <>
            <span className="pf-eyebrow">Account</span>
            <h1 className="pf-title">My Profile</h1>
            <p className="pf-subtitle">
              Account information is read-only. Organisation context can be confirmed once and
              locked permanently.
            </p>

            <div className="pf-cards">

              {/* ── Account Information (always read-only) ─────────────────── */}
              <div className="dash-card">
                <div className="dash-card-header">
                  <span className="dash-card-title">Account Information</span>
                </div>
                <dl className="pf-dl">
                  {ACCOUNT_FIELDS.map(([label, get]) => (
                    <div key={label} className="pf-row">
                      <dt className="pf-key">{label}</dt>
                      <dd className="pf-val">
                        {get(profile) || <span className="pf-empty">—</span>}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>

              {/* ── Professional Context ───────────────────────────────────── */}
              <div className="dash-card">
                <div className="pf-card-hd dash-card-header">
                  <span className="dash-card-title">Professional Context</span>
                  {profile.org_fields_locked && (
                    <span className="pf-lock-badge">Locked</span>
                  )}
                  {!profile.org_fields_locked && mode === 'idle' && (
                    <button type="button" className="pf-edit-btn" onClick={startEdit}>
                      Edit
                    </button>
                  )}
                </div>

                {/* LOCKED — read-only + admin note */}
                {profile.org_fields_locked && (
                  <>
                    <dl className="pf-dl">
                      {ORG_FIELDS.map(({ label, key }) => (
                        <div key={key} className="pf-row">
                          <dt className="pf-key">{label}</dt>
                          <dd className="pf-val">
                            {profile[key] || <span className="pf-empty">—</span>}
                          </dd>
                        </div>
                      ))}
                    </dl>
                    <p className="pf-admin-note">
                      These details are locked. To request a change, email{' '}
                      <a href="mailto:admin@secure-pathology-dashboard.local" className="pf-admin-link">
                        the administrator
                      </a>
                      .
                    </p>
                  </>
                )}

                {/* IDLE — read-only, not yet locked */}
                {!profile.org_fields_locked && mode === 'idle' && (
                  <dl className="pf-dl">
                    {ORG_FIELDS.map(({ label, key }) => (
                      <div key={key} className="pf-row">
                        <dt className="pf-key">{label}</dt>
                        <dd className="pf-val">
                          {profile[key] || <span className="pf-empty">—</span>}
                        </dd>
                      </div>
                    ))}
                  </dl>
                )}

                {/* EDITING */}
                {mode === 'editing' && (
                  <form className="pf-form-body" onSubmit={handleReview} noValidate>
                    {error && <p className="pf-error">{error}</p>}
                    <div className="pf-form-grid">
                      <div className="pf-field">
                        <label className="pf-label" htmlFor="pf-org-name">Organization</label>
                        <input
                          id="pf-org-name"
                          className="pf-input"
                          type="text"
                          placeholder="Hospital, lab, university…"
                          value={form.organization_name}
                          onChange={(e) => handleChange('organization_name', e.target.value)}
                        />
                      </div>
                      <div className="pf-field">
                        <label className="pf-label" htmlFor="pf-dept">Department</label>
                        <input
                          id="pf-dept"
                          className="pf-input"
                          type="text"
                          placeholder="e.g. Pathology, Research"
                          value={form.department}
                          onChange={(e) => handleChange('department', e.target.value)}
                        />
                      </div>
                      <div className="pf-field">
                        <label className="pf-label" htmlFor="pf-emp-id">Employee / Staff ID</label>
                        <input
                          id="pf-emp-id"
                          className="pf-input"
                          type="text"
                          value={form.employee_id}
                          onChange={(e) => handleChange('employee_id', e.target.value)}
                        />
                      </div>
                      <div className="pf-field">
                        <label className="pf-label" htmlFor="pf-org-id">
                          Organization ID <span className="pf-label-optional">(optional)</span>
                        </label>
                        <input
                          id="pf-org-id"
                          className="pf-input"
                          type="text"
                          value={form.organization_id}
                          onChange={(e) => handleChange('organization_id', e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="pf-field">
                      <label className="pf-label" htmlFor="pf-intended-use">
                        Intended Use <span className="pf-label-optional">(optional)</span>
                      </label>
                      <textarea
                        id="pf-intended-use"
                        className="pf-textarea"
                        placeholder="e.g. research, prototype testing, education…"
                        value={form.intended_use}
                        onChange={(e) => handleChange('intended_use', e.target.value)}
                      />
                    </div>
                    <div className="pf-actions">
                      <button type="button" className="pf-btn-ghost" onClick={cancelEdit}>
                        Cancel
                      </button>
                      <button type="submit" className="pf-btn-primary">
                        Review &amp; Confirm
                      </button>
                    </div>
                  </form>
                )}

                {/* CONFIRMING */}
                {mode === 'confirming' && (
                  <div className="pf-form-body">
                    <div className="pf-confirm-warn">
                      Once confirmed, these details will be permanently locked. To request
                      future changes you will need to contact the administrator.
                    </div>
                    <dl className="pf-dl pf-dl--confirm">
                      {ORG_FIELDS.map(({ label, key }) => (
                        <div key={key} className="pf-row">
                          <dt className="pf-key">{label}</dt>
                          <dd className="pf-val">
                            {form[key] || <span className="pf-empty">—</span>}
                          </dd>
                        </div>
                      ))}
                    </dl>
                    {error && <p className="pf-error">{error}</p>}
                    <div className="pf-actions">
                      <button
                        type="button"
                        className="pf-btn-ghost"
                        onClick={handleBack}
                        disabled={isSubmitting}
                      >
                        Go back
                      </button>
                      <button
                        type="button"
                        className="pf-btn-primary"
                        onClick={handleConfirm}
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? 'Saving…' : 'Confirm & Lock'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <p className="pf-notice">
              Prototype only — not for clinical use. This profile is not credential-verified
              and does not grant clinical access.
            </p>
          </>
        )}
      </main>
    </AppLayout>
  )
}

export default ProfilePage
