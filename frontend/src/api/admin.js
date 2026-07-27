import request from './client'

export const listUsers = () => request('/admin/users')

// One call for all four transitions: approve, decline, revoke an approval,
// reinstate a decline. `decision` is 'approved' or 'declined'; the backend
// rejects a decline with no reason.
export const decideUser = (email, decision, reason) =>
  request('/admin/decide', {
    method: 'POST',
    body: JSON.stringify({ email, decision, reason: reason || null }),
  })
