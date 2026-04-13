import { useParams, Link } from 'react-router-dom';
import MarketplaceLayout from '@/components/marketplace/MarketplaceLayout';
import ProductCard from '@/components/marketplace/ProductCard';
import { stores, products } from '@/data/mock';
import { MapPin, Phone, Star, Package, Clock, Instagram, MessageCircle, ArrowLeft, ChevronDown, Grid, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useState } from 'react';

const BANNER_FALLBACKS: Record<string, string> = {
  s1: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&q=80',
  s2: 'https://images.unsplash.com/photo-1555421689-d68471e189f2?w=1200&q=80',
  s3: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1200&q=80',
};

const StorePage = () => {
  const { id } = useParams();
  const store = stores.find(s => s.id === id);
  const allProducts = products.filter(p => p.storeId === id && p.isActive);
  const [search, setSearch] = useState('');
  const [layout, setLayout] = useState<'grid' | 'list'>('grid');
  const [catFilter, setCatFilter] = useState('');

  if (!store) {
    return (
      <MarketplaceLayout>
        <div className="container py-16 text-center">
          <Package className="h-16 w-16 mx-auto mb-4 opacity-30" />
          <p className="text-lg font-semibold">Loja não encontrada</p>
          <Button asChild className="mt-4 rounded-full"><Link to="/">Voltar ao início</Link></Button>
        </div>
      </MarketplaceLayout>
    );
  }

  const categories = Array.from(new Set(allProducts.map(p => p.category)));
  const filtered = allProducts.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) &&
    (catFilter ? p.category === catFilter : true)
  );
  const banner = BANNER_FALLBACKS[id ?? ''] ?? 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1200&q=80';

  return (
    <MarketplaceLayout>
      {/* ── STORE HERO ── */}
      <div className="relative h-48 md:h-64 w-full overflow-hidden">
        <img src={store.banner || banner} alt={store.name} className="w-full h-full object-cover object-center" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        <div className="absolute top-4 left-4">
          <Button variant="ghost" size="sm" className="text-white hover:bg-white/20 rounded-full" asChild>
            <Link to="/"><ArrowLeft className="h-4 w-4 mr-1" /> Voltar</Link>
          </Button>
        </div>
      </div>

      {/* ── STORE IDENTITY ── */}
      <div className="container relative">
        <div className="flex items-end gap-4 -mt-12 mb-6">
          {/* Logo */}
          <div className="h-24 w-24 rounded-2xl border-4 border-background bg-card flex items-center justify-center text-4xl font-extrabold text-primary shadow-lg shrink-0 overflow-hidden">
            {store.logo
              ? <img src={store.logo} alt={store.name} className="w-full h-full object-cover" />
              : <span>{store.name.charAt(0)}</span>
            }
          </div>
          <div className="flex-1 min-w-0 pb-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-extrabold">{store.name}</h1>
              {store.isActive && <Badge className="bg-emerald-100 text-emerald-700 text-xs">● Aberto</Badge>}
              <Badge variant="secondary" className="text-xs">{store.category}</Badge>
            </div>
            <div className="flex flex-wrap gap-4 mt-1 text-sm text-muted-foreground">
              <span className="flex items-center gap-1"><Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" /> <strong className="text-foreground">{store.rating}</strong></span>
              <span className="flex items-center gap-1"><Package className="h-3.5 w-3.5" /> {allProducts.length} produtos</span>
              {store.address && <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {store.address}</span>}
            </div>
          </div>
        </div>

        {/* Info bar */}
        <div className="flex flex-wrap gap-3 pb-5 border-b mb-6">
          <div className="flex-1 min-w-[200px] rounded-xl bg-muted/50 p-3">
            <p className="text-xs text-muted-foreground mb-1">Sobre a loja</p>
            <p className="text-sm">{store.description || 'Bem-vindo à nossa loja! Encontre os melhores produtos com atendimento diferenciado.'}</p>
          </div>
          <div className="flex flex-col gap-2">
            {store.phone && (
              <Button asChild variant="outline" size="sm" className="gap-2 rounded-full">
                <a href={`https://wa.me/${store.phone.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="h-4 w-4 text-emerald-500" /> WhatsApp
                </a>
              </Button>
            )}
            {store.phone && (
              <Button asChild variant="outline" size="sm" className="gap-2 rounded-full">
                <a href={`tel:${store.phone}`}><Phone className="h-4 w-4" /> {store.phone}</a>
              </Button>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { label: 'Avaliação', value: `★ ${store.rating}`, sub: 'nota média' },
            { label: 'Produtos', value: allProducts.length, sub: 'disponíveis' },
            { label: 'Desde', value: '2024', sub: 'na plataforma' },
          ].map(s => (
            <div key={s.label} className="rounded-xl border bg-card p-3 text-center">
              <p className="text-xl font-extrabold text-primary">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.sub}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── PRODUCTS ── */}
      <div className="container pb-12">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <div className="relative flex-1 max-w-xs">
            <Input placeholder="Buscar nesta loja..." value={search}
              onChange={e => setSearch(e.target.value)} className="pl-4 pr-4" />
          </div>
          {categories.length > 1 && (
            <div className="flex gap-2 flex-wrap">
              <Button variant={catFilter === '' ? 'default' : 'outline'} size="sm" className="rounded-full"
                onClick={() => setCatFilter('')}>Todos</Button>
              {categories.map(c => (
                <Button key={c} variant={catFilter === c ? 'default' : 'outline'} size="sm" className="rounded-full"
                  onClick={() => setCatFilter(c === catFilter ? '' : c)}>{c}</Button>
              ))}
            </div>
          )}
          <div className="ml-auto flex gap-1">
            <Button variant={layout === 'grid' ? 'default' : 'ghost'} size="icon" className="h-8 w-8" onClick={() => setLayout('grid')}>
              <Grid className="h-4 w-4" />
            </Button>
            <Button variant={layout === 'list' ? 'default' : 'ghost'} size="icon" className="h-8 w-8" onClick={() => setLayout('list')}>
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">{catFilter || 'Todos os produtos'}</h2>
          <Badge variant="secondary" className="text-xs">{filtered.length} itens</Badge>
        </div>

        {filtered.length > 0 ? (
          <div className={layout === 'grid'
            ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'
            : 'space-y-3'}>
            {filtered.map(p => (
              layout === 'grid'
                ? <ProductCard key={p.id} product={p} />
                : (
                  <div key={p.id} className="flex items-center gap-4 rounded-xl border bg-card p-3 hover:shadow-card transition-shadow">
                    <img src={p.image} alt={p.name} className="h-16 w-16 rounded-lg object-cover shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{p.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{p.description}</p>
                    </div>
                    <div className="text-right shrink-0">
                      {p.promoPrice ? (
                        <><p className="font-bold text-accent">{p.promoPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                          <p className="text-xs text-muted-foreground line-through">{p.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p></>
                      ) : <p className="font-bold">{p.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>}
                    </div>
                    <Button asChild size="sm" className="rounded-full shrink-0">
                      <Link to={`/produto/${p.id}`}>Ver</Link>
                    </Button>
                  </div>
                )
            ))}
          </div>
        ) : (
          <div className="py-16 text-center text-muted-foreground">
            <Package className="h-12 w-12 mx-auto mb-4 opacity-30" />
            <p className="font-medium">Nenhum produto encontrado</p>
            <p className="text-sm mt-1">Tente outro filtro ou busca</p>
          </div>
        )}
      </div>
    </MarketplaceLayout>
  );
};

export default StorePage;
