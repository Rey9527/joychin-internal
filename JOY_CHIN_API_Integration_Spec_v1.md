# JOY CHIN AI 營運助手 API 串接規格 v1

> 文件狀態：已納入重建設計，待實作  
> API 階段：Phase 1（唯讀）  
> 最後更新：2026-08-30  
> 適用系統：JOY CHIN 貿易管理系統、ChatGPT／私有 AI、Notion 任務中控台

## 1. 文件目的

本文件定義 JOY CHIN 系統與 AI 營運助手的資料邊界、安全規則、Phase 1 唯讀 API，以及後續 Phase 2、Phase 3 的開放條件。

JOY CHIN 系統是客戶、報價、訂單、採購、收貨、庫存、批號、出貨與財務交易的唯一真實來源（System of Record）。Notion 只保存跨公司任務、決策、知識與風險追蹤，不複製完整交易明細。ChatGPT／私有 AI 是語音、文字、截圖理解與受控操作層，不是交易資料庫。

本版本只准許 AI 查詢與分析。不得提供任何正式交易寫入能力。

### 穩定文件位置

- GitHub：`https://github.com/Rey9527/joychin-internal/blob/main/JOY_CHIN_API_Integration_Spec_v1.md`
- Raw：`https://raw.githubusercontent.com/Rey9527/joychin-internal/main/JOY_CHIN_API_Integration_Spec_v1.md`

## 2. 不可違反的原則

1. 每筆核心資料必須同時具備不可變 UUID、供人員使用的正式單號、`created_at`、`updated_at`、`created_by`、`updated_by`。
2. 正式交易變動必須寫入不可覆蓋的 audit log；更正以反向沖銷或新版本處理，不可改寫歷史。
3. 權限採 RBAC：`Admin`、`Sales`、`Operations`、`Warehouse`、`Finance`、`Viewer`、`AI Service`。
4. `SUPABASE_SERVICE_ROLE_KEY` 及其他密鑰不得存在前端、Git、瀏覽器儲存空間、AI 提示詞或 Notion。
5. 對外整合 API 固定以 `/api/v1` 起始，具備測試環境、標準錯誤碼、請求追蹤 ID 與 OpenAPI 文件。
6. 批號必須由 GRN／收貨與 packing list 建立，且可追溯 `Lot → GRN → PO → SO → Customer`。
7. AI 不得自行確認訂單、保留或扣減庫存、改價、套用價格例外、過帳、出貨、刪除資料。
8. 資料不足、來源矛盾或關聯不唯一時，AI 必須指出缺漏並要求人員確認，不得猜測。

## 3. 本次程式庫現況檢查

以下結論是依 2026-08-30 程式庫中的 schema、migration、Edge Function 與前端程式碼判定。正式 Supabase 專案是否已套用相同 migration，仍須另以資料庫唯讀檢查確認。

