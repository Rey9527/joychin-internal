const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const test = require('node:test')
const vm = require('node:vm')

const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8')

function extractFunction(name) {
  const start = html.indexOf(`function ${name}(`)
  assert.notEqual(start, -1, `missing function ${name}`)
  const open = html.indexOf('{', start)
  let depth = 0
  let quote = null
  let escaped = false
  for (let i = open; i < html.length; i += 1) {
    const char = html[i]
    if (quote) {
      if (escaped) escaped = false
      else if (char === '\\') escaped = true
      else if (char === quote) quote = null
      continue
    }
    if (char === "'" || char === '"' || char === '`') {
      quote = char
      continue
    }
    if (char === '{') depth += 1
    if (char === '}') {
      depth -= 1
      if (depth === 0) return html.slice(start, i + 1)
    }
  }
  throw new Error(`unterminated function ${name}`)
}

const sandbox = {
  products: [{ id: 1, width_m: 1.07 }],
  suppliers: [
    { id: 2, country: 'CN' },
    { id: 3, country: 'TH' }
  ]
}
vm.createContext(sandbox)
for (const name of [
  'getSupplierCountryValue',
  'supplierNeedsCustoms',
  'shouldApplyCustoms',
  '_qiNormCost',
  '_qiMarginPct',
  '_qiFinalPrice',
  'poQtyToRolls'
]) {
  vm.runInContext(extractFunction(name), sandbox)
}

test('escapes text used in generated HTML', () => {
  const body = html.slice(html.indexOf('function escapeHtml('), html.indexOf('function togglePassword('))
  assert.ok(body.includes(".replace(/&/g,'&amp;')"))
  assert.ok(body.includes(".replace(/</g,'&lt;')"))
  assert.ok(body.includes(".replace(/'/g,'&#39;')"))
})

test('normalizes overseas m2 cost into customer meter cost', () => {
  const item = {
    product_id: 1,
    supplier_id: 2,
    cost_price: 100,
    customs_fee_pct: 7.5,
    apply_customs: true,
    pricing_unit: 'm2',
    customer_pricing_unit: 'm',
    margin_pct: 20
  }
  assert.equal(Number(sandbox._qiNormCost(item).toFixed(3)), 115.025)
  assert.equal(sandbox._qiFinalPrice(item), 138.03)
  assert.equal(sandbox._qiMarginPct(item, 138.03), 20)
})

test('normalizes meter cost into customer m2 cost', () => {
  const item = {
    product_id: 1,
    supplier_id: 3,
    cost_price: 107,
    apply_customs: false,
    pricing_unit: 'm',
    customer_pricing_unit: 'm2',
    margin_pct: 20
  }
  assert.equal(sandbox._qiNormCost(item), 100)
  assert.equal(sandbox._qiFinalPrice(item), 120)
  assert.equal(sandbox._qiMarginPct(item, 120), 20)
})

test('converts received meters to inventory rolls', () => {
  assert.equal(sandbox.poQtyToRolls(2000, 'm', { meters_per_roll: 1000 }), 2)
  assert.equal(sandbox.poQtyToRolls(4, 'roll', {}), 4)
  assert.equal(sandbox.poQtyToRolls(2000, 'm', {}), null)
})

test('shipment receiving synchronizes inventory and purchase status', () => {
  const body = extractFunction('saveShipmentReceive')
  assert.match(body, /實收超過採購量，需要主管確認/)
  assert.match(body, /post_inventory_transaction/)
  assert.match(body, /procurement_shortfalls/)
  assert.match(body, /from\('products'\)\.update\(\{stock_qty:nextStock\}\)/)
  assert.match(body, /from\('purchase_orders'\)\.update\(\{status:'received'\}\)/)
  assert.match(body, /from\('shipments'\)\.update\(\{status:'completed'\}\)/)
})

test('customer shipments require a customer and preserve missing order linkage', () => {
  const movementBody = extractFunction('saveStockMovement')
  assert.match(movementBody, /客戶出貨必須選擇客戶/)
  assert.match(movementBody, /post_inventory_transaction/)
  const migration = fs.readFileSync(path.join(__dirname, '..', 'supabase', 'migrations', '20260719030000_operational_traceability.sql'), 'utf8')
  assert.match(migration, /needs_link_review boolean not null default false/)
  assert.match(migration, /movement_type='customer_shipment' and p_order_id is null/)
})

test('inquiry intake supports unregistered customers, multiple suppliers, and development projects', () => {
  const body = extractFunction('createInquiry')
  assert.match(body, /nf-supplier-check:checked/)
  assert.match(body, /customer_is_unregistered/)
  assert.match(body, /is_development:r\.is_development\|\|!r\.requested_qty\|\|!r\.target_price/)
  assert.match(body, /inquiry_group_id:groupId/)
})

