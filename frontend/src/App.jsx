import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import OnboardingGuard from './components/OnboardingGuard'
import ApprovalGuard from './components/ApprovalGuard'
import AdminGuard from './components/AdminGuard'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import OnboardingPage from './pages/OnboardingPage'
import DashboardPage from './pages/DashboardPage'
import UploadPage from './pages/UploadPage'
import JobsPage from './pages/JobsPage'
import JobResultPage from './pages/JobResultPage'
import ProfilePage from './pages/ProfilePage'
import AdminPage from './pages/AdminPage'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route
            path="/onboarding"
            element={<ProtectedRoute><OnboardingPage /></ProtectedRoute>}
          />
          <Route
            path="/dashboard"
            element={<ProtectedRoute><OnboardingGuard><ApprovalGuard><DashboardPage /></ApprovalGuard></OnboardingGuard></ProtectedRoute>}
          />
          <Route
            path="/upload"
            element={<ProtectedRoute><OnboardingGuard><ApprovalGuard><UploadPage /></ApprovalGuard></OnboardingGuard></ProtectedRoute>}
          />
          <Route
            path="/jobs"
            element={<ProtectedRoute><OnboardingGuard><ApprovalGuard><JobsPage /></ApprovalGuard></OnboardingGuard></ProtectedRoute>}
          />
          <Route
            path="/jobs/:id"
            element={<ProtectedRoute><OnboardingGuard><ApprovalGuard><JobResultPage /></ApprovalGuard></OnboardingGuard></ProtectedRoute>}
          />
          <Route
            path="/profile"
            element={<ProtectedRoute><OnboardingGuard><ApprovalGuard><ProfilePage /></ApprovalGuard></OnboardingGuard></ProtectedRoute>}
          />
          <Route
            path="/admin"
            element={<ProtectedRoute><AdminGuard><AdminPage /></AdminGuard></ProtectedRoute>}
          />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
