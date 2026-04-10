import { useParams, Link } from 'react-router-dom';
import { ShoppingCart, Store, Truck, MapPin, ArrowLeft } from 'lucide-react';
import MarketplaceLayout from '@/components/marketplace/MarketplaceLayout';
import ProductCard from '@/components/marketplace/ProductCard';
import { products } from '@/data/mock';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const ProductDetailPage = () => {
  const { id } = useParams();
  const { addItem } = useCart();
  const product = products.find(p => p.id === id);

  if (!product) return (
    <MarketplaceLayout>
      <div className="container py-20 text-center">
        <p className="text-muted-foreground">Produto não encontrado.</p>
        <Button className="mt-4" asChild><Link to="/produtos">Ver Produtos</Link></Button>
      </div>
    </MarketplaceLayout>
  );

  const hasPromo = product.promoPrice && product.promoPrice < product.price;
  const related = products.filter(p => p.category === product.category && p.id !== product.id).slice(0, 4);

  return (
    <MarketplaceLayout>
      <div className="container py-6">
        <Button variant="ghost" size="sm" className="mb-4" asChild>
          <Link to="/produtos"><ArrowLeft className="h-4 w-4 mr-1" /> Voltar</Link>
        </Button>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Image */}
          <div className="aspect-square overflow-hidden rounded-xl bg-secondary/30">
            <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
          </div>

          {/* Info */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Store className="h-4 w-4" />
              <Link to={`/loja/${product.storeId}`} className="hover:text-primary transition-colors">{product.storeName}</Link>
            </div>

            <h1 className="text-2xl md:text-3xl font-bold">{product.name}</h1>

            <div className="flex items-center gap-2">
              <Badge variant="secondary">{product.category}</Badge>
              {product.stock > 0 ? (
                <Badge className="bg-success/10 text-success border-0">Em estoque</Badge>
              ) : (
                <Badge variant="destructive">Esgotado</Badge>
              )}
            </div>

            <div className="flex items-end gap-3 py-2">
              {hasPromo && <span className="text-lg text-muted-foreground line-through">{fmt(product.price)}</span>}
              <span className="text-3xl font-bold text-primary">{fmt(hasPromo ? product.promoPrice! : product.price)}</span>
              {hasPromo && (
                <Badge className="bg-accent text-accent-foreground border-0">
                  -{Math.round(((product.price - product.promoPrice!) / product.price) * 100)}%
                </Badge>
              )}
            </div>

            <p className="text-muted-foreground leading-relaxed">{product.description}</p>

            <div className="flex flex-col gap-2 rounded-lg bg-secondary/50 p-4 text-sm">
              {product.deliveryAvailable && (
                <div className="flex items-center gap-2">
                  <Truck className="h-4 w-4 text-primary" />
                  <span>Entrega disponível · {product.deliveryTime}</span>
                </div>
              )}
              {product.pickupAvailable && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary" />
                  <span>Retirada na loja disponível</span>
                </div>
              )}
            </div>

            <Button size="lg" className="rounded-full mt-2" onClick={() => addItem(product)}>
              <ShoppingCart className="h-5 w-5 mr-2" />
              Adicionar ao Carrinho
            </Button>
          </div>
        </div>

        {/* Related */}
        {related.length > 0 && (
          <section className="mt-16">
            <h2 className="text-xl font-bold mb-6">Produtos Relacionados</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {related.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          </section>
        )}
      </div>
    </MarketplaceLayout>
  );
};

export default ProductDetailPage;
