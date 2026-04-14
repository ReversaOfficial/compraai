
INSERT INTO storage.buckets (id, name, public)
VALUES ('popup-ads', 'popup-ads', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public can view popup images"
ON storage.objects FOR SELECT
USING (bucket_id = 'popup-ads');

CREATE POLICY "Admins can upload popup images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'popup-ads' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update popup images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'popup-ads' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete popup images"
ON storage.objects FOR DELETE
USING (bucket_id = 'popup-ads' AND public.has_role(auth.uid(), 'admin'));
