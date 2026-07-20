const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const test = require('node:test')
const vm = require('node:vm')

const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8')
const workflowSpec = fs.readFileSync(path.join(__dirname, '..', 'WORKFLOW-SPEC.md'), 'utf8')

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
    { id: 2, country: 'CN', company: 'Joy Paper Co Ltd', name: 'Amy' },
    { id: 3, country: 'TH', company: 'Local Paper', name: 'Somchai' },
    { id: 4, country: 'TH', company: ' Joy  Paper Co Ltd ', name: 'Ben' }
  ],
  getInventoryUnit: () => 'roll',
  escapeHtml: value => String(value)
}
vm.createContext(sandbox)
for (const name of [
  'getSupplierCountryValue',
  'supplierNeedsCustoms',
  'shouldApplyCustoms',
  '_qiNormCost',
  '_qiMarginPct',
  '_qiFinalPrice',
  'poQtyToRolls',
  'supplierCompanyKey',
  'uniqueSupplierCompanies',
  'uniqueSupplierOptions',
  'uniqueSupplierCompanyNames',
  'stockMovementConversion'
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
  assert.match(body, /app_post_inventory_transaction/)
  assert.match(body, /procurement_shortfalls/)
  assert.match(body, /app_set_product_stock/)
  assert.match(body, /from\('purchase_orders'\)\.update\(\{status:'received'\}\)/)
  assert.match(body, /from\('shipments'\)\.update\(\{status:'completed'\}\)/)
})

