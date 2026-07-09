import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { listImages } from '../api/images'
import { listJobs } from '../api/jobs'
import AppLayout from '../components/AppLayout'
import { formatDate } from '../utils/datetime'
import './DashboardPage.css'

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function DashboardPage() {
  const { user } = useAuth()

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

  return (
    <AppLayout
      pageTitle="Dashboard Overview"
      pageSub="Monitor uploads and analysis jobs"
    >
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
                          {formatDate(img.created_at)}
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
                          {job.algorithm_name} · {formatDate(job.created_at)}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            </div>
          )}
      </div>
    </AppLayout>
  )
}

export default DashboardPage
