
-- 1. FIX: Courier PII exposed publicly
DROP POLICY IF EXISTS "Public can view active couriers" ON public.couriers;

CREATE POLICY "Authenticated can view active courier basics"
ON public.couriers FOR SELECT TO authenticated
USING (
  is_active = true
  AND (
    auth.uid() = user_id
    OR has_role(auth.uid(), 'admin'::app_role)
  )
);

-- 2. FIX: delivery_orders waiting status publicly readable
DROP POLICY IF EXISTS "do_waiting_select" ON public.delivery_orders;

CREATE POLICY "do_waiting_courier_select"
ON public.delivery_orders FOR SELECT TO authenticated
USING (
  status = 'waiting'
  AND EXISTS (
    SELECT 1 FROM couriers c
    WHERE c.user_id = auth.uid()
      AND c.is_active = true
      AND c.registration_status = 'approved'
  )
);

-- 3. FIX: transaction_logs unrestricted INSERT
DROP POLICY IF EXISTS "tl_authenticated_insert" ON public.transaction_logs;

CREATE POLICY "tl_authenticated_insert_restricted"
ON public.transaction_logs FOR INSERT TO authenticated
WITH CHECK (actor_id = auth.uid());

-- 4. FIX: courier-documents bucket - make private
UPDATE storage.buckets SET public = false WHERE id = 'courier-documents';

DROP POLICY IF EXISTS "Public can view courier docs" ON storage.objects;

CREATE POLICY "Courier or admin can view docs"
ON storage.objects FOR SELECT USING (
  bucket_id = 'courier-documents'
  AND (
    (auth.uid())::text = (storage.foldername(name))[1]
    OR has_role(auth.uid(), 'admin'::app_role)
  )
);

-- 5. FIX: payment-receipts bucket - make private
UPDATE storage.buckets SET public = false WHERE id = 'payment-receipts';

DROP POLICY IF EXISTS "pr_storage_select" ON storage.objects;
DROP POLICY IF EXISTS "pr_storage_insert" ON storage.objects;

CREATE POLICY "pr_storage_select_restricted"
ON storage.objects FOR SELECT USING (
  bucket_id = 'payment-receipts'
  AND (
    (auth.uid())::text = (storage.foldername(name))[1]
    OR has_role(auth.uid(), 'admin'::app_role)
  )
);

CREATE POLICY "pr_storage_insert_restricted"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'payment-receipts'
  AND (auth.uid())::text = (storage.foldername(name))[1]
);

-- 6. FIX: banners storage - restrict to admins
DROP POLICY IF EXISTS "Auth upload banners" ON storage.objects;
DROP POLICY IF EXISTS "Auth update banners" ON storage.objects;
DROP POLICY IF EXISTS "Auth delete banners" ON storage.objects;

CREATE POLICY "Admin upload banners"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'banners' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admin update banners"
ON storage.objects FOR UPDATE USING (bucket_id = 'banners' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admin delete banners"
ON storage.objects FOR DELETE USING (bucket_id = 'banners' AND has_role(auth.uid(), 'admin'::app_role));

-- 7. FIX: products storage - restrict to store owners
DROP POLICY IF EXISTS "Auth upload products" ON storage.objects;
DROP POLICY IF EXISTS "Auth update products" ON storage.objects;
DROP POLICY IF EXISTS "Auth delete products" ON storage.objects;

CREATE POLICY "Store owner upload products"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'products' AND (EXISTS (SELECT 1 FROM stores WHERE owner_id = auth.uid()) OR has_role(auth.uid(), 'admin'::app_role)));

CREATE POLICY "Store owner update products"
ON storage.objects FOR UPDATE USING (bucket_id = 'products' AND (EXISTS (SELECT 1 FROM stores WHERE owner_id = auth.uid()) OR has_role(auth.uid(), 'admin'::app_role)));

CREATE POLICY "Store owner delete products"
ON storage.objects FOR DELETE USING (bucket_id = 'products' AND (EXISTS (SELECT 1 FROM stores WHERE owner_id = auth.uid()) OR has_role(auth.uid(), 'admin'::app_role)));