test('customer shipments require a customer and preserve missing order linkage', () => {
  const movementBody = extractFunction('saveStockMovement')
  assert.match(movementBody, /\['customer_shipment','customer_return'\]\.includes\(type\)&&!customerId/)
  assert.match(movementBody, /\['supplier_receipt','supplier_return'\]\.includes\(type\)&&!supplierId/)
  assert.match(movementBody, /app_post_inventory_transaction/)
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
  assert.match(body, /openStockMovementModal\(\\'customer_shipment\\',true\)/)
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
  assert.match(ui, /app_allocate_receiving_item/)
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
  assert.match(body, /app_carry_shortfall_to_purchase/)
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

test('cost-bearing rows are loaded through masked RPCs and protected in SQL', () => {
  assert.match(extractFunction('loadProducts'), /rpc\('app_list_products'\)/)
  assert.match(extractFunction('loadQuotes'), /rpc\('app_list_quote_items'\)/)
  assert.match(extractFunction('loadInquiries'), /rpc\('app_list_inquiries'\)/)
  const migration = fs.readFileSync(path.join(__dirname, '..', 'supabase', 'migrations', '20260720010000_cost_and_quote_procurement.sql'), 'utf8')
  assert.match(migration, /jsonb_build_object\('cost_price',null\)/)
  assert.match(migration, /public\.app_has_permission\('view_cost'\)/)
  assert.match(migration, /products_cost_authorized_select/)
  assert.match(migration, /protect_product_cost_fields_trigger/)
  assert.match(migration, /protect_quote_cost_fields_trigger/)
  assert.match(migration, /protect_inquiry_cost_fields_trigger/)
  assert.match(migration, /revoke select on public\.inquiries from authenticated/)
})

test('inventory mutations use internal wrappers and underlying RPCs are private', () => {
  const migration = fs.readFileSync(path.join(__dirname, '..', 'supabase', 'migrations', '20260720010000_cost_and_quote_procurement.sql'), 'utf8')
  assert.match(migration, /create or replace function public\.app_set_product_stock/)
  assert.match(migration, /create or replace function public\.app_post_inventory_transaction/)
  assert.match(migration, /create or replace function public\.app_allocate_receiving_item/)
  assert.match(migration, /create or replace function public\.app_carry_shortfall_to_purchase/)
  assert.match(migration, /post_inventory_transaction[^;]+from public,anon,authenticated/s)
  assert.match(migration, /carry_shortfall_to_purchase[^;]+from public,anon,authenticated/s)
  assert.doesNotMatch(html, /from\('products'\)\.update\(\{stock_qty:/)
})

test('accepted quote items become an order and supplier-split purchase orders', () => {
  const selection = extractFunction('qovConfirm')
  const conversion = extractFunction('_executeQto')
  assert.match(selection, /請至少勾選一個客戶接受的品項/)
  assert.match(selection, /選擇至少一個顏色／印刷組合/)
  assert.match(selection, /都必須填寫大於 0 的數量/)
  assert.match(conversion, /create_purchase_orders_for_order/)
  assert.match(conversion, /supplier_id:/)
  assert.match(conversion, /supplier_cost:/)
  const migration = fs.readFileSync(path.join(__dirname, '..', 'supabase', 'migrations', '20260720010000_cost_and_quote_procurement.sql'), 'utf8')
  assert.match(migration, /group by oi\.supplier_id/)
  assert.match(migration, /purchase_order_order_links/)
  assert.match(migration, /個品項沒有綁定供應商/)
})

test('inquiry attachments use a private bucket and an auditable timeline', () => {
  assert.match(extractFunction('uploadInquiryAttachments'), /inquiry-attachments/)
  assert.match(extractFunction('recordInquiryEvent'), /inquiry_events/)
  assert.match(extractFunction('openInquiryAttachment'), /createSignedUrl/)
  const migration = fs.readFileSync(path.join(__dirname, '..', 'supabase', 'migrations', '20260720020000_inquiry_attachment_timeline.sql'), 'utf8')
  assert.match(migration, /create table if not exists public\.inquiry_events/)
  assert.match(migration, /'inquiry-attachments','inquiry-attachments',false,15728640/)
  assert.match(migration, /joychin_inquiry_attachments_internal/)
  assert.match(migration, /public\.app_is_internal\(\)/)
})

test('modern interface keeps a consistent responsive design system', () => {
  assert.match(html, /--jc-primary: #13715a/)
  assert.match(html, /\.sidebar \{[\s\S]*width: 244px/)
  assert.match(html, /\.nav-item\.active[\s\S]*linear-gradient/)
  assert.match(html, /\.assistant-action-icon[\s\S]*width: 48px/)
  assert.match(html, /button:focus-visible/)
  assert.match(html, /@media \(max-width: 680px\)[\s\S]*\.assistant-action-grid/)
  assert.match(html, /#login-page > div::before/)
  assert.match(html, /Beta v0\.18\.0/)
})

test('admin role preview changes perspective without changing identity and blocks writes', () => {
  assert.match(html, /function effectiveUserRole\(\)/)
  assert.match(html, /isActualAdmin\(\)&&previewRole/)
  assert.match(html, /function setRolePreview\(role\)/)
  assert.match(html, /角色預覽為唯讀模式/)
  assert.match(html, /previewSafeFetch/)
  assert.match(html, /Role preview is read-only/)
  assert.match(html, /const ROLE_TAB_ACCESS=/)
  assert.match(html, /這不是實際帳號權限測試/)
})

test('stock movement converts physical units into the product inventory unit', () => {
  assert.deepEqual(
    JSON.parse(JSON.stringify(sandbox.stockMovementConversion(1000, 'm', { inventory_unit: 'roll', meters_per_roll: 1000 }))),
    { quantity: 1, unit: 'roll', reason: '依米數' }
  )
  assert.ok(Math.abs(sandbox.stockMovementConversion(1070, 'm²', { inventory_unit: 'roll', width_m: 1.07, meters_per_roll: 1000 }).quantity - 1) < 1e-9)
  assert.equal(sandbox.stockMovementConversion(2, 'roll', { inventory_unit: 'roll' }).quantity, 2)
  assert.equal(sandbox.stockMovementConversion(500, 'kg', { inventory_unit: 'roll' }), null)
})

test('company-level supplier selectors collapse duplicate contact rows', () => {
  const companies = sandbox.uniqueSupplierCompanies()
  assert.equal(companies.length, 2)
  assert.deepEqual(JSON.parse(JSON.stringify(companies.map(x => x._company_label))), ['Joy Paper Co Ltd', 'Local Paper'])
  assert.equal((sandbox.uniqueSupplierOptions().match(/Joy Paper Co Ltd/g) || []).length, 1)
  assert.equal(sandbox.uniqueSupplierCompanies(4).find(x => x._company_label.trim() === 'Joy  Paper Co Ltd').id, 4)
  assert.deepEqual(JSON.parse(JSON.stringify(sandbox.uniqueSupplierCompanyNames())), ['Joy Paper Co Ltd', 'Local Paper'])
})

test('stock movement product selector includes search and conversion guidance', () => {
  const body = extractFunction('openStockMovementModal')
  assert.match(body, /openStockProductPicker/)
  assert.match(body, /現場收到／出貨數量/)
  assert.match(body, /換算後庫存異動量/)
  assert.match(extractFunction('stockProductPickerRows'), /product_code/)
  assert.match(extractFunction('updateStockMovementConversion'), /conversion-summary manual/)
})

test('stock movement starts with direction and keeps specialized shortcuts fixed', () => {
  const stockPage = html.slice(html.indexOf('<!-- 庫存流向 -->'), html.indexOf('<!-- 客訴管理 -->'))
  assert.match(stockPage, /stock-primary-action[^>]*onclick="openStockMovementModal\(\)"[^>]*>＋ 新增庫存異動/)
  assert.doesNotMatch(stockPage, /一般入庫/)
  assert.doesNotMatch(stockPage, /openStockMovementModal\('customer_shipment'\)/)
  const modalBody = extractFunction('openStockMovementModal')
  assert.match(modalBody, /第一步：庫存方向/)
  assert.match(modalBody, /第二步：異動原因/)
  assert.match(modalBody, /isLocked/)
  const directionBody = extractFunction('stockMovementDirectionChanged')
  assert.match(directionBody, /STOCK_MOVEMENT_REASONS\[direction\]/)
})

test('product development rules preserve usability and release requirements', () => {
  assert.match(workflowSpec, /產品開發與上線驗收準則/)
  assert.match(workflowSpec, /訪談正常流程時必須同時詢問邊緣案例/)
  assert.match(workflowSpec, /會持續增長的主檔選單，必須可搜尋/)
  assert.match(workflowSpec, /公司型選單必須以公司去重/)
  assert.match(workflowSpec, /只有產品具有可靠換算係數時才可自動換算/)
  assert.match(workflowSpec, /桌面與手機實際操作主要流程/)
  assert.match(workflowSpec, /直接呼叫 API 時也必須受到相同限制/)
})
