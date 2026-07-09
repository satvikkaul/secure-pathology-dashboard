// Metrics section for result_type: "classification".
// Receives the whole envelope; renders only the metrics area — envelope chrome
// (summary, findings, warnings, disclaimer) is owned by JobResultPage.
function ClassificationReportTemplate({ result }) {
  const m = result.metrics ?? {}
  return (
    <>
      <div className="jr-metrics">
        {m.predicted_class != null && (
          <div className="jr-metric-box">
            <p className="jr-metric-label">Predicted Class</p>
            <p className="jr-metric-value" style={{ textTransform: 'capitalize' }}>
              {m.predicted_class}
            </p>
            <p className="jr-metric-note">
              Prototype classification result for this uploaded image.
            </p>
          </div>
        )}
        {m.confidence != null && (
          <div className="jr-metric-box">
            <p className="jr-metric-label">Confidence</p>
            <p className="jr-metric-value">{Math.round(m.confidence * 100)}%</p>
            <p className="jr-metric-note">
              Confidence is illustrative only and should not be interpreted clinically.
            </p>
          </div>
        )}
      </div>

      {Array.isArray(m.top_k) && m.top_k.length > 0 && (
        <div className="jr-report-box">
          <p className="jr-report-title">Class Probabilities</p>
          <div className="jr-report-body">
            {m.top_k.map((entry, i) => (
              <p key={i} style={{ textTransform: 'capitalize' }}>
                {entry.class}: {Math.round(entry.probability * 100)}%
              </p>
            ))}
          </div>
        </div>
      )}
    </>
  )
}

export default ClassificationReportTemplate
