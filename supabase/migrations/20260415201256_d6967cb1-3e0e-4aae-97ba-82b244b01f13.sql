-- Add origin column to track auto-created neighborhoods
ALTER TABLE public.entregaai_settings 
ADD COLUMN IF NOT EXISTS origin text NOT NULL DEFAULT 'manual';

-- Allow authenticated users to insert (auto-create neighborhoods at checkout)
CREATE POLICY "Authenticated can insert entregaai settings"
ON public.entregaai_settings
FOR INSERT
TO authenticated
WITH CHECK (true);
