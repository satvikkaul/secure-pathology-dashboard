import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { login as apiLogin } from '../api/auth'
import { useAuth } from '../context/AuthContext'
import './auth.css'

function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const justRegistered = location.state?.registered === true

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)
    try {
      const { access_token } = await apiLogin(email, password)
      await login(access_token)
      navigate('/dashboard')
    } catch (err) {
      // Never reveal why login failed — not whether the email exists, nor the
      // password policy. Any bad-credentials/validation failure (401/422) gets
      // the same generic line. Only unexpected infra errors surface otherwise.
      const badLogin = err.status === 401 || err.status === 422
      setError(badLogin ? 'Incorrect email or password.' : 'Something went wrong. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <h1 className="auth-title">Secure Pathology Dashboard</h1>
          <p className="auth-subtitle">Research Prototype</p>
        </div>

        {justRegistered && (
          <p className="auth-banner">Account created. Sign in to continue.</p>
        )}
        {error && <p className="auth-error" role="alert">{error}</p>}

        {/* noValidate: suppress native browser tooltips (which leak the password
            length rule and show raw email-format text) — all feedback goes
            through our single generic banner instead. */}
        <form className="auth-form" onSubmit={handleSubmit} noValidate>
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
              autoComplete="current-password"
              placeholder="••••••••"
            />
          </div>

          <button className="auth-btn" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <p className="auth-footer">
          No account? <Link to="/register">Create one</Link>
        </p>
      </div>

      <p className="auth-notice">Prototype only — not for clinical use</p>
    </div>
  )
}

export default LoginPage
