import { Link } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import type { Product } from '@/data/mock';
import { useCart } from '@/contexts/CartContext';
import { Badge } from '@/components/ui/badge';
import { categories } from '@/data/mock';

const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const ProductCard = ({ product }: { product: Product }) => {
  const { addItem } = useCart();
  const discount = product.promoPrice
    ? Math.round((1 - product.promoPrice / product.price) * 100)
    : 0;

  const cat = categories.find(c => c.id === product.categoryId);

  return (
    <div className="group flex flex-col rounded-2xl bg-card border border-transparent hover:border-primary/20 shadow-card hover:shadow-elevated transition-all duration-300 overflow-hidden">
      <Link to={`/produto/${product.id}`} className="relative aspect-square overflow-hidden bg-secondary/30">
        <img
          src={product.image}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
        />
        {discount > 0 && (
          <div className="absolute top-3 left-3">
            <Badge className="bg-accent text-white border-0 font-bold px-2.5 py-1 text-xs shadow-sm">
              -{discount}%
            </Badge>
          </div>
        )}
        {cat && (
          <div className="absolute top-3 right-3">
            <Badge variant="secondary" className="text-[10px] backdrop-blur-sm bg-white/80 text-foreground font-medium shadow-sm">
              {cat.icon} {cat.name}
            </Badge>
          </div>
        )}
        <button
          onClick={(e) => { e.preventDefault(); addItem(product); }}
          className="absolute bottom-3 right-3 flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 hover:bg-primary/90 hover:scale-110"
        >
          <ShoppingCart className="h-4 w-4" />
        </button>
      </Link>

      <Link to={`/produto/${product.id}`} className="flex flex-col flex-1 p-4">
        <p className="text-xs text-muted-foreground mb-1 font-medium">{product.storeName}</p>
        <h3 className="text-sm font-semibold leading-snug line-clamp-2 group-hover:text-primary transition-colors mb-auto">
          {product.name}
        </h3>
        <div className="mt-3 flex items-baseline gap-2">
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
