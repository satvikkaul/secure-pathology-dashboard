import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { getJob } from '../api/jobs'
import { getImage } from '../api/images'
import AppLayout from '../components/AppLayout'
import './JobResultPage.css'

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function formatDate(iso) {
  if (!iso) return null
  const d = new Date(iso)
  return d.toLocaleString(undefined, {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: 'numeric', minute: '2-digit',
  })
}

function JobResultPage() {
  const { id } = useParams()
  const [job, setJob] = useState(null)
  const [image, setImage] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    getJob(id)
      .then((j) => {
        setJob(j)
        return getImage(j.image_id)
      })
      .then(setImage)
      .catch((err) => setError(err.message))
      .finally(() => setIsLoading(false))
  }, [id])

  let parsedResult = null
  let rawResult = null
  if (job?.result_summary) {
    try {
      parsedResult = JSON.parse(job.result_summary)
    } catch {
      rawResult = job.result_summary
    }
  }

  const statusClass = job
    ? `jr-status-badge jr-status-badge--${job.status}`
    : 'jr-status-badge'

  return (
    <AppLayout pageTitle="Analysis Result" pageSub="Generated report">
      <main className="jr-body">
        {isLoading && <p className="jr-loading">Loading…</p>}
        {error && <p className="jr-error" role="alert">{error}</p>}

        {job && (
          <>
            <div className="jr-heading-row">
              <div>
                <span className="jr-eyebrow">Generated Report</span>
                <h1 className="jr-title">Analysis Result</h1>
                <p className="jr-subtitle">
                  This screen summarizes the completed prototype analysis job and
                  presents the generated report in a format that is easier to review
                  than raw JSON.
                </p>
              </div>

              <div className="jr-status-card">
                <p className="jr-status-label">Job Status</p>
                <span className={statusClass}>{job.status}</span>
              </div>
            </div>

            <div className="jr-layout">
              <div className="jr-main">
                {!parsedResult && !rawResult && (
                  <section className="jr-status-panel">
                    <h2 className="jr-status-panel-title">
                      {job.status === 'failed'
                        ? 'Analysis failed'
                        : job.status === 'running'
                        ? 'Analysis in progress'
                        : 'Analysis pending'}
                    </h2>
                    <p className="jr-status-panel-body">
                      {job.status === 'failed'
                        ? 'The analysis job encountered an error and did not produce a result. No report is available for this run.'
                        : 'The analysis job has not finished yet. Reload the page to check for an updated result.'}
                    </p>
                  </section>
                )}

                {(parsedResult || rawResult) && (
                  <section className="jr-card">
                    <div className="jr-card-hd">
                      <div>
                        <h2 className="jr-card-title">Report Summary</h2>
                        <p className="jr-card-sub">
                          Prototype output based on the selected uploaded pathology image.
                        </p>
                      </div>
                      <span className="jr-not-clinical">Not for clinical use</span>
                    </div>

                    {parsedResult && (
                      <>
                        <div className="jr-metrics">
                          {parsedResult.prediction != null && (
                            <div className="jr-metric-box">
                              <p className="jr-metric-label">Prediction</p>
                              <p className="jr-metric-value" style={{ textTransform: 'capitalize' }}>
                                {parsedResult.prediction}
                              </p>
                              <p className="jr-metric-note">
                                Prototype classification result for this uploaded image.
                              </p>
                            </div>
                          )}
                          {parsedResult.confidence != null && (
                            <div className="jr-metric-box">
                              <p className="jr-metric-label">Confidence</p>
                              <p className="jr-metric-value">
                                {Math.round(parsedResult.confidence * 100)}%
                              </p>
                              <p className="jr-metric-note">
                                Confidence is illustrative only and should not be
                                interpreted clinically.
                              </p>
                            </div>
                          )}
                        </div>

                        <div className="jr-report-box">
                          <p className="jr-report-title">Generated Report</p>
                          <div className="jr-report-body">
                            {parsedResult.prediction != null && parsedResult.confidence != null && (
                              <p>
                                The prototype analysis completed successfully and returned
                                a <strong style={{ textTransform: 'capitalize' }}>{parsedResult.prediction}</strong> classification
                                with {Math.round(parsedResult.confidence * 100)}% confidence.
                                No urgent abnormality markers are surfaced in this prototype result.
                              </p>
                            )}
                            {parsedResult.note && <p>{parsedResult.note}</p>}
                            <p>
                              In a future phase, this section could include structured
                              findings, algorithm version notes, reviewer comments, and
                              export-ready report formatting.
                            </p>
                          </div>
                        </div>
                      </>
                    )}

                    {rawResult && (
                      <pre style={{ fontSize: '13px', color: 'var(--c-text)', overflowX: 'auto' }}>
                        {rawResult}
                      </pre>
                    )}
                  </section>
                )}

                {parsedResult?.findings?.length > 0 && (
                  <section className="jr-card">
                    <h2 className="jr-findings-card-title">Findings</h2>
                    {parsedResult.findings.map((f, i) => (
                      <div key={i} className="jr-finding">
                        <div className="jr-finding-top">
                          <p className="jr-finding-label">{f.label}</p>
                          <span className="jr-finding-score">
                            {Math.round(f.score * 100)}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </section>
                )}
              </div>

              <aside className="jr-aside">
                <div className="jr-aside-card">
                  <h3 className="jr-aside-card-title">Job Details</h3>
                  <dl className="jr-details-dl">
                    <div className="jr-detail-row">
                      <dt className="jr-detail-key">Job ID</dt>
                      <dd className="jr-detail-val">#{job.id}</dd>
                    </div>
                    <div className="jr-detail-row">
                      <dt className="jr-detail-key">Image ID</dt>
                      <dd className="jr-detail-val">#{job.image_id}</dd>
                    </div>
                    <div className="jr-detail-row">
                      <dt className="jr-detail-key">Algorithm</dt>
                      <dd className="jr-detail-val">{job.algorithm_name}</dd>
                    </div>
                    <div className="jr-detail-row">
                      <dt className="jr-detail-key">Created</dt>
                      <dd className="jr-detail-val">{formatDate(job.created_at)}</dd>
                    </div>
                    {job.completed_at && (
                      <div className="jr-detail-row">
                        <dt className="jr-detail-key">Completed</dt>
                        <dd className="jr-detail-val">{formatDate(job.completed_at)}</dd>
                      </div>
                    )}
                  </dl>
                </div>

                {image && (
                  <div className="jr-aside-card">
                    <h3 className="jr-aside-card-title">Image Summary</h3>
                    <div className="jr-image-box">
                      <p className="jr-image-box-name">Image #{image.id}</p>
                      <p className="jr-image-box-meta">
                        {image.content_type} · {formatBytes(image.file_size)}
                      </p>
                      <p className="jr-image-box-note">
                        Uploaded by the current user for this analysis run.
                      </p>
                    </div>
                  </div>
                )}

                <div className="jr-aside-card">
                  <h3 className="jr-aside-card-title">Prototype Notice</h3>
                  <div className="jr-notice-box">
                    This generated report is a demo artifact for workflow validation
                    only. It should not be used for diagnosis, treatment, or clinical
                    decision-making.
                  </div>
                </div>
              </aside>
            </div>
          </>
        )}
      </main>
    </AppLayout>
  )
}

export default JobResultPage
