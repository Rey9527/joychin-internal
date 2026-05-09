ALTER TABLE public.shipment_items
  ADD COLUMN IF NOT EXISTS status text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS po_item_id bigint;
