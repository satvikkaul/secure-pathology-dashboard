import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { listJobs } from '../api/jobs'
import AppLayout from '../components/AppLayout'
import './DashboardPage.css'
import './JobsPage.css'

function formatDate(iso) {
  if (!iso) return null
  return new Date(iso).toLocaleString(undefined, {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: 'numeric', minute: '2-digit',
  })
}

function JobsPage() {
  const [jobs, setJobs] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    listJobs()
      .then(setJobs)
      .catch((err) => setError(err.message))
      .finally(() => setIsLoading(false))
  }, [])

  return (
    <AppLayout pageTitle="Analysis Jobs" pageSub="Your analysis job history">
      <div className="dash-body">
        <span className="jl-eyebrow">Analysis Jobs</span>
        <h1 className="jl-title">Job History</h1>
        <p className="jl-sub">
          All analysis jobs submitted by your account. Completed jobs link to the
          full result report. This list updates on page load.
        </p>

        {isLoading && <p className="dash-loading">Loading…</p>}
        {error && <p className="dash-error" role="alert">{error}</p>}

        {!isLoading && !error && jobs.length === 0 && (
          <div className="jl-empty">
            <p className="jl-empty-title">No jobs yet</p>
            <p className="jl-empty-sub">
              Upload a pathology image and run an analysis to see jobs here.
            </p>
            <Link to="/upload" className="jl-empty-btn">Upload Image</Link>
          </div>
        )}

        {!isLoading && !error && jobs.length > 0 && (
          <div className="dash-card">
            {jobs.map((job) => (
              <div key={job.id} className="jl-row">
                <div className="jl-row-info">
                  <span className="jl-row-id">Job #{job.id}</span>
                  <span className="jl-row-meta">
                    {job.algorithm_name} · {formatDate(job.created_at)}
                  </span>
                </div>
                <div className="jl-row-right">
                  <span className={`dash-badge dash-badge--${job.status}`}>
                    {job.status}
                  </span>
                  {job.status === 'completed' && (
                    <Link to={`/jobs/${job.id}`} className="jl-view-link">
                      View Result →
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  )
}

export default JobsPage
