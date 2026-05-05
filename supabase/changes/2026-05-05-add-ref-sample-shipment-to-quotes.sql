ALTER TABLE public.quote_headers
  ADD COLUMN IF NOT EXISTS ref_sample_shipment_id bigint REFERENCES public.sample_shipments_out(id);
