
-- Add platform_fee_percent to entregaai_settings
ALTER TABLE public.entregaai_settings ADD COLUMN IF NOT EXISTS platform_fee_percent numeric NOT NULL DEFAULT 10;

-- Couriers table
CREATE TABLE public.couriers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  name text NOT NULL,
  phone text NOT NULL DEFAULT '',
  city text NOT NULL DEFAULT '',
  neighborhoods text[] NOT NULL DEFAULT '{}',
  vehicle_type text NOT NULL DEFAULT 'moto',
  is_active boolean NOT NULL DEFAULT true,
  operational_status text NOT NULL DEFAULT 'available',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.couriers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage all couriers" ON public.couriers FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Couriers can view themselves" ON public.couriers FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Couriers can update themselves" ON public.couriers FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Public can view active couriers" ON public.couriers FOR SELECT USING (is_active = true);

CREATE TRIGGER update_couriers_updated_at BEFORE UPDATE ON public.couriers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Delivery orders table
CREATE TABLE public.delivery_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  store_id uuid REFERENCES public.stores(id) ON DELETE CASCADE NOT NULL,
  courier_id uuid REFERENCES public.couriers(id) ON DELETE SET NULL,
  customer_id uuid NOT NULL,
  pickup_address text NOT NULL DEFAULT '',
  delivery_address text NOT NULL DEFAULT '',
  neighborhood text NOT NULL DEFAULT '',
  city text NOT NULL DEFAULT '',
  freight_value numeric NOT NULL DEFAULT 0,
  platform_fee_percent numeric NOT NULL DEFAULT 0,
  platform_fee_amount numeric NOT NULL DEFAULT 0,
  courier_net_amount numeric NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'waiting',
  accepted_at timestamptz,
  picked_up_at timestamptz,
  in_route_at timestamptz,
  delivered_at timestamptz,
  cancelled_at timestamptz,
  paid_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.delivery_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "do_admin_all" ON public.delivery_orders FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "do_courier_select" ON public.delivery_orders FOR SELECT USING (EXISTS (SELECT 1 FROM couriers c WHERE c.id = delivery_orders.courier_id AND c.user_id = auth.uid()));
CREATE POLICY "do_courier_update" ON public.delivery_orders FOR UPDATE USING (EXISTS (SELECT 1 FROM couriers c WHERE c.id = delivery_orders.courier_id AND c.user_id = auth.uid()));
CREATE POLICY "do_waiting_select" ON public.delivery_orders FOR SELECT USING (status = 'waiting');
CREATE POLICY "do_store_select" ON public.delivery_orders FOR SELECT USING (EXISTS (SELECT 1 FROM stores WHERE stores.id = delivery_orders.store_id AND stores.owner_id = auth.uid()));
CREATE POLICY "do_customer_select" ON public.delivery_orders FOR SELECT USING (auth.uid() = customer_id);
CREATE POLICY "do_authenticated_insert" ON public.delivery_orders FOR INSERT TO authenticated WITH CHECK (true);

CREATE TRIGGER update_delivery_orders_updated_at BEFORE UPDATE ON public.delivery_orders FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Courier payouts table
CREATE TABLE public.courier_payouts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  courier_id uuid REFERENCES public.couriers(id) ON DELETE CASCADE NOT NULL,
  payout_date date NOT NULL DEFAULT CURRENT_DATE,
  total_deliveries integer NOT NULL DEFAULT 0,
  gross_amount numeric NOT NULL DEFAULT 0,
  platform_fee_total numeric NOT NULL DEFAULT 0,
  net_amount numeric NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pending',
  paid_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.courier_payouts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "cp_admin_all" ON public.courier_payouts FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "cp_courier_select" ON public.courier_payouts FOR SELECT USING (EXISTS (SELECT 1 FROM couriers c WHERE c.id = courier_payouts.courier_id AND c.user_id = auth.uid()));

CREATE TRIGGER update_courier_payouts_updated_at BEFORE UPDATE ON public.courier_payouts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
