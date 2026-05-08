ALTER TABLE public.shipments
  ADD COLUMN IF NOT EXISTS container_size text;
