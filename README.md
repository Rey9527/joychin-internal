# joychin-internal

JOY CHIN 內部業務管理 HTML 專案  
Internal HTML app for JOY CHIN internal workflow management.

## 狀態 / Status
- `Beta`

## 目前版本 / Current Version
- `v0.17.0`

## 專案說明 / Project Overview
這個專案目前是一個單檔 HTML 應用，主要用於管理詢價、報價、樣品、工作追蹤、訂單、採購、客戶、供應商、產品與文件。  
This project is currently a single-file HTML application used to manage inquiries, quotations, samples, task tracking, orders, purchases, customers, suppliers, products, and documents.

## 主要檔案 / Main File
- `index.html`

## 已完成模組 / Completed Modules
- 詢價管理
- 報價管理
- 客戶管理
- 供應商管理
- 產品目錄（含卡片／條列切換、到期提醒）
- 樣品管理
- 工作追蹤
- 訂單管理
- 採購單管理（含採購選購流程）
- 使用者管理（含登入權限控制）
- Supabase Auth 登入、角色／跨公司 RLS 與私有附件權限
- 成本欄位 API 遮罩與防寫入保護（產品、報價、詢價）
- 客戶部分接受報價後選品轉訂單，並依供應商自動拆採購單
- 詢價 LINE 截圖／供應商文件附件與完整聯絡時間軸
- 現代化響應式介面：統一設計系統、清楚導覽、易讀卡片與手機觸控優化
- 統一庫存流向台帳、混單到貨配對與供應商短交承接
- 庫存異動產品搜尋、現場單位自動換算與公司型供應商選單去重
- 庫存異動以增加／減少為第一步，再選原因；助理快捷入口固定流程避免重複選擇
- 儀表板（自動掃描待追蹤項目）
- 客訴管理（含折讓單追蹤）

## 資料庫 / Database
目前此專案共用同一個 Supabase project。  
This project currently uses a shared Supabase project.

相關參考檔案 / Reference files:
- `supabase/schema.sql`
- `supabase/notes.md`

## 開發方式 / Development Approach
目前以維持系統可運作與逐步改善可維護性為主。  
The current approach is to keep the system working while improving maintainability incrementally.

目前不另外拆分新的資料庫專案。  
At this stage, the database is not being split into a separate new project.

## 備註 / Notes
- `schema.sql` 是從 Supabase Schema Visualizer 複製的參考備份。  
  `schema.sql` was copied from Supabase Schema Visualizer as a reference backup.
- 這份 SQL 不保證可以直接執行。  
  This SQL is not guaranteed to be directly executable.
- 可執行的 schema 變更記錄在 `supabase/migrations`，並先在隔離資料庫驗證。
  Executable schema changes live in `supabase/migrations` and are verified in an isolated database first.
