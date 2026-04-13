import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import StarRating from '@/components/marketplace/StarRating';
import { Eye, EyeOff } from 'lucide-react';

interface Review {
  id: string;
  rating: number;
  comment: string;
  is_visible: boolean;
  created_at: string;
}

const AdminReviews = () => {
  const [productReviews, setProductReviews] = useState<Review[]>([]);
  const [storeReviews, setStoreReviews] = useState<Review[]>([]);

  useEffect(() => {
    const load = async () => {
      const [{ data: pr }, { data: sr }] = await Promise.all([
        supabase.from('product_reviews').select('*').order('created_at', { ascending: false }),
        supabase.from('store_reviews').select('*').order('created_at', { ascending: false }),
      ]);
      setProductReviews((pr || []).map(r => ({ ...r, comment: r.comment || '' })));
      setStoreReviews((sr || []).map(r => ({ ...r, comment: r.comment || '' })));
    };
    load();
  }, []);

  const toggleVisibility = async (type: 'product' | 'store', id: string, current: boolean) => {
    const table = type === 'product' ? 'product_reviews' : 'store_reviews';
    await supabase.from(table).update({ is_visible: !current } as any).eq('id', id);
    const setter = type === 'product' ? setProductReviews : setStoreReviews;
    setter(prev => prev.map(r => r.id === id ? { ...r, is_visible: !current } : r));
  };

  const ReviewList = ({ reviews, type }: { reviews: Review[]; type: 'product' | 'store' }) => (
    <div className="space-y-3">
      {reviews.length === 0 ? (
        <p className="text-center py-8 text-muted-foreground">Nenhuma avaliação</p>
      ) : reviews.map(r => (
        <div key={r.id} className="flex items-start justify-between p-4 rounded-lg border">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <StarRating rating={r.rating} size="sm" />
              <Badge variant={r.is_visible ? 'secondary' : 'destructive'} className="text-xs">
                {r.is_visible ? 'Visível' : 'Oculta'}
              </Badge>
              <span className="text-xs text-muted-foreground">{new Date(r.created_at).toLocaleDateString('pt-BR')}</span>
            </div>
            {r.comment && <p className="text-sm mt-1">{r.comment}</p>}
          </div>
          <Button variant="ghost" size="icon" onClick={() => toggleVisibility(type, r.id, r.is_visible)}>
            {r.is_visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
        </div>
      ))}
    </div>
  );

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold mb-6">Moderação de Avaliações</h1>
      <Tabs defaultValue="products">
        <TabsList className="mb-4">
          <TabsTrigger value="products">Produtos ({productReviews.length})</TabsTrigger>
          <TabsTrigger value="stores">Lojas ({storeReviews.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="products">
          <Card><CardContent className="p-4"><ReviewList reviews={productReviews} type="product" /></CardContent></Card>
        </TabsContent>
        <TabsContent value="stores">
          <Card><CardContent className="p-4"><ReviewList reviews={storeReviews} type="store" /></CardContent></Card>
        </TabsContent>
      </Tabs>
    </AdminLayout>
  );
};

export default AdminReviews;
