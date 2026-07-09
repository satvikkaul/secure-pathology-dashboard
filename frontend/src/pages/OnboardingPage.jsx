import { useState } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { updateProfile } from '../api/profile'
import './OnboardingPage.css'

// Must stay in sync with backend AllowedRole in backend/app/schemas.py — a
// mismatch here 422s the onboarding submit.
const ROLES = ['Physician', 'Pathologist', 'Researcher', 'Lab Staff', 'Student / Trainee', 'Other']

function OnboardingPage() {
  const { profile, onboardingCompleted, applyProfile } = useAuth()
  const navigate = useNavigate()

  // Prefill from any already-saved values so a stray resubmit can't null them out.
  const [role, setRole] = useState(profile?.role ?? '')
  const [orgName, setOrgName] = useState(profile?.organization_name ?? '')
  const [orgId, setOrgId] = useState(profile?.organization_id ?? '')
  const [employeeId, setEmployeeId] = useState(profile?.employee_id ?? '')
  const [department, setDepartment] = useState(profile?.department ?? '')
  const [intendedUse, setIntendedUse] = useState(profile?.intended_use ?? '')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Already onboarded users have no business here — this page's submit would
  // overwrite their profile. Send them to the dashboard.
  if (onboardingCompleted) return <Navigate to="/dashboard" replace />

  async function handleSubmit(e) {
    e.preventDefault()
    if (!role) return
    setError('')
    setIsSubmitting(true)
    try {
      const updated = await updateProfile({
        role,
        organization_name: orgName || null,
        organization_id: orgId || null,
        employee_id: employeeId || null,
        department: department || null,
        intended_use: intendedUse || null,
      })
      applyProfile(updated)
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setError(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="ob-page">
      <div className="ob-card">
        <div className="ob-header">
          <h1 className="ob-title">Professional Context</h1>
          <span className="ob-subtitle">Prototype Onboarding</span>
        </div>

        <form className="ob-form" onSubmit={handleSubmit} noValidate>
          {error && <div className="ob-error">{error}</div>}

          <div className="ob-field">
            <label className="ob-label" htmlFor="ob-role">
              Role / User Type <span style={{ color: 'var(--c-error, #b91c1c)' }}>*</span>
            </label>
            <select
              id="ob-role"
              className="ob-select"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              required
            >
              <option value="">Select your role…</option>
              {ROLES.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>

          <div>
            <p className="ob-section-label">Organization Details <span className="ob-label-hint">(optional)</span></p>
            <div className="ob-grid">
              <div className="ob-field">
                <label className="ob-label" htmlFor="ob-org-name">Organization Name</label>
                <input
                  id="ob-org-name"
                  className="ob-input"
                  type="text"
                  placeholder="Hospital, lab, university…"
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                />
              </div>
              <div className="ob-field">
                <label className="ob-label" htmlFor="ob-department">Department</label>
                <input
                  id="ob-department"
                  className="ob-input"
                  type="text"
                  placeholder="e.g. Pathology, Research"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                />
              </div>
              <div className="ob-field">
                <label className="ob-label" htmlFor="ob-org-id">Organization ID</label>
                <input
                  id="ob-org-id"
                  className="ob-input"
                  type="text"
                  value={orgId}
                  onChange={(e) => setOrgId(e.target.value)}
                />
              </div>
              <div className="ob-field">
                <label className="ob-label" htmlFor="ob-employee-id">Employee / Staff ID</label>
                <input
                  id="ob-employee-id"
                  className="ob-input"
                  type="text"
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="ob-field">
            <label className="ob-label" htmlFor="ob-intended-use">
              Intended Use <span className="ob-label-hint">(optional)</span>
            </label>
            <textarea
              id="ob-intended-use"
              className="ob-textarea"
              placeholder="e.g. research, prototype testing, education…"
              value={intendedUse}
              onChange={(e) => setIntendedUse(e.target.value)}
            />
          </div>

          <div className="ob-notice">
            This information is collected for accountability and future access-control planning.
            It does not verify credentials or grant clinical access.
            Prototype only — not for clinical use.
          </div>

          <button
            type="submit"
            className="ob-btn"
            disabled={!role || isSubmitting}
          >
            {isSubmitting ? 'Saving…' : 'Continue to Dashboard'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default OnboardingPage