| 項目 | 現況 | 判定 | 主要差距 |
|---|---|---|---|
| 核心資料模型 | 已有詢價、報價、訂單、PO、出貨、收貨批次、庫存批號與庫存異動 | 部分符合 | 多數主鍵仍是 bigint 或文字單號，沒有全域 UUID；操作者與更新時間欄位不一致 |
| 交易關聯 | 已可關聯 Inquiry → Quote → SO → PO → Shipment；庫存異動可連客戶、SO、PO、收貨批次及批號 | 部分符合 | packing list 尚未成為正式來源實體；不是所有歷史資料都有完整關聯 |
| 庫存 | 有 `inventory_lots`、append-only 概念的 `inventory_transactions`、收貨配對與短交承接 | 部分符合 | 尚無正式庫存保留模型；可用／保留／在途／隔離的統一計算模型未完成 |
| 財務／應收 | 核心 schema 未見完整 invoice、應收與收款台帳 | 不符合 | 客戶 360 的應收與逾期風險目前沒有可信來源，不得由 AI 推測 |
| RBAC | 現有角色為 admin、manager、user、supplier、customer；另有少量群組權限 | 不符合 | 與七種重建角色不一致；一般內部人員目前對多數表具通用 CRUD；沒有唯讀 AI Service |
| RLS | 已撤銷 anon，並為內部、客戶、供應商建立 RLS／Storage policy | 部分符合 | 內部權限粒度太粗；尚未證實正式環境已完整套用；AI 欄位遮罩與資料範圍未定義完成 |
| 密鑰 | 前端使用 Supabase anon key；`admin-users` 的 service-role key 由伺服器環境讀取 | 基礎符合 | 仍需環境分離、密鑰輪替與 secret scan；AI 不得取得 service-role key |
| 附件 | 有私有 inquiry、order、shipment buckets；詢價支援圖片、PDF、Excel 等附件及時間軸 | 部分符合 | 尚無檔案雜湊、惡意檔案檢查、AI 擷取版本、信心值、確認狀態與保留政策 |
| Audit log | 有 `activity_logs`；庫存異動設計為反向沖銷；部分文件事件另有紀錄 | 不符合 | 多由前端主動寫入，不涵蓋所有資料變更；不是資料庫強制、不可竄改的完整 audit log |
| API | 前端直接呼叫 Supabase table／RPC；有未版本化的 `admin-users` Edge Function | 不符合 | 沒有 `/api/v1`、統一 response/error、OpenAPI、rate limit、測試環境或 AI 專用 API 邊界 |
| 唯讀查詢 | 已有 `app_list_products`、`app_list_quote_items`、`app_list_inquiries` RPC | 部分符合 | 只服務目前前端，尚不能視為穩定整合契約；缺客戶 360、履約、庫存可用量、未到貨 PO 與風險聚合 |
| 測試與監控 | 有 Node 核心邏輯測試 | 部分符合 | 缺 API contract、RBAC、RLS、資料隔離、效能、稽核完整性與正式環境 smoke test |

## 4. 優先差距清單

### Critical — Phase 1 上線前必須完成

1. 建立 `AI Service` 唯讀身分，且資料庫層明確禁止其 INSERT、UPDATE、DELETE 及交易型 RPC。
2. 驗證正式 Supabase 已套用 RLS；匿名使用者不得讀取任何內部交易資料。
3. 建立 `/api/v1` 安全邊界。AI 不得直接持有 service-role key，也不得直接查基礎資料表。
4. 建立資料庫強制的 append-only audit log，並撤銷一般角色對 audit log 的 UPDATE／DELETE。
5. 對正式環境、測試環境及本機環境分開管理密鑰與資料。

### High — Phase 1 查詢可信度的前置工作

1. 為核心實體新增並回填 UUID；保留既有正式單號供人員閱讀，不再把單號當唯一技術識別。
2. 統一 `created_at`、`updated_at`、`created_by`、`updated_by`，操作者應關聯使用者 UUID，不能只存名字。
3. 建立庫存保留、隔離與在途的正式計算來源，禁止只讀取 `products.stock_qty` 當作可用庫存。
4. 建立 packing list 實體及其與 GRN、PO、批號的關聯。
5. 建立應收／收款的真實資料來源；完成前，API 必須回傳 `data_quality` 警告，不能產生假的應收摘要。
6. 先完成重複客戶、供應商、產品與歷史文字欄位／外鍵混用的資料品質盤點。

### Medium — 正式整合前完成

1. 附件加入 SHA-256、掃毒狀態、來源、保留政策與 AI 擷取版本。
2. 所有 API 回應加入 `request_id`、資料時間、資料品質警告與分頁資訊。
3. 加入 rate limit、逾時、結構化日誌、告警與 API 使用稽核。
4. 建立 OpenAPI contract test、RBAC/RLS 整合測試及效能基準。

## 5. 目標技術邊界

Phase 1 建議以 Supabase Edge Function `api-v1` 作為單一入口，公開路徑為 `/api/v1/*`。Edge Function 驗證短效 JWT，並以呼叫者身分執行安全的唯讀 view／RPC；不得以 service-role 身分繞過 RLS 讀取業務資料。