test('assistant dashboard exposes operational shortcuts', () => {
  const body = extractFunction('renderAssistantDashboard')
  assert.match(body, /登記客戶詢價/)
  assert.match(body, /供應商到貨/)
  assert.match(body, /客戶出貨/)
  assert.match(body, /補齊待辦資料/)
})

test('language refresh preserves the signed-in user shown in the sidebar', () => {
  const body = extractFunction('init')
  const translationAt = body.indexOf('applyI18n()')
  const userRefreshAt = body.indexOf("document.getElementById('sidebar-user-email').textContent", translationAt)
  assert.notEqual(translationAt, -1)
  assert.ok(userRefreshAt > translationAt)
})

test('mixed receiving supports split allocation and atomic inventory posting', () => {
  const ui = extractFunction('saveReceivingMatches')
  assert.match(ui, /allocate_receiving_item/)
  assert.match(ui, /分配超過剩餘到貨量/)
  const migration = fs.readFileSync(path.join(__dirname, '..', 'supabase', 'migrations', '20260719030000_operational_traceability.sql'), 'utf8')
  assert.match(migration, /create table if not exists public\.receiving_allocations/)
  assert.match(migration, /create or replace function public\.allocate_receiving_item/)
  assert.match(migration, /Allocation exceeds physical received quantity/)
  assert.match(migration, /Receipt exceeds purchase quantity and requires manager approval/)
})

test('unlinked customer shipment can be linked without changing stock again', () => {
  const body = extractFunction('saveStockOrderLink')
  assert.match(body, /needs_link_review:false/)
  assert.match(body, /訂單客戶與出貨客戶不一致/)
  assert.doesNotMatch(body, /post_inventory_transaction/)
})

test('supplier shortfall can be carried to the next purchase atomically', () => {
  const body = extractFunction('carryShortfallToPurchase')
  assert.match(body, /carry_shortfall_to_purchase/)
  const migration = fs.readFileSync(path.join(__dirname, '..', 'supabase', 'migrations', '20260719030000_operational_traceability.sql'), 'utf8')
  assert.match(migration, /create or replace function public\.carry_shortfall_to_purchase/)
  assert.match(migration, /status='added_to_next_po'/)
  assert.match(migration, /Target purchase order can no longer accept items/)
  assert.doesNotMatch(migration, /v_source_item\.rolls_qty/)
})

test('new order item calculation displays the selected currency', () => {
  const body = extractFunction('refreshNoiCalc')
  assert.match(body, /esc\(cur\)/)
  assert.doesNotMatch(body, /THB<\/strong>/)
})

test('login delegates password verification to Supabase Auth', () => {
  const login = extractFunction('doLogin')
  const restore = extractFunction('checkAuth')
  assert.match(login, /auth\.signInWithPassword/)
  assert.match(login, /loadSignedInProfile/)
  assert.match(restore, /auth\.getSession/)
  assert.doesNotMatch(html, /data\.password_hash\s*!==/)
  assert.doesNotMatch(html, /select\('password_hash'\)/)
  assert.doesNotMatch(html, /update\(\{password_hash:/)
})

test('account administration uses a trusted Edge Function', () => {
  for (const name of ['createUser', 'saveUserDetail', 'submitResetUserPassword', 'toggleUserActive', 'deleteUser']) {
    assert.match(extractFunction(name), /callUserAdmin/)
  }
  assert.match(extractFunction('submitChangePassword'), /auth\.updateUser/)
})

test('RLS lockdown removes anonymous and cross-company access', () => {
  const migration = fs.readFileSync(path.join(__dirname, '..', 'supabase', 'migrations', '20260719040000_auth_lockdown.sql'), 'utf8')
  assert.match(migration, /revoke all on all tables in schema public from anon/)
  assert.match(migration, /users_select_self_or_manager/)
  assert.match(migration, /suppliers_external_self/)
  assert.match(migration, /customers_external_self/)
  assert.match(migration, /drop policy if exists "allow all" on storage\.objects/)
  assert.match(migration, /joychin_documents_internal/)
  assert.match(migration, /update public\.users set password_hash=null/)
})

test('external writes use scoped security-definer workflows', () => {
  assert.match(extractFunction('_spSubmitShipment'), /supplier_create_shipment/)
  assert.match(extractFunction('submitShipFeedback'), /customer_submit_sample_feedback/)
  const migration = fs.readFileSync(path.join(__dirname, '..', 'supabase', 'migrations', '20260719040000_auth_lockdown.sql'), 'utf8')
  assert.match(migration, /Shipment item is outside the supplier account/)
  assert.match(migration, /Sample shipment is outside the customer account/)
})
