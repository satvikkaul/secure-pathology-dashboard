import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import '../pages/DashboardPage.css'

function getInitials(fullName) {
  if (!fullName) return '?'
  const parts = fullName.trim().split(/\s+/)
  return (parts[0][0] + (parts[1]?.[0] ?? '')).toUpperCase()
}

function AppLayout({ children, pageTitle, pageSub }) {
  const { user, logout, isAdmin } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  function handleLogout() {
    logout()
    navigate('/login')
  }

  function closeMobileSidebar() {
    setSidebarOpen(false)
  }

  const initials = getInitials(user?.full_name)
  const path = location.pathname

  const sidebarClass = [
    'dash-sidebar',
    sidebarCollapsed ? 'dash-sidebar--collapsed' : '',
    sidebarOpen ? 'dash-sidebar--open' : '',
  ].filter(Boolean).join(' ')

  return (
    <div className="dash-app">
      <div
        className={`dash-overlay${sidebarOpen ? ' dash-overlay--visible' : ''}`}
        onClick={closeMobileSidebar}
      />

      <aside className={sidebarClass}>
        <div className="sb-brand">
          <div className="sb-avatar">SPD</div>
          <div className="sb-title-block">
            <p className="sb-title-label">Phase 1</p>
            <p className="sb-title-name">Secure Pathology Dashboard</p>
          </div>
          <button
            type="button"
            className="sb-toggle"
            aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            onClick={() => setSidebarCollapsed((c) => !c)}
          >
            {sidebarCollapsed ? '›' : '‹'}
          </button>
        </div>

        <div className="sb-nav-wrap">
          <span className="sb-section-label">Navigation</span>
          <nav>
            <Link
              to="/dashboard"
              className={`sb-nav-link${path === '/dashboard' ? ' sb-nav-link--active' : ''}`}
              onClick={closeMobileSidebar}
            >
              <span className="sb-icon">⊞</span>
              <span className="sb-nav-label">Dashboard</span>
            </Link>
            <Link
              to="/upload"
              className={`sb-nav-link${path === '/upload' ? ' sb-nav-link--active' : ''}`}
              onClick={closeMobileSidebar}
            >
              <span className="sb-icon">↑</span>
              <span className="sb-nav-label">Upload Image</span>
            </Link>
            <Link
              to="/jobs"
              className={`sb-nav-link${(path === '/jobs' || path.startsWith('/jobs/')) ? ' sb-nav-link--active' : ''}`}
              onClick={closeMobileSidebar}
            >
              <span className="sb-icon">≡</span>
              <span className="sb-nav-label">Analysis Jobs</span>
            </Link>
            <Link
              to="/profile"
              className={`sb-nav-link${path === '/profile' ? ' sb-nav-link--active' : ''}`}
              onClick={closeMobileSidebar}
            >
              <span className="sb-icon">◎</span>
              <span className="sb-nav-label">My Profile</span>
            </Link>
            {isAdmin && (
              <Link
                to="/admin"
                className={`sb-nav-link${path === '/admin' ? ' sb-nav-link--active' : ''}`}
                onClick={closeMobileSidebar}
              >
                <span className="sb-icon">✓</span>
                <span className="sb-nav-label">Admin — Approvals</span>
              </Link>
            )}
          </nav>
        </div>

        <div className="sb-footer">
          <div className="sb-user-box">
            <p className="sb-user-name">{user?.full_name}</p>
            <p className="sb-user-role">Research Prototype User</p>
          </div>
          <button type="button" className="sb-signout-btn" onClick={handleLogout}>
            <span className="sb-icon">↩</span>
            <span className="sb-signout-label">Sign Out</span>
          </button>
        </div>
      </aside>

      <div className="dash-main-wrap">
        <header className="dash-topbar">
          <div className="dash-topbar-left">
            <button
              type="button"
              className="dash-burger dash-burger--mobile"
              aria-label="Open navigation"
              onClick={() => setSidebarOpen(true)}
            >
              ☰
            </button>
            <div>
              <p className="dash-topbar-title">{pageTitle}</p>
              {pageSub && <p className="dash-topbar-sub">{pageSub}</p>}
            </div>
          </div>

          <Link to="/profile" className="dash-profile">
            <div className="dash-profile-avatar">{initials}</div>
            <span className="dash-profile-name">{user?.full_name}</span>
          </Link>
        </header>

        {children}

        <footer className="dash-footer">
          Prototype only — not for clinical use
        </footer>
      </div>
    </div>
  )
}

export default AppLayout
