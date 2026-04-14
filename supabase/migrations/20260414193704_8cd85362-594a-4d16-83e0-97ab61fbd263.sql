
DROP POLICY IF EXISTS "do_authenticated_insert" ON public.delivery_orders;
CREATE POLICY "do_authenticated_insert" ON public.delivery_orders FOR INSERT TO authenticated WITH CHECK (
  EXISTS (SELECT 1 FROM orders WHERE orders.id = delivery_orders.order_id AND orders.customer_id = auth.uid())
  OR has_role(auth.uid(), 'admin'::app_role)
);