```text
ChatGPT／私有 AI
        │  短效 JWT、唯讀請求
        ▼
Supabase Edge Function: api-v1
        │  驗證身分、RBAC、欄位遮罩、rate limit、request_id
        ▼
api_v1_* 唯讀 View／RPC
        │
        ▼
JOY CHIN PostgreSQL（唯一真實來源）
```

Notion 只接收任務 ID、標題、狀態、負責人、截止日、風險摘要及 JOY CHIN 深層連結。完整客戶、價格、訂單明細、庫存及財務資料仍留在 JOY CHIN。

## 6. RBAC 目標

| 角色 | Phase 1 權限摘要 |
|---|---|
| Admin | 全部唯讀；管理角色與整合設定。交易寫入仍遵守核准規則 |
| Sales | 客戶、詢價、報價、SO 與相關履約摘要；成本依欄位權限遮罩 |
| Operations | SO、PO、交期、收貨與跨模組異常 |
| Warehouse | GRN、packing list、批號、庫存、保留與出貨作業資料 |
| Finance | 報價財務欄位、發票、應收、收款與逾期資訊 |
| Viewer | 經核准範圍內的唯讀資料，無敏感成本及財務欄位 |
| AI Service | 只可執行核准的 `/api/v1` GET 查詢；不可直接存取基礎表或任何寫入 RPC |

外部 `supplier`、`customer` 是入口／資料範圍身分，不等同上述內部職能角色；重建時應以 `role + organization_scope + field_permissions` 表達。

## 7. Phase 1 唯讀 API

### 7.1 共通規則

- 只開放 `GET` 與 `HEAD`；Phase 1 不提供 POST、PUT、PATCH、DELETE。
- 日期時間使用 ISO 8601 UTC；金額必須同時提供數值與 ISO 4217 幣別。
- 數量必須同時提供原始單位與基準單位，不得靜默換算。
- 清單 API 必須支援 cursor pagination，預設 50 筆，上限 200 筆。
- 每個回應附帶資料產生時間與 `data_quality`；缺資料時回傳明確缺口，不猜測。
- 成本、毛利、應收等敏感欄位按角色遮罩；被遮罩欄位不以 `0` 假裝真值。

成功回應：

```json
{
  "data": {},
  "meta": {
    "request_id": "uuid",
    "generated_at": "2026-08-30T00:00:00Z",
    "data_quality": {
      "status": "complete",
      "warnings": []
    }
  }
}
```

錯誤回應：

```json
{
  "error": {
    "code": "FORBIDDEN",
    "message": "The caller cannot access this resource",
    "request_id": "uuid",
    "details": []
  }
}
```

標準錯誤碼：`AUTH_REQUIRED`、`INVALID_TOKEN`、`FORBIDDEN`、`VALIDATION_ERROR`、`NOT_FOUND`、`CONFLICTING_SOURCE_DATA`、`DATA_INCOMPLETE`、`RATE_LIMITED`、`UPSTREAM_TIMEOUT`、`INTERNAL_ERROR`。

### 7.2 端點

| Method／Path | 用途 | 最低必要內容 |
|---|---|---|
| `GET /api/v1/health` | 健康與版本檢查 | API version、環境、服務狀態；不得洩漏密鑰或資料庫資訊 |
| `GET /api/v1/customers/{customer_uuid}/360` | 客戶 360 | 客戶摘要、近期詢價／報價／SO／出貨、未交量、應收摘要、風險與深層連結 |
| `GET /api/v1/quotes` | 報價搜尋 | 客戶、狀態、日期、產品、版本篩選；欄位按權限遮罩 |
| `GET /api/v1/quotes/{quote_uuid}` | 單一報價與版本脈絡 | 報價表頭、品項、版本鏈、有效期、接受狀態與來源詢價 |
| `GET /api/v1/orders` | 訂單履約清單 | 訂購、已交、未交、承諾日、最近出貨與異常 |
| `GET /api/v1/orders/{order_uuid}/fulfillment` | 單一訂單履約 | 分批出貨、各品項已交／未交、相關 PO、批號、交期與例外 |
| `GET /api/v1/inventory/availability` | 可用庫存 | on hand、reserved、quarantine、available、in transit、safety stock、短缺與單位 |
| `GET /api/v1/purchase-orders/open` | 未到貨 PO | 訂購量、累計收貨、未到貨量、預計交期、逾期天數、短交與供應商 |
| `GET /api/v1/risks/trade` | 貿易風險 | 缺貨、低庫存、延遲 SO／PO、逾期應收、待客戶確認與資料品質異常 |
| `GET /api/v1/openapi.json` | 機器可讀契約 | OpenAPI 3.1，與部署版本一致 |

