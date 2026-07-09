// Backend stores naive UTC timestamps (no offset). Tag as UTC before parsing so
// the browser doesn't misread them as local time and shift the day.
function toDate(iso) {
  return new Date(/[Z]|[+-]\d\d:\d\d$/.test(iso) ? iso : iso + 'Z')
}

export function formatDate(iso, fallback = '—') {
  if (!iso) return fallback
  return toDate(iso).toLocaleDateString(undefined, {
    month: 'short', day: 'numeric', year: 'numeric',
  })
}

export function formatDateTime(iso, fallback = null) {
  if (!iso) return fallback
  return toDate(iso).toLocaleString(undefined, {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: 'numeric', minute: '2-digit',
  })
}
