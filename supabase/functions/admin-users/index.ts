import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

const json = (status: number, body: Record<string, unknown>) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })

const normalizeRole = (role: unknown) => role === 'assistant' ? 'user' : String(role || 'user')

async function authEmailFor(login: string) {
  const normalized = login.trim().toLowerCase()
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) return normalized
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(normalized))
  const hash = Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, '0')).join('')
  return `legacy-${hash.slice(0, 32)}@auth.joychin.local`
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (req.method !== 'POST') return json(405, { error: 'Method not allowed' })

  const url = Deno.env.get('SUPABASE_URL')
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY')
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  const authorization = req.headers.get('Authorization') || ''
  if (!url || !anonKey || !serviceKey || !authorization.startsWith('Bearer ')) {
    return json(401, { error: 'Authentication required' })
  }

  const callerClient = createClient(url, anonKey, { global: { headers: { Authorization: authorization } } })
  const admin = createClient(url, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } })
  const { data: authData, error: authError } = await callerClient.auth.getUser()
  if (authError || !authData.user) return json(401, { error: 'Invalid session' })

  const { data: caller } = await admin.from('users')
    .select('id,role,is_active,group_id,user_groups(permissions)')
    .eq('auth_id', authData.user.id).maybeSingle()
  if (!caller?.is_active) return json(403, { error: 'Account disabled' })
  const callerRole = normalizeRole(caller.role)
  const permissions = (caller.user_groups as { permissions?: Record<string, boolean> } | null)?.permissions || {}
  const canManage = callerRole === 'admin' || callerRole === 'manager' || permissions.manage_users === true

  let body: Record<string, unknown>
  try { body = await req.json() } catch { return json(400, { error: 'Invalid JSON' }) }
  const action = String(body.action || '')
  const targetId = Number(body.user_id || 0)
  const isSelf = targetId > 0 && targetId === Number(caller.id)
  if (!canManage && !(action === 'update' && isSelf)) return json(403, { error: 'Permission denied' })

  try {
    if (action === 'create') {
      const email = String(body.email || '').trim()
      const password = String(body.password || '')
      const name = String(body.name || '').trim()
      const role = normalizeRole(body.role)
      if (!email || !name || password.length < 4) return json(400, { error: 'Email, name and password are required' })
      if (!['admin', 'manager', 'user', 'supplier', 'customer'].includes(role)) return json(400, { error: 'Invalid role' })
      const linkedCompany = String(body.linked_company || '').trim() || null
      if (['supplier', 'customer'].includes(role) && !linkedCompany) return json(400, { error: 'Linked company is required' })
      const authEmail = await authEmailFor(email)
      const { data: created, error: createError } = await admin.auth.admin.createUser({
        email: authEmail, password, email_confirm: true,
        user_metadata: { login_identifier: email },
      })
      if (createError || !created.user) throw createError || new Error('Unable to create Auth account')
      const { data: profile, error: profileError } = await admin.from('users').insert({
        email, auth_email: authEmail, auth_id: created.user.id, name, role,
        is_active: true, group_id: body.group_id || null, linked_company: linkedCompany,
        password_hash: null,
      }).select('id,email,name,role,is_active,created_at,group_id,linked_company,auth_id,auth_email').single()
      if (profileError) {
        await admin.auth.admin.deleteUser(created.user.id)
        throw profileError
      }
      return json(200, { user: profile })
    }

    const { data: target, error: targetError } = await admin.from('users').select('id,auth_id,role').eq('id', targetId).single()
    if (targetError || !target) return json(404, { error: 'User not found' })

    if (action === 'update') {
      const patch: Record<string, unknown> = {}
      if (body.name !== undefined) patch.name = String(body.name).trim()
      if (body.email !== undefined) {
        const email = String(body.email).trim()
        if (!email) return json(400, { error: 'Email is required' })
        const authEmail = await authEmailFor(email)
        if (target.auth_id) {
          const { error } = await admin.auth.admin.updateUserById(target.auth_id, {
            email: authEmail, email_confirm: true, user_metadata: { login_identifier: email },
          })
          if (error) throw error
        }
        patch.email = email
        patch.auth_email = authEmail
      }
      if (canManage && !isSelf) {
        const role = normalizeRole(body.role)
        if (!['admin', 'manager', 'user', 'supplier', 'customer'].includes(role)) return json(400, { error: 'Invalid role' })
        patch.role = role
        patch.is_active = body.is_active !== false
        patch.group_id = body.group_id || null
        patch.linked_company = String(body.linked_company || '').trim() || null
      }
      const { data, error } = await admin.from('users').update(patch).eq('id', targetId)
        .select('id,email,name,role,is_active,created_at,group_id,linked_company,auth_id,auth_email').single()
      if (error) throw error
      return json(200, { user: data })
    }

    if (!canManage || isSelf) return json(403, { error: 'A manager must perform this action' })
    if (action === 'reset_password') {
      const password = String(body.password || '')
      if (password.length < 4) return json(400, { error: 'Password must have at least 4 characters' })
      if (!target.auth_id) return json(409, { error: 'Account has not been linked to Auth' })
      const { error } = await admin.auth.admin.updateUserById(target.auth_id, { password })
      if (error) throw error
      return json(200, { ok: true })
    }
    if (action === 'set_active') {
      const { error } = await admin.from('users').update({ is_active: body.is_active === true }).eq('id', targetId)
      if (error) throw error
      return json(200, { ok: true })
    }
    if (action === 'delete') {
      if (target.auth_id) {
        const { error } = await admin.auth.admin.deleteUser(target.auth_id)
        if (error) throw error
      }
      const { error } = await admin.from('users').delete().eq('id', targetId)
      if (error) throw error
      return json(200, { ok: true })
    }
    return json(400, { error: 'Unknown action' })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Request failed'
    return json(400, { error: message })
  }
})
