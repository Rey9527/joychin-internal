ALTER TABLE public.complaints
  ADD COLUMN IF NOT EXISTS related_order_id text DEFAULT NULL;
