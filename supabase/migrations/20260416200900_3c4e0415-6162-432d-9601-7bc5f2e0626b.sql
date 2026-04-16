
-- 1) Remove permissão ampla de INSERT em entregaai_settings
DROP POLICY IF EXISTS "Authenticated can insert entregaai settings" ON public.entregaai_settings;

-- 2) Função segura para auto-criar zona de entrega no checkout (chamada do client)
--    Só permite inserir bairros novos com preço entre R$5 e R$100 e taxa de plataforma fixa.
CREATE OR REPLACE FUNCTION public.create_entregaai_zone(
  _city text,
  _neighborhood text,
  _state text,
  _base_price numeric
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _id uuid;
  _existing uuid;
BEGIN
  -- Requer autenticação
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  -- Sanitiza entradas
  _city := trim(coalesce(_city, ''));
  _neighborhood := trim(coalesce(_neighborhood, ''));
  _state := trim(coalesce(_state, ''));

  IF length(_city) = 0 OR length(_city) > 100
     OR length(_neighborhood) > 100
     OR length(_state) > 50 THEN
    RAISE EXCEPTION 'Invalid input length';
  END IF;

  -- Limita o preço a uma faixa razoável
  IF _base_price IS NULL OR _base_price < 5 OR _base_price > 200 THEN
    RAISE EXCEPTION 'Invalid base price';
  END IF;

  -- Evita duplicatas
  SELECT id INTO _existing
  FROM public.entregaai_settings
  WHERE lower(city) = lower(_city)
    AND lower(neighborhood) = lower(_neighborhood)
  LIMIT 1;

  IF _existing IS NOT NULL THEN
    RETURN _existing;
  END IF;

  INSERT INTO public.entregaai_settings (city, neighborhood, state, base_price, platform_fee_percent, origin, is_active)
  VALUES (_city, _neighborhood, _state, _base_price, 10, 'auto', true)
  RETURNING id INTO _id;

  RETURN _id;
END;
$$;

REVOKE ALL ON FUNCTION public.create_entregaai_zone(text, text, text, numeric) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_entregaai_zone(text, text, text, numeric) TO authenticated;

-- 3) Bloqueia listagem em buckets públicos (mantém acesso direto via URL público)
DROP POLICY IF EXISTS "Public read banners" ON storage.objects;
DROP POLICY IF EXISTS "Public read products" ON storage.objects;
DROP POLICY IF EXISTS "Public can view popup images" ON storage.objects;
