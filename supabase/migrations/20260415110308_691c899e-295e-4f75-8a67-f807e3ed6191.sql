
-- Create payment_receipts table
CREATE TABLE public.payment_receipts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  receipt_url TEXT NOT NULL DEFAULT '',
  payment_type TEXT NOT NULL DEFAULT 'plan_subscription',
  payment_reference_id TEXT NOT NULL DEFAULT '',
  amount NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending',
  uploaded_by UUID NOT NULL,
  confirmed_at TIMESTAMP WITH TIME ZONE,
  notes TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.payment_receipts ENABLE ROW LEVEL SECURITY;

-- Users can insert their own receipts
CREATE POLICY "pr_user_insert" ON public.payment_receipts
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = uploaded_by);

-- Users can view their own receipts
CREATE POLICY "pr_user_select" ON public.payment_receipts
  FOR SELECT TO authenticated
  USING (auth.uid() = uploaded_by);

-- Admins can manage all
CREATE POLICY "pr_admin_all" ON public.payment_receipts
  FOR ALL TO public
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Storage bucket for receipts
INSERT INTO storage.buckets (id, name, public)
VALUES ('payment-receipts', 'payment-receipts', true);

-- Storage policies
CREATE POLICY "pr_storage_insert" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'payment-receipts');

CREATE POLICY "pr_storage_select" ON storage.objects
  FOR SELECT TO public
  USING (bucket_id = 'payment-receipts');
