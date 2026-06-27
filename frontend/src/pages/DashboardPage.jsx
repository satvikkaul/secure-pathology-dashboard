import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { listImages } from '../api/images'
import { listJobs } from '../api/jobs'
import './DashboardPage.css'

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function getInitials(fullName) {
  if (!fullName) return '?'
  const parts = fullName.trim().split(/\s+/)
  return (parts[0][0] + (parts[1]?.[0] ?? '')).toUpperCase()
}

function DashboardPage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const [images, setImages] = useState([])
  const [jobs, setJobs] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    Promise.all([listImages(), listJobs()])
      .then(([imgs, jbs]) => {
        setImages(imgs)
        setJobs(jbs)
      })
      .catch((err) => setError(err.message))
      .finally(() => setIsLoading(false))
  }, [])

  function handleLogout() {
    logout()
    navigate('/login')
  }

  function closeMobileSidebar() {
    setSidebarOpen(false)
  }

  const initials = getInitials(user?.full_name)

  const sidebarClass = [
    'dash-sidebar',
    sidebarCollapsed ? 'dash-sidebar--collapsed' : '',
    sidebarOpen ? 'dash-sidebar--open' : '',
  ].filter(Boolean).join(' ')

  return (
    <div className="dash-app">
      {/* Mobile overlay */}
      <div
        className={`dash-overlay${sidebarOpen ? ' dash-overlay--visible' : ''}`}
        onClick={closeMobileSidebar}
      />

      {/* ── Sidebar ── */}
      <aside className={sidebarClass}>
        <div className="sb-brand">
          <div className="sb-avatar">SPD</div>
          <div className="sb-title-block">
            <p className="sb-title-label">Phase 1</p>
            <p className="sb-title-name">Secure Pathology Dashboard</p>
          </div>
        </div>

        <div className="sb-nav-wrap">
          <span className="sb-section-label">Navigation</span>
          <nav>
            <Link
              to="/dashboard"
              className="sb-nav-link sb-nav-link--active"
              onClick={closeMobileSidebar}
            >
              <span className="sb-icon">⊞</span>
              <span className="sb-nav-label">Dashboard</span>
            </Link>
            <Link
              to="/upload"
              className="sb-nav-link"
              onClick={closeMobileSidebar}
            >
              <span className="sb-icon">↑</span>
              <span className="sb-nav-label">Upload Image</span>
            </Link>
            <Link
              to="/dashboard"
              className="sb-nav-link"
              onClick={closeMobileSidebar}
            >
              <span className="sb-icon">≡</span>
              <span className="sb-nav-label">Analysis Jobs</span>
            </Link>
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

      {/* ── Main area ── */}
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
            <button
              type="button"
              className="dash-burger dash-burger--desktop"
              aria-label="Toggle sidebar"
              onClick={() => setSidebarCollapsed((c) => !c)}
            >
              ☰
            </button>
            <div>
              <p className="dash-topbar-title">Dashboard Overview</p>
              <p className="dash-topbar-sub">Monitor uploads and analysis jobs</p>
            </div>
          </div>

          <div className="dash-profile">
            <div className="dash-profile-avatar">{initials}</div>
            <span className="dash-profile-name">{user?.full_name}</span>
          </div>
        </header>

        <div className="dash-body">
          <div className="dash-welcome">
            <div>
              <h1 className="dash-welcome-name">Welcome, {user?.full_name}</h1>
              <p className="dash-welcome-sub">Phase 1 Research Prototype</p>
            </div>
            <Link to="/upload" className="dash-upload-btn">Upload Image</Link>
          </div>

          {isLoading && <p className="dash-loading">Loading…</p>}
          {error && <p className="dash-error" role="alert">{error}</p>}

          {!isLoading && !error && (
            <div className="dash-grid">
              <section className="dash-card">
                <div className="dash-card-header">
                  <h2 className="dash-card-title">Images</h2>
                  {images.length > 0 && (
                    <span className="dash-card-count">{images.length}</span>
                  )}
                </div>
                {images.length === 0 ? (
                  <p className="dash-empty">No images uploaded yet.</p>
                ) : (
                  <ul className="dash-list">
                    {images.map((img) => (
                      <li key={img.id} className="dash-list-item">
                        <span className="dash-item-id">Image #{img.id}</span>
                        <span className="dash-item-meta">
                          {img.content_type} · {formatBytes(img.file_size)} ·{' '}
                          {new Date(img.created_at).toLocaleDateString()}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </section>

              <section className="dash-card">
                <div className="dash-card-header">
                  <h2 className="dash-card-title">Analysis Jobs</h2>
                  {jobs.length > 0 && (
                    <span className="dash-card-count">{jobs.length}</span>
                  )}
                </div>
                {jobs.length === 0 ? (
                  <p className="dash-empty">No jobs run yet.</p>
                ) : (
                  <ul className="dash-list">
                    {jobs.map((job) => (
                      <li key={job.id} className="dash-list-item">
                        <div className="dash-job-top">
                          <Link to={`/jobs/${job.id}`} className="dash-job-link">
                            Job #{job.id}
                          </Link>
                          <span className={`dash-badge dash-badge--${job.status}`}>
                            {job.status}
                          </span>
                        </div>
                        <span className="dash-item-meta">
                          {job.algorithm_name} · {new Date(job.created_at).toLocaleDateString()}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            </div>
          )}
        </div>

        <footer className="dash-footer">
          Prototype only — not for clinical use
        </footer>
      </div>
    </div>
  )
}

export default DashboardPage
