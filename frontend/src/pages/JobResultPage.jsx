import { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getJob } from '../api/jobs'

function JobResultPage() {
  const { id } = useParams()
  const [job, setJob] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    getJob(id)
      .then(setJob)
      .catch((err) => setError(err.message))
      .finally(() => setIsLoading(false))
  }, [id])

  // Derive parsed result outside JSX — not state, just a read of current job
  let parsedResult = null
  let rawResult = null
  if (job?.result_summary) {
    try {
      parsedResult = JSON.parse(job.result_summary)
    } catch {
      rawResult = job.result_summary
    }
  }

  return (
    <div>
      <h1>Job Result</h1>
      <p>
        <Link to="/dashboard">Back to dashboard</Link>
        {' · '}
        <Link to="/upload">New upload</Link>
      </p>

      <p><strong>Prototype result only — not for clinical use.</strong></p>

      {isLoading && <p>Loading…</p>}
      {error && <p role="alert">{error}</p>}

      {job && (
        <>
          <section>
            <h2>Job details</h2>
            <dl>
              <dt>Job ID</dt>
              <dd>{job.id}</dd>
              <dt>Image ID</dt>
              <dd>{job.image_id}</dd>
              <dt>Algorithm</dt>
              <dd>{job.algorithm_name}</dd>
              <dt>Status</dt>
              <dd>{job.status}</dd>
              <dt>Created</dt>
              <dd>{new Date(job.created_at).toLocaleString()}</dd>
              {job.completed_at && (
                <>
                  <dt>Completed</dt>
                  <dd>{new Date(job.completed_at).toLocaleString()}</dd>
                </>
              )}
            </dl>
          </section>

          {(parsedResult || rawResult) && (
            <section>
              <h2>Result</h2>

              {rawResult && <pre>{rawResult}</pre>}

              {parsedResult && (
                <>
                  {parsedResult.prediction != null && (
                    <p>
                      Prediction: <strong>{parsedResult.prediction}</strong>
                    </p>
                  )}
                  {parsedResult.confidence != null && (
                    <p>Confidence: {Math.round(parsedResult.confidence * 100)}%</p>
                  )}
                  {Array.isArray(parsedResult.findings) &&
                    parsedResult.findings.length > 0 && (
                      <>
                        <h3>Findings</h3>
                        <ul>
                          {parsedResult.findings.map((f, i) => (
                            <li key={i}>
                              {f.label} — {Math.round(f.score * 100)}%
                            </li>
                          ))}
                        </ul>
                      </>
                    )}
                  {parsedResult.note && <p><em>{parsedResult.note}</em></p>}
                </>
              )}
            </section>
          )}
        </>
      )}
    </div>
  )
}

export default JobResultPage
