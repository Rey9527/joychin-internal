CREATE TABLE IF NOT EXISTS public.shipment_documents (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  shipment_id bigint NOT NULL REFERENCES public.shipments(id) ON DELETE CASCADE,
  doc_type text NOT NULL DEFAULT 'other',
  file_name text NOT NULL,
  file_path text NOT NULL,
  file_size bigint,
  uploaded_by text,
  created_at timestamp with time zone DEFAULT now()
);

CREATE INDEX IF NOT EXISTS shipment_documents_shipment_id_idx ON public.shipment_documents(shipment_id);
