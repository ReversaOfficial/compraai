import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useFavorites = () => {
  const { user } = useAuth();
  const [productFavs, setProductFavs] = useState<string[]>([]);
  const [storeFavs, setStoreFavs] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchFavorites = useCallback(async () => {
    if (!user) { setProductFavs([]); setStoreFavs([]); return; }
    setLoading(true);
    const [{ data: pf }, { data: sf }] = await Promise.all([
      supabase.from('favorites').select('product_id').eq('user_id', user.id),
      supabase.from('store_favorites').select('store_id').eq('user_id', user.id),
    ]);
    setProductFavs((pf || []).map(f => f.product_id));
    setStoreFavs((sf || []).map(f => f.store_id));
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchFavorites(); }, [fetchFavorites]);

  const toggleProductFav = async (productId: string) => {
    if (!user) return;
    if (productFavs.includes(productId)) {
      await supabase.from('favorites').delete().eq('user_id', user.id).eq('product_id', productId);
      setProductFavs(prev => prev.filter(id => id !== productId));
    } else {
      await supabase.from('favorites').insert({ user_id: user.id, product_id: productId });
      setProductFavs(prev => [...prev, productId]);
    }
  };

  const toggleStoreFav = async (storeId: string) => {
    if (!user) return;
    if (storeFavs.includes(storeId)) {
      await supabase.from('store_favorites').delete().eq('user_id', user.id).eq('store_id', storeId);
      setStoreFavs(prev => prev.filter(id => id !== storeId));
    } else {
      await supabase.from('store_favorites').insert({ user_id: user.id, store_id: storeId });
      setStoreFavs(prev => [...prev, storeId]);
    }
  };

  const isProductFav = (id: string) => productFavs.includes(id);
  const isStoreFav = (id: string) => storeFavs.includes(id);

  return { productFavs, storeFavs, toggleProductFav, toggleStoreFav, isProductFav, isStoreFav, loading };
};
