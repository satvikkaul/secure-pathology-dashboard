import ClassificationReportTemplate from './ClassificationReportTemplate'
import GenericResultTemplate from './GenericResultTemplate'

// Keys must match the result_type strings emitted by backend algorithms
// (see ResultEnvelope in backend/app/schemas.py — keep the two in sync).
// Anything unknown, absent, or malformed falls back to the generic template.
const registry = {
  classification: ClassificationReportTemplate,
}

export function getTemplate(resultType) {
  return registry[resultType] ?? GenericResultTemplate
}
