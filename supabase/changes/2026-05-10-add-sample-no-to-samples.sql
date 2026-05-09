ALTER TABLE public.samples
  ADD COLUMN IF NOT EXISTS sample_no text DEFAULT NULL;
