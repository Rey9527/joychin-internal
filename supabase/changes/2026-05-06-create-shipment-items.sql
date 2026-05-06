CREATE TABLE IF NOT EXISTS public.shipment_items (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  shipment_id bigint NOT NULL REFERENCES public.shipments(id) ON DELETE CASCADE,
  po_id text,
  product_id bigint,
  product_name text,
  spec text,
  qty numeric,
  unit text DEFAULT '',
  note text DEFAULT '',
  created_at timestamp with time zone DEFAULT now()
);

CREATE INDEX IF NOT EXISTS shipment_items_shipment_id_idx ON public.shipment_items(shipment_id);
CREATE INDEX IF NOT EXISTS shipment_items_po_id_idx ON public.shipment_items(po_id);
