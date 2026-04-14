-- Extend couriers table
ALTER TABLE public.couriers
  ADD COLUMN IF NOT EXISTS cpf text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS cnpj text DEFAULT '',
  ADD COLUMN IF NOT EXISTS vehicle_plate text DEFAULT '',
  ADD COLUMN IF NOT EXISTS address_street text DEFAULT '',
  ADD COLUMN IF NOT EXISTS address_number text DEFAULT '',
  ADD COLUMN IF NOT EXISTS address_neighborhood text DEFAULT '',
  ADD COLUMN IF NOT EXISTS address_city text DEFAULT '',
  ADD COLUMN IF NOT EXISTS address_state text DEFAULT '',
  ADD COLUMN IF NOT EXISTS address_zip text DEFAULT '',
  ADD COLUMN IF NOT EXISTS selfie_url text DEFAULT '',
  ADD COLUMN IF NOT EXISTS vehicle_photo_url text DEFAULT '',
  ADD COLUMN IF NOT EXISTS pix_key text DEFAULT '',
  ADD COLUMN IF NOT EXISTS pix_key_type text DEFAULT '',
  ADD COLUMN IF NOT EXISTS registration_status text NOT NULL DEFAULT 'pending';

-- Storage bucket for courier photos
INSERT INTO storage.buckets (id, name, public) VALUES ('courier-documents', 'courier-documents', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Authenticated users can upload courier docs"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'courier-documents' AND auth.uid() IS NOT NULL);

CREATE POLICY "Public can view courier docs"
ON storage.objects FOR SELECT
USING (bucket_id = 'courier-documents');

CREATE POLICY "Users can update their own courier docs"
ON storage.objects FOR UPDATE
USING (bucket_id = 'courier-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow authenticated users to insert couriers (for self-registration)
CREATE POLICY "Authenticated users can register as courier"
ON public.couriers FOR INSERT
WITH CHECK (auth.uid() = user_id);