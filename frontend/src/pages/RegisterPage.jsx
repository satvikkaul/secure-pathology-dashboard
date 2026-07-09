import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { register } from '../api/auth'
import './auth.css'

function RegisterPage() {
  const navigate = useNavigate()

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)

    if (!fullName.trim()) {
      setError('Full name is required.')
      return
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setIsSubmitting(true)
    try {
      await register(fullName.trim(), email, password)
      navigate('/login', { state: { registered: true } })
    } catch (err) {
      setError(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <h1 className="auth-title">Secure Pathology Dashboard</h1>
          <p className="auth-subtitle">Create Account</p>
        </div>

        {error && <p className="auth-error" role="alert">{error}</p>}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-field">
            <label className="auth-label" htmlFor="fullName">Full Name</label>
            <input
              className="auth-input"
              id="fullName"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              autoComplete="name"
              placeholder="Dr. Jane Doe"
            />
          </div>

          <div className="auth-field">
            <label className="auth-label" htmlFor="email">Email</label>
            <input
              className="auth-input"
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              placeholder="you@institution.edu"
            />
          </div>

          <div className="auth-field">
            <label className="auth-label" htmlFor="password">Password</label>
            <input
              className="auth-input"
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="new-password"
              placeholder="••••••••"
            />
            <span className="auth-hint">Minimum 8 characters</span>
          </div>

          <div className="auth-field">
            <label className="auth-label" htmlFor="confirmPassword">Confirm Password</label>
            <input
              className="auth-input"
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              autoComplete="new-password"
              placeholder="••••••••"
            />
          </div>

          <button className="auth-btn" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Creating account…' : 'Create Account'}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>

      <p className="auth-notice">Prototype only — not for clinical use</p>
    </div>
  )
}

export default RegisterPage
