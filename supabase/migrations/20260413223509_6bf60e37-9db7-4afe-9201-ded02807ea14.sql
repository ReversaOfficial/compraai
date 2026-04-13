
-- 1. Favorites (products)
CREATE TABLE public.favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, product_id)
);
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own favorites" ON public.favorites FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can add favorites" ON public.favorites FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can remove favorites" ON public.favorites FOR DELETE USING (auth.uid() = user_id);

-- 2. Store favorites
CREATE TABLE public.store_favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  store_id uuid NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, store_id)
);
ALTER TABLE public.store_favorites ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own store favorites" ON public.store_favorites FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can add store favorites" ON public.store_favorites FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can remove store favorites" ON public.store_favorites FOR DELETE USING (auth.uid() = user_id);

-- 3. Product reviews
CREATE TABLE public.product_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text DEFAULT '',
  is_visible boolean DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, product_id)
);
ALTER TABLE public.product_reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view visible reviews" ON public.product_reviews FOR SELECT USING (is_visible = true);
CREATE POLICY "Users can create reviews" ON public.product_reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own reviews" ON public.product_reviews FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage all reviews" ON public.product_reviews FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_product_reviews_updated_at BEFORE UPDATE ON public.product_reviews
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 4. Store reviews
CREATE TABLE public.store_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  store_id uuid NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text DEFAULT '',
  is_visible boolean DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, store_id)
);
ALTER TABLE public.store_reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view visible store reviews" ON public.store_reviews FOR SELECT USING (is_visible = true);
CREATE POLICY "Users can create store reviews" ON public.store_reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own store reviews" ON public.store_reviews FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage all store reviews" ON public.store_reviews FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_store_reviews_updated_at BEFORE UPDATE ON public.store_reviews
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 5. Notifications
CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL DEFAULT 'general',
  title text NOT NULL,
  body text DEFAULT '',
  link text DEFAULT '',
  image_url text DEFAULT '',
  target_user_id uuid DEFAULT NULL,
  created_by uuid DEFAULT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their notifications" ON public.notifications FOR SELECT USING (target_user_id IS NULL OR target_user_id = auth.uid());
CREATE POLICY "Admins can manage notifications" ON public.notifications FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- 6. Notification reads
CREATE TABLE public.notification_reads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  notification_id uuid NOT NULL REFERENCES public.notifications(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  read_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(notification_id, user_id)
);
ALTER TABLE public.notification_reads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own reads" ON public.notification_reads FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can mark as read" ON public.notification_reads FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 7. Recent searches
CREATE TABLE public.recent_searches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  query text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.recent_searches ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own searches" ON public.recent_searches FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can add searches" ON public.recent_searches FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own searches" ON public.recent_searches FOR DELETE USING (auth.uid() = user_id);

-- 8. Popup ads
CREATE TABLE public.popup_ads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text DEFAULT '',
  body text DEFAULT '',
  image_url text DEFAULT '',
  button_text text DEFAULT '',
  button_link text DEFAULT '',
  frequency text NOT NULL DEFAULT 'once_per_session',
  is_active boolean DEFAULT false,
  starts_at timestamptz DEFAULT now(),
  ends_at timestamptz DEFAULT NULL,
  created_by uuid DEFAULT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.popup_ads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view active popups" ON public.popup_ads FOR SELECT USING (is_active = true AND (ends_at IS NULL OR ends_at > now()));
CREATE POLICY "Admins can manage popups" ON public.popup_ads FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_popup_ads_updated_at BEFORE UPDATE ON public.popup_ads
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Add average rating columns to products and stores for quick access
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS avg_rating numeric DEFAULT 0;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS review_count integer DEFAULT 0;
ALTER TABLE public.stores ADD COLUMN IF NOT EXISTS avg_rating numeric DEFAULT 0;
ALTER TABLE public.stores ADD COLUMN IF NOT EXISTS review_count integer DEFAULT 0;
