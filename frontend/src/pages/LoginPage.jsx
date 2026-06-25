import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { login as apiLogin } from '../api/auth'
import { useAuth } from '../context/AuthContext'

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
      setError(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div>
      <h1>Sign in</h1>
      {justRegistered && <p>Account created. Sign in to continue.</p>}
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
        </div>
        <div>
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
        </div>
        {error && <p role="alert">{error}</p>}
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
      <p>
        No account? <Link to="/register">Register</Link>
      </p>
    </div>
  )
}

export default LoginPage
