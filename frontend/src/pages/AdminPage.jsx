import { useEffect, useState } from 'react'
import AppLayout from '../components/AppLayout'
import { listPending, approveUser } from '../api/admin'
import './DashboardPage.css'

function AdminPage() {
  const [pending, setPending] = useState(null) // null = loading
  const [error, setError] = useState('')
  const [approving, setApproving] = useState(null) // email being approved

  async function load() {
    try {
      setPending(await listPending())
      setError('')
    } catch (err) {
      setError(err.message || 'Could not load pending users.')
    }
  }

  useEffect(() => { load() }, [])

  async function handleApprove(email) {
    setApproving(email)
    setError('')
    try {
      await approveUser(email)
      setPending((list) => list.filter((u) => u.email !== email))
    } catch (err) {
      setError(err.message || 'Approval failed.')
    } finally {
      setApproving(null)
    }
  }

  return (
    <AppLayout pageTitle="Admin" pageSub="Pending account approvals">
      <div className="dash-body">
        <div className="dash-card">
          {error && <p className="dash-error">{error}</p>}

          {pending === null ? (
            <p className="dash-loading">Loading…</p>
          ) : pending.length === 0 ? (
            <p style={{ color: 'var(--c-text-muted, #555)' }}>No users awaiting approval.</p>
          ) : (
            <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
              {pending.map((u) => (
                <li
                  key={u.id}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    gap: '1rem', padding: '0.9rem 0', borderBottom: '1px solid var(--c-border, #e5e7eb)',
                  }}
                >
                  <div style={{ minWidth: 0 }}>
                    <p style={{ margin: 0, fontWeight: 600 }}>{u.full_name}</p>
                    <p style={{ margin: '2px 0 0', fontSize: '0.9rem', color: 'var(--c-text-muted, #555)' }}>
                      {u.email}
                      {u.role ? ` · ${u.role}` : ''}
                      {u.organization_name ? ` · ${u.organization_name}` : ''}
                    </p>
                  </div>
                  <button
                    type="button"
                    className="dash-badge"
                    style={{ cursor: 'pointer', border: 'none', whiteSpace: 'nowrap' }}
                    disabled={approving === u.email}
                    onClick={() => handleApprove(u.email)}
                  >
                    {approving === u.email ? 'Approving…' : 'Approve'}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </AppLayout>
  )
}

export default AdminPage
