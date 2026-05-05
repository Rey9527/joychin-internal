ALTER TABLE public.quote_headers
  ADD COLUMN IF NOT EXISTS needs_sample_review boolean DEFAULT false;
