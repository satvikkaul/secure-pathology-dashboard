// Metrics section for result_type: "quality_check".
// Envelope chrome (summary, warnings, findings, disclaimer) is owned by
// JobResultPage; this renders only the metrics area.

// Backend emits all ratios as 0-1 fractions; formatting is the frontend's job.
const pct = (v) => `${Math.round(v * 100)}%`

const QUALITY_NOTES = [
  ['sharpness', 'Sharpness', 'Edge detail. Low values suggest the image is out of focus.'],
  ['brightness', 'Brightness', 'Mean luminance of the image.'],
  ['tissue_coverage', 'Tissue Coverage', 'Fraction of the image that is not slide background.'],
]

function QualityCheckTemplate({ result }) {
  const m = result.metrics ?? {}
  return (
    <>
      <div className="jr-metrics">
        {m.quality_score != null && (
          <div className="jr-metric-box">
            <p className="jr-metric-label">Quality Score</p>
            <p className="jr-metric-value">{pct(m.quality_score)}</p>
            <p className="jr-metric-note">
              Heuristic score combining sharpness, coverage, and brightness.
            </p>
          </div>
        )}
        {m.status != null && (
          <div className="jr-metric-box">
            <p className="jr-metric-label">Screen Status</p>
            <p className="jr-metric-value" style={{ textTransform: 'capitalize' }}>
              {m.status}
            </p>
            <p className="jr-metric-note">
              Prototype quality screen only — not a diagnostic assessment.
            </p>
          </div>
        )}
      </div>

      <div className="jr-report-box">
        <p className="jr-report-title">Measured Metrics</p>
        <div className="jr-report-body">
          {QUALITY_NOTES.filter(([key]) => m[key] != null).map(([key, label, note]) => (
            <div key={key} className="jr-finding">
              <div className="jr-finding-top">
                <p className="jr-finding-label">{label}</p>
                <span className="jr-finding-score">{pct(m[key])}</span>
              </div>
              <p className="jr-metric-note">{note}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}

export default QualityCheckTemplate
