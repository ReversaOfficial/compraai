import { Link } from 'react-router-dom';
import { ShoppingCart, Heart, Sparkles } from 'lucide-react';
import type { Product } from '@/data/mock';
import { useCart } from '@/contexts/CartContext';
import { useFavorites } from '@/hooks/useFavorites';
import { useAuth } from '@/contexts/AuthContext';
import { useMedia } from '@/contexts/MediaContext';
import { categories } from '@/data/mock';

const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const ProductCard = ({ product }: { product: Product }) => {
  const { addItem } = useCart();
  const { user } = useAuth();
  const { isProductFav, toggleProductFav } = useFavorites();
  const { isProductHighlighted } = useMedia();
  const highlighted = isProductHighlighted(product.id);
  const { isProductFav, toggleProductFav } = useFavorites();
  const discount = product.promoPrice
    ? Math.round((1 - product.promoPrice / product.price) * 100)
    : 0;

  const cat = categories.find(c => c.id === product.categoryId);

  return (
    <div className={`group flex flex-col bg-card border transition-all duration-300 hover:shadow-elevated overflow-hidden ${highlighted ? 'border-accent/50 ring-1 ring-accent/20' : 'border-border hover:border-primary/30'}`}>
      {/* Badge Patrocinado */}
      {highlighted && (
        <div className="flex items-center gap-1 bg-accent/10 text-accent text-[10px] font-bold px-3 py-1 text-center justify-center">
          <Sparkles className="h-3 w-3" /> Patrocinado
        </div>
      )}
      {/* Imagem */}
      <Link to={`/produto/${product.id}`} className="relative overflow-hidden bg-secondary/20" style={{ aspectRatio: '1/1' }}>
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
        />

        {/* Badge desconto */}
        {discount > 0 && (
          <div className="absolute top-0 left-0 bg-accent text-white text-xs font-extrabold px-3 py-1.5 uppercase tracking-wide">
            -{discount}%
          </div>
        )}

        {/* Badge categoria */}
        {cat && (
          <div className="absolute top-0 right-0 bg-primary text-white text-[10px] font-bold px-2.5 py-1.5">
            {cat.icon} {cat.name}
          </div>
        )}

        {/* Favorite button */}
        {user && (
          <button
            onClick={(e) => { e.preventDefault(); toggleProductFav(product.id); }}
            className="absolute top-8 right-1 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/80 shadow hover:bg-white transition-colors"
          >
            <Heart className={`h-4 w-4 ${isProductFav(product.id) ? 'fill-destructive text-destructive' : 'text-muted-foreground'}`} />
          </button>
        )}

        {/* Overlay hover com botões */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
          <button
            onClick={(e) => { e.preventDefault(); addItem(product); }}
            className="flex items-center gap-2 bg-primary text-white text-sm font-bold px-5 py-3 translate-y-4 group-hover:translate-y-0 transition-transform duration-300 hover:bg-accent"
          >
            <ShoppingCart className="h-4 w-4" /> Adicionar
          </button>
        </div>
      </Link>

      {/* Info */}
      <Link to={`/produto/${product.id}`} className="flex flex-col flex-1 p-4">
        <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-1">{product.storeName}</p>
        <h3 className="text-sm font-bold leading-snug line-clamp-2 group-hover:text-primary transition-colors mb-3">
          {product.name}
        </h3>
        <div className="mt-auto flex items-baseline gap-2">
          {product.promoPrice ? (
            <>
              <span className="text-lg font-extrabold text-primary">{fmt(product.promoPrice)}</span>
              <span className="text-xs text-muted-foreground line-through">{fmt(product.price)}</span>
            </>
          ) : (
            <span className="text-lg font-extrabold">{fmt(product.price)}</span>
          )}
        </div>
      </Link>
    </div>
  );
};

export default ProductCard;
