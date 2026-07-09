// Fallback for unknown/absent result_type. Deliberately the most conservative
// renderer: a flat key/value table, zero interpretation.
// Envelope results render metrics; legacy pre-envelope results (no metrics
// object) render their top-level scalar fields instead.

const CHROME_KEYS = new Set([
  'algorithm_name', 'algorithm_version', 'result_type', 'summary',
  'findings', 'warnings', 'visual_outputs', 'disclaimer', 'model_metadata',
])

function displayValue(v) {
  if (v == null) return '—'
  if (typeof v === 'object') return JSON.stringify(v)
  return String(v)
}

function GenericResultTemplate({ result }) {
  const metrics = result.metrics && Object.keys(result.metrics).length > 0
    ? result.metrics
    : Object.fromEntries(
        Object.entries(result).filter(
          ([k, v]) => !CHROME_KEYS.has(k) && typeof v !== 'object'
        )
      )
  const entries = Object.entries(metrics)

  return (
    <div className="jr-report-box">
      <p className="jr-report-title">Result Data</p>
      <div className="jr-report-body">
        {entries.length === 0 && <p>No metric data was returned for this result.</p>}
        {entries.map(([key, value]) => (
          <p key={key}>
            <strong>{key}</strong>: {displayValue(value)}
          </p>
        ))}
        <p>
          This result was rendered with the generic template — no dedicated
          report layout exists for this result type yet.
        </p>
      </div>
    </div>
  )
}

export default GenericResultTemplate
