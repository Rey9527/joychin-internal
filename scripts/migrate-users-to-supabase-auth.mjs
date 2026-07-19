import { createHash } from 'node:crypto'

const apply = process.argv.includes('--apply')
const url = process.env.SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!url || !serviceKey) throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required')

const headers = { apikey: serviceKey, Authorization: `Bearer ${serviceKey}`, 'Content-Type': 'application/json' }
const request = async (path, options = {}) => {
  const response = await fetch(`${url}${path}`, { ...options, headers: { ...headers, ...(options.headers || {}) } })
  const text = await response.text()
  const body = text ? JSON.parse(text) : null
  if (!response.ok) throw new Error(`${path}: ${body?.message || body?.msg || body?.error || response.status}`)
  return body
}
const authEmailFor = (login) => {
  const normalized = login.trim().toLowerCase()
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)
    ? normalized
    : `legacy-${createHash('sha256').update(normalized).digest('hex').slice(0, 32)}@auth.joychin.local`
}

const users = await request('/rest/v1/users?select=id,email,password_hash,auth_id,auth_email,is_active&order=id')
const authListing = await request('/auth/v1/admin/users?page=1&per_page=1000')
const authByEmail = new Map((authListing.users || []).map((user) => [String(user.email || '').toLowerCase(), user]))
const summary = { total: users.length, already_linked: 0, ready: 0, migrated: 0, skipped_no_password: 0, failed: 0 }
for (const profile of users) {
  if (profile.auth_id) { summary.already_linked++; continue }
  if (!profile.password_hash) { summary.skipped_no_password++; continue }
  summary.ready++
  if (!apply) continue
  try {
    const authEmail = authEmailFor(profile.email)
    let created = authByEmail.get(authEmail.toLowerCase())
    if (!created) {
      created = await request('/auth/v1/admin/users', {
        method: 'POST', body: JSON.stringify({
          email: authEmail, password: profile.password_hash, email_confirm: true,
          user_metadata: { login_identifier: profile.email },
        }),
      })
      authByEmail.set(authEmail.toLowerCase(), created)
    }
    await request(`/rest/v1/users?id=eq.${profile.id}`, {
      method: 'PATCH', headers: { Prefer: 'return=minimal' },
      body: JSON.stringify({ auth_id: created.id, auth_email: authEmail }),
    })
    summary.migrated++
  } catch (error) {
    summary.failed++
    console.error(`User #${profile.id}: ${error.message}`)
  }
}
console.log(JSON.stringify({ mode: apply ? 'apply' : 'dry-run', ...summary }, null, 2))
if (summary.failed || summary.skipped_no_password) process.exitCode = 1
