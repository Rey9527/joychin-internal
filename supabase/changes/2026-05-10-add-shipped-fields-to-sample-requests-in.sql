ALTER TABLE sample_requests_in ADD COLUMN IF NOT EXISTS shipped_date DATE;
ALTER TABLE sample_requests_in ADD COLUMN IF NOT EXISTS supplier_shipped_status TEXT DEFAULT 'pending';