### 7.3 核心計算定義

- `ordered_qty`：有效 SO 品項的確認數量。
- `shipped_qty`：已過帳且關聯該 SO 品項的客戶出貨量；草稿與已沖銷異動不計。
- `outstanding_qty = ordered_qty - shipped_qty - cancelled_qty`。
- `on_hand`：已過帳庫存異動按基準單位的淨額，並可與有效批號餘量對帳。
- `reserved`：有效庫存保留紀錄總和；目前資料模型缺少此來源，完成前不得以 0 代替未知。
- `available = on_hand - reserved - quarantine`。
- `in_transit`：已確認 PO 的訂購量減去合格收貨量；取消、結清與沖銷紀錄不計。
- `safety_stock`：產品／倉庫層級的核准安全庫存；目前 `min_stock_qty` 可作過渡來源，但須留下來源標記。
- `overdue_receivable`：已過付款到期日且未結清的應收餘額；沒有發票與收款來源時回傳 `DATA_INCOMPLETE`。

## 8. Phase 1 實作計畫

### P1-0：正式環境盤點與凍結契約

1. 唯讀匯出正式 Supabase 的 tables、columns、constraints、RLS、policies、functions、buckets 與 grants。
2. 比對程式庫 migration 與正式環境，列出 drift，不直接改正式資料。
3. 盤點重複主檔、空外鍵、單號碰撞、負庫存、未連 SO／PO／GRN 的交易。
4. 產出 OpenAPI 3.1 初稿與 JSON 範例，先以 contract test 鎖定欄位。

驗收：正式環境與 Git schema 差異有報告；所有 Phase 1 欄位都有資料來源、權限與缺值規則。

### P1-1：識別、RBAC 與稽核基礎

1. 為核心表新增 UUID 並回填；既有單號保留為唯一業務編號。
2. 統一時間與操作者欄位。
3. 建立七種內部角色、組織範圍及欄位權限；新增專用 `AI Service` 測試帳號。
4. 建立 DB trigger audit log，保存 actor、action、table、record UUID、before/after、request ID、來源與時間。
5. audit log 只允許資料庫寫入，業務角色只能依權限讀取，任何人不得 UPDATE／DELETE。

驗收：AI Service 對所有基礎表與交易 RPC 的直接寫入均得到拒絕；每次受控測試變更都產生 audit event。

### P1-2：唯讀資料投影

建立安全、可測試的 `api_v1_*` view／RPC：

- `api_v1_customer_360`
- `api_v1_quote_detail`
- `api_v1_order_fulfillment`
- `api_v1_inventory_availability`
- `api_v1_open_purchase_orders`
- `api_v1_trade_risks`

同時補齊庫存保留、packing list 與應收資料來源。若來源尚未完成，投影必須輸出 `data_quality` 缺口，不能自行填 0 或推測。

驗收：每個聚合數字都能追溯至來源紀錄；庫存與訂單抽樣可人工重新計算一致。

### P1-3：`/api/v1` Gateway

1. 建立 Supabase Edge Function `api-v1`，只接受核准的 GET 路由。
2. 驗證短效 JWT、帳號啟用狀態、RBAC、組織範圍及欄位遮罩。
3. 加入 cursor pagination、rate limit、timeout、request ID、結構化 access log 與一致錯誤碼。
4. 部署獨立 staging；正式與 staging 使用不同 Supabase 專案、身分及密鑰。
5. 發布 `/api/v1/openapi.json`，CI 驗證實作不得偏離契約。

