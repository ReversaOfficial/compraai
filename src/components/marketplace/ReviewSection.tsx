import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import StarRating from './StarRating';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface Review {
  id: string;
  user_id: string;
  rating: number;
  comment: string;
  created_at: string;
  user_name?: string;
}

interface ReviewSectionProps {
  type: 'product' | 'store';
  targetId: string;
}

const ReviewSection = ({ type, targetId }: ReviewSectionProps) => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [canReview, setCanReview] = useState(false);
  const [hasReviewed, setHasReviewed] = useState(false);

  const table = type === 'product' ? 'product_reviews' : 'store_reviews';
  const idCol = type === 'product' ? 'product_id' : 'store_id';

  useEffect(() => {
    const load = async () => {
      const query = type === 'product'
        ? supabase.from('product_reviews').select('*').eq('product_id', targetId).order('created_at', { ascending: false })
        : supabase.from('store_reviews').select('*').eq('store_id', targetId).order('created_at', { ascending: false });
      const { data } = await query;
      
      const mapped = (data || []).map(r => ({
        ...r,
        comment: r.comment || '',
        user_name: 'Cliente',
      }));
      setReviews(mapped);

      if (user) {
        setHasReviewed(mapped.some(r => r.user_id === user.id));
        // Check if user has purchased
        if (type === 'product') {
          const { data: items } = await supabase
            .from('order_items')
            .select('id')
            .eq('product_id', targetId)
            .limit(1);
          setCanReview((items || []).length > 0);
        } else {
          const { data: items } = await supabase
            .from('order_items')
            .select('id')
            .eq('store_id', targetId)
            .limit(1);
          setCanReview((items || []).length > 0);
        }
      }
    };
    load();
  }, [targetId, user, table, idCol, type]);

  const handleSubmit = async () => {
    if (!user || rating === 0) return;
    setSubmitting(true);

    if (type === 'product') {
      await supabase.from('product_reviews').insert({ user_id: user.id, product_id: targetId, rating, comment });
      const { data: all } = await supabase.from('product_reviews').select('rating').eq('product_id', targetId);
      if (all && all.length > 0) {
        const avg = all.reduce((s, r) => s + r.rating, 0) / all.length;
        await supabase.from('products').update({ avg_rating: Math.round(avg * 10) / 10, review_count: all.length } as any).eq('id', targetId);
      }
    } else {
      await supabase.from('store_reviews').insert({ user_id: user.id, store_id: targetId, rating, comment });
      const { data: all } = await supabase.from('store_reviews').select('rating').eq('store_id', targetId);
      if (all && all.length > 0) {
        const avg = all.reduce((s, r) => s + r.rating, 0) / all.length;
        await supabase.from('stores').update({ avg_rating: Math.round(avg * 10) / 10, review_count: all.length } as any).eq('id', targetId);
      }
    }
    
    setComment('');
    setRating(0);
    setHasReviewed(true);
    setSubmitting(false);
    // Refresh reviews
    const refreshQuery = type === 'product'
      ? supabase.from('product_reviews').select('*').eq('product_id', targetId).order('created_at', { ascending: false })
      : supabase.from('store_reviews').select('*').eq('store_id', targetId).order('created_at', { ascending: false });
    const { data } = await refreshQuery;
    setReviews((data || []).map(r => ({ ...r, comment: r.comment || '', user_name: 'Cliente' })));
  };

  const avg = reviews.length > 0 ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <h3 className="text-lg font-bold">Avaliações</h3>
        <div className="flex items-center gap-2">
          <StarRating rating={Math.round(avg)} size="sm" />
          <span className="text-sm text-muted-foreground">
            {avg.toFixed(1)} ({reviews.length} {reviews.length === 1 ? 'avaliação' : 'avaliações'})
          </span>
        </div>
      </div>

      {user && canReview && !hasReviewed && (
        <div className="rounded-lg border p-4 space-y-3">
          <p className="text-sm font-medium">Deixe sua avaliação</p>
          <StarRating rating={rating} onRate={setRating} />
          <Textarea
            value={comment}
            onChange={e => setComment(e.target.value)}
            placeholder="Conte sobre sua experiência..."
            rows={3}
          />
          <Button onClick={handleSubmit} disabled={rating === 0 || submitting} size="sm" className="rounded-full">
            {submitting ? 'Enviando...' : 'Enviar Avaliação'}
          </Button>
        </div>
      )}

      {reviews.length === 0 ? (
        <p className="text-sm text-muted-foreground py-4">Nenhuma avaliação ainda.</p>
      ) : (
        <div className="space-y-3">
          {reviews.map(r => (
            <div key={r.id} className="rounded-lg border p-4">
              <div className="flex items-center gap-2 mb-1">
                <StarRating rating={r.rating} size="sm" />
                <span className="text-xs text-muted-foreground">
                  {new Date(r.created_at).toLocaleDateString('pt-BR')}
                </span>
              </div>
              {r.comment && <p className="text-sm mt-1">{r.comment}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReviewSection;
