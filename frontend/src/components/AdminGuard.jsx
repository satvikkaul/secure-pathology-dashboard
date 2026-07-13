import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

// Admin-only routes. The backend enforces admin access on every /admin endpoint
// (require_admin → 403); this just keeps non-admins out of the page UI.
function AdminGuard({ children }) {
  const { isLoading, isAdmin } = useAuth()
  if (isLoading) return null
  if (!isAdmin) return <Navigate to="/dashboard" replace />
  return children
}

export default AdminGuard