驗收：未登入、過期 token、越權角色、跨公司查詢、參數注入與大量查詢均通過安全測試。

### P1-4：AI 查詢整合與上線閘門

1. 只把 OpenAPI 唯讀操作提供給 ChatGPT／私有 AI。
2. 建立問題集：客戶近況、報價版本、未交訂單、缺貨、未到貨 PO、交期與風險。
3. 驗證 AI 回答中的每個數字都附來源 UUID／單號與 JOY CHIN 深層連結。
4. 執行桌面／手機、Sales／Operations／Warehouse／Finance／Viewer／AI Service 權限測試。
5. 經負責人簽核後才發布 production；保留 kill switch，可立即停用 AI token。

驗收：Phase 1 OpenAPI 中沒有交易寫入 operation；AI 無法透過任何路徑修改 JOY CHIN 或 Notion 的正式交易資料。

## 9. Phase 1 測試矩陣

- 驗證 anon 完全不能讀取業務資料。
- 驗證 AI Service 只能呼叫白名單 GET，不能直查表、Storage 或執行寫入 RPC。
- 驗證不同角色的成本、毛利、應收與跨公司資料遮罩。
- 驗證所有清單的分頁、排序、篩選、空結果、未知資料與重複資料處理。
- 驗證 SO 分批出貨、PO 短交、超收、退貨、沖銷、隔離批號與負庫存邊緣案例。
- 驗證公斤、米、平方米、卷、箱等單位沒有換算依據時回傳警告，不猜比例。
- 驗證資料庫／網路逾時不回傳部分結果為完整結果。
- 驗證每個 API access log 都有 request ID、呼叫身分、路由、結果與耗時，但不記錄密鑰。

## 10. Phase 2：AI 草稿（本次不實作）

使用者上傳 LINE／WhatsApp／Email 對話截圖後，AI 擷取客戶、產品、規格、數量、單位、幣別、價格、交期、付款條件與特殊要求；比對既有資料並列出缺失或衝突。只有在人員確認後，才能建立 Inquiry Draft 或 Quote Draft。

草稿必須保留：原始附件、SHA-256、上傳者、來源管道、AI 模型／提示版本、逐欄信心值、AI 摘要、缺漏、衝突、確認者與確認時間。資料不足時不得猜測。

Notion 任務只保存追蹤資訊與 JOY CHIN 連結；不得把完整交易明細當成第二份主資料。

## 11. Phase 3：受控寫入（本次不實作）

只有 Phase 2 草稿與送審流程穩定並通過稽核後，才能考慮：

- 從已核准報價建立 SO 草稿。
- 建立採購草稿及出貨草稿。

正式確認、庫存保留或扣減、價格例外、正式出貨與財務過帳，必須由指定角色核准。刪除正式交易不列入 AI 能力；更正必須用版本、作廢或反向沖銷並留下 audit log。

## 12. 本次明確不做

- 不新增或開放任何 AI 正式交易寫入 API。
- 不讓 AI 自動確認 SO／PO、扣庫存、改價格、出貨或過帳。
- 不把 service-role key 交給前端、ChatGPT、Notion 或第三方客戶端。
- 不在未核對正式資料庫前聲稱 migration 已正式生效。
- 不以 AI 推測補齊缺少的價格、數量、單位、交期、客戶或財務資料。

## 13. Phase 1 完成定義

Phase 1 只有在下列條件全部滿足後才算完成：

1. `/api/v1/openapi.json` 與正式 API 行為一致。
2. AI Service 只有核准的唯讀能力，資料庫與 Storage 寫入測試全部被拒絕。
3. 客戶 360、報價、訂單履約、庫存、未到貨 PO 與貿易風險均有可追溯來源。
4. UUID、正式單號、時間、操作者與不可覆蓋 audit log 已涵蓋核心實體。
5. GRN／packing list／PO／SO／客戶的批號追溯鏈可被 API 查出。
6. 敏感欄位、跨公司資料、RLS、錯誤碼、分頁、效能與資料品質測試通過。
7. staging 驗收完成，production 密鑰與 AI token 可獨立撤銷，且已有回復與停用程序。
