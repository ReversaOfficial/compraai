
-- Delivery zones per store (seller sets prices by neighborhood/city)
CREATE TABLE public.delivery_zones (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  neighborhood TEXT NOT NULL DEFAULT '',
  city TEXT NOT NULL DEFAULT '',
  state TEXT NOT NULL DEFAULT '',
  price NUMERIC NOT NULL DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.delivery_zones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Store owners can manage their delivery zones"
ON public.delivery_zones FOR ALL
USING (EXISTS (SELECT 1 FROM stores WHERE stores.id = delivery_zones.store_id AND stores.owner_id = auth.uid()));

CREATE POLICY "Public can view active delivery zones"
ON public.delivery_zones FOR SELECT
USING (is_active = true);

CREATE POLICY "Admins can manage all delivery zones"
ON public.delivery_zones FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- EntregaAI platform delivery settings (managed by admin)
CREATE TABLE public.entregaai_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  city TEXT NOT NULL DEFAULT '',
  state TEXT NOT NULL DEFAULT '',
  neighborhood TEXT NOT NULL DEFAULT '',
  base_price NUMERIC NOT NULL DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.entregaai_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage entregaai settings"
ON public.entregaai_settings FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Public can view active entregaai settings"
ON public.entregaai_settings FOR SELECT
USING (is_active = true);

-- Add entregaai option to products
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS allows_entregaai BOOLEAN DEFAULT false;

-- Trigger for updated_at
CREATE TRIGGER update_delivery_zones_updated_at
BEFORE UPDATE ON public.delivery_zones
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_entregaai_settings_updated_at
BEFORE UPDATE ON public.entregaai_settings
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
