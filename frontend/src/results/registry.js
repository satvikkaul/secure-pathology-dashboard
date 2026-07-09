import ClassificationReportTemplate from './ClassificationReportTemplate'
import QualityCheckTemplate from './QualityCheckTemplate'
import GenericResultTemplate from './GenericResultTemplate'

// Keys must match the result_type strings emitted by backend algorithms
// (see AlgorithmSpec.result_type in backend/app/algorithms/__init__.py —
// keep the two in sync).
// Anything unknown, absent, or malformed falls back to the generic template.
const registry = {
  classification: ClassificationReportTemplate,
  quality_check: QualityCheckTemplate,
}

export function getTemplate(resultType) {
  return registry[resultType] ?? GenericResultTemplate
}
