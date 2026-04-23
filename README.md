# joychin-internal

JOY CHIN 內部業務管理 HTML 專案  
Internal HTML app for JOY CHIN internal workflow management.

## 狀態 / Status
- `Beta`

## 目前版本 / Current Version
- `v0.3.0`

## 專案說明 / Project Overview
這個專案目前是一個單檔 HTML 應用，主要用於管理詢價、報價、樣品、工作追蹤、訂單、採購、客戶、供應商、產品與文件。  
This project is currently a single-file HTML application used to manage inquiries, quotations, samples, task tracking, orders, purchases, customers, suppliers, products, and documents.

## 主要檔案 / Main File
- `index.html`

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
- 後續 schema 變更應記錄在 `supabase` 資料夾。  
  Future schema changes should be documented in the `supabase` folder.
