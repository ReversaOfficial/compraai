import { useParams, Link } from 'react-router-dom';
import MarketplaceLayout from '@/components/marketplace/MarketplaceLayout';
import ProductCard from '@/components/marketplace/ProductCard';
import { stores, products } from '@/data/mock';
import { MapPin, Phone, Star, Package, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const StorePage = () => {
  const { id } = useParams();
  const store = stores.find(s => s.id === id);
  const storeProducts = products.filter(p => p.storeId === id && p.isActive);

  if (!store) {
    return (
      <MarketplaceLayout>
        <div className="container py-16 text-center">
          <p className="text-lg text-muted-foreground">Loja não encontrada</p>
          <Button asChild className="mt-4 rounded-full"><Link to="/">Voltar ao início</Link></Button>
        </div>
      </MarketplaceLayout>
    );
  }

  return (
    <MarketplaceLayout>
      {/* Store Header */}
      <div className="bg-gradient-hero">
        <div className="container py-10 md:py-16">
          <Button variant="ghost" size="sm" className="text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/10 mb-4 rounded-full" asChild>
            <Link to="/"><ArrowLeft className="h-4 w-4 mr-1" /> Voltar</Link>
          </Button>
          <div className="flex items-center gap-6">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary-foreground/20 text-3xl font-bold text-primary-foreground shadow-lg">
              {store.name.charAt(0)}
            </div>
            <div className="text-primary-foreground">
              <h1 className="text-2xl md:text-3xl font-bold">{store.name}</h1>
              <p className="text-primary-foreground/70 mt-1">{store.description}</p>
              <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-primary-foreground/80">
                <span className="flex items-center gap-1"><Star className="h-4 w-4 fill-current text-accent" /> {store.rating}</span>
                <span className="flex items-center gap-1"><Package className="h-4 w-4" /> {storeProducts.length} produtos</span>
                <span className="flex items-center gap-1"><MapPin className="h-4 w-4" /> {store.address}</span>
                <span className="flex items-center gap-1"><Phone className="h-4 w-4" /> {store.phone}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Products */}
      <div className="container py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">Produtos de {store.name}</h2>
          <Badge variant="secondary" className="text-xs">{storeProducts.length} produtos</Badge>
        </div>

        {storeProducts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {storeProducts.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        ) : (
          <div className="py-16 text-center text-muted-foreground">
            <Package className="h-12 w-12 mx-auto mb-4 opacity-30" />
            <p>Nenhum produto disponível nesta loja.</p>
          </div>
        )}
      </div>
    </MarketplaceLayout>
  );
};

export default StorePage;
