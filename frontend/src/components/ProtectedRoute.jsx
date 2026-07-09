import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth()

  // Wait for the initial /auth/me check to complete before deciding to redirect.
  // Returning null avoids a flash redirect for users with a valid token.
  if (isLoading) return null

  if (!isAuthenticated) return <Navigate to="/login" replace />

  return children
}

export default ProtectedRoute
