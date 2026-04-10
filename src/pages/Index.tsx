import { Link } from 'react-router-dom';
import { ArrowRight, Truck, Shield, Store, CreditCard, ChevronRight, Sparkles } from 'lucide-react';
import MarketplaceLayout from '@/components/marketplace/MarketplaceLayout';
import ProductCard from '@/components/marketplace/ProductCard';
import { Button } from '@/components/ui/button';
import { categories, products, stores } from '@/data/mock';

const promoProducts = products.filter(p => p.promoPrice);
const newProducts = [...products].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 8);
const bestSellers = [...products].sort((a, b) => b.sold - a.sold).slice(0, 8);

const benefits = [
  { icon: Truck, title: 'Entrega ou Retirada', desc: 'Receba em casa ou retire na loja' },
  { icon: Shield, title: 'Compra Segura', desc: 'Pagamento protegido via Pix ou cartão' },
  { icon: Store, title: 'Lojas Locais', desc: 'Apoie o comércio da sua cidade' },
  { icon: CreditCard, title: 'Pagamento Único', desc: 'Compre de várias lojas, pague uma vez' },
];

// Banners de categoria com imagens lifestyle
const heroBanners = [
  {
    title: 'Novidades para sua casa',
    subtitle: 'Descubra os melhores produtos de decoração, cozinha e conforto',
    cta: 'Ver Coleção',
    link: '/busca?cat=casa',
    image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1200&q=80',
    position: 'left' as const,
  },
  {
    title: 'Moda com personalidade',
    subtitle: 'Peças exclusivas de lojas locais para todos os estilos',
    cta: 'Explorar Moda',
    link: '/busca?cat=moda',
    image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&q=80',
    position: 'right' as const,
  },
];

const categoryBanners = [
  { name: 'Cozinha', image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&q=80', link: '/busca?cat=cozinha', tag: 'Novos itens' },
  { name: 'Cama, Mesa & Banho', image: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=600&q=80', link: '/busca?cat=cama-mesa-banho', tag: 'Até 30% OFF' },
  { name: 'Eletrônicos', image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80', link: '/busca?cat=eletronicos', tag: 'Top vendas' },
];

const Index = () => (
  <MarketplaceLayout>
    {/* ═══ HERO BANNER ═══ */}
    <section className="relative overflow-hidden bg-gradient-hero">
      <div className="container relative z-10 py-20 md:py-32 lg:py-40">
        <div className="max-w-2xl">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 backdrop-blur-sm px-4 py-2 text-sm font-medium text-white mb-6">
            <Sparkles className="h-4 w-4" />
            O marketplace da sua cidade
          </span>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-white leading-[1.05] mb-6 tracking-tight">
            Compre local,<br />receba rápido.
          </h1>
          <p className="text-white/80 text-lg md:text-xl mb-10 leading-relaxed max-w-lg">
            Descubra produtos incríveis de lojas da sua cidade. Entrega rápida, retirada na loja e pagamento seguro.
          </p>
          <div className="flex flex-wrap gap-4">
            <Button size="lg" className="bg-accent hover:bg-accent/90 text-white rounded-full px-10 h-14 text-base font-semibold shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5" asChild>
              <Link to="/produtos">Explorar Produtos</Link>
            </Button>
            <Button size="lg" variant="outline" className="rounded-full border-2 border-white/40 text-white hover:bg-white/10 h-14 px-8 text-base" asChild>
              <Link to="/cadastro-lojista">Cadastrar Loja</Link>
            </Button>
          </div>
        </div>
      </div>
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-1/2 h-full opacity-[0.07]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,white_0%,transparent_70%)]" />
      </div>
      <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-background to-transparent" />
    </section>

    {/* ═══ MARQUEE / TRUST BAR ═══ */}
    <section className="border-b bg-card">
      <div className="container py-5">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {benefits.map(b => (
            <div key={b.title} className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                <b.icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold leading-tight">{b.title}</p>
                <p className="text-xs text-muted-foreground">{b.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* ═══ CATEGORY BANNERS GRID (3 cols) ═══ */}
    <section className="container py-10">
      <div className="grid md:grid-cols-3 gap-4">
        {categoryBanners.map(b => (
          <Link key={b.name} to={b.link} className="group relative rounded-2xl overflow-hidden aspect-[4/3]">
            <img src={b.image} alt={b.name} className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            <div className="absolute top-4 left-4">
              <span className="inline-block rounded-full bg-accent text-white text-xs font-bold px-3 py-1">{b.tag}</span>
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-5">
              <h3 className="text-xl font-bold text-white mb-1">{b.name}</h3>
              <span className="inline-flex items-center gap-1 text-sm text-white/80 font-medium group-hover:text-white transition-colors">
                Ver produtos <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>

    {/* ═══ PROMOÇÕES ═══ */}
    <section className="container py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">🔥 Ofertas Imperdíveis</h2>
          <p className="text-sm text-muted-foreground mt-1">Aproveite antes que acabe</p>
        </div>
        <Button variant="ghost" size="sm" asChild>
          <Link to="/produtos?filter=promo" className="flex items-center gap-1 text-primary font-medium">
            Ver todas <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {promoProducts.map(p => <ProductCard key={p.id} product={p} />)}
      </div>
    </section>

    {/* ═══ BANNER DUPLO LIFESTYLE ═══ */}
    <section className="container py-6">
      <div className="grid md:grid-cols-2 gap-4">
        {heroBanners.map((b, i) => (
          <Link key={i} to={b.link} className="group relative rounded-2xl overflow-hidden aspect-[16/9] md:aspect-[16/10]">
            <img src={b.image} alt={b.title} className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent" />
            <div className="absolute inset-0 flex flex-col justify-center p-6 md:p-10">
              <h3 className="text-xl md:text-3xl font-extrabold text-white leading-tight mb-2">{b.title}</h3>
              <p className="text-sm md:text-base text-white/80 mb-4 max-w-xs">{b.subtitle}</p>
              <span className="inline-flex items-center gap-2 bg-white text-foreground font-semibold text-sm px-5 py-2.5 rounded-full w-fit group-hover:bg-accent group-hover:text-white transition-all duration-300">
                {b.cta} <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>

    {/* ═══ MAIS VENDIDOS ═══ */}
    <section className="container py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">⭐ Mais Vendidos</h2>
          <p className="text-sm text-muted-foreground mt-1">Os favoritos dos nossos clientes</p>
        </div>
        <Button variant="ghost" size="sm" asChild>
          <Link to="/produtos?sort=sold" className="flex items-center gap-1 text-primary font-medium">
            Ver todos <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {bestSellers.slice(0, 4).map(p => <ProductCard key={p.id} product={p} />)}
      </div>
    </section>

    {/* ═══ BANNER CTA FULLWIDTH ═══ */}
    <section className="my-6">
      <div className="container">
        <div className="relative rounded-2xl overflow-hidden bg-gradient-hero py-16 md:py-24 px-8 md:px-16">
          <div className="relative z-10 max-w-lg">
            <h2 className="text-2xl md:text-4xl font-extrabold text-white leading-tight mb-4">
              Tem uma loja?<br />Venda na Compra Aí!
            </h2>
            <p className="text-white/80 text-base md:text-lg mb-8 leading-relaxed">
              Cadastre sua loja gratuitamente e comece a vender para toda a cidade. Sem mensalidade no plano básico.
            </p>
            <Button size="lg" className="bg-accent hover:bg-accent/90 text-white rounded-full px-10 h-13 text-base font-semibold shadow-lg" asChild>
              <Link to="/cadastro-lojista">Cadastrar Minha Loja</Link>
            </Button>
          </div>
          <div className="absolute top-0 right-0 w-2/3 h-full opacity-10">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_50%,white_0%,transparent_70%)]" />
          </div>
          <div className="absolute -bottom-8 -right-8 w-40 h-40 rounded-full bg-white/5" />
          <div className="absolute -top-4 -right-4 w-24 h-24 rounded-full bg-white/5" />
        </div>
      </div>
    </section>

    {/* ═══ CATEGORIAS ═══ */}
    <section className="container py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">Categorias</h2>
          <p className="text-sm text-muted-foreground mt-1">Encontre o que procura</p>
        </div>
      </div>
      <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3">
        {categories.slice(0, 12).map(c => (
          <Link key={c.id} to={`/busca?cat=${c.id}`} className="group flex flex-col items-center gap-3 rounded-2xl border bg-card p-5 text-center shadow-card hover:shadow-elevated transition-all duration-300 hover:-translate-y-1 hover:border-primary/30">
            <span className="text-4xl transition-transform duration-300 group-hover:scale-110">{c.icon}</span>
            <span className="text-xs font-semibold">{c.name}</span>
          </Link>
        ))}
      </div>
    </section>

    {/* ═══ NOVIDADES ═══ */}
    <section className="bg-secondary/40 py-10">
      <div className="container">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">🆕 Acabou de Chegar</h2>
            <p className="text-sm text-muted-foreground mt-1">Produtos recém adicionados</p>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {newProducts.slice(0, 4).map(p => <ProductCard key={p.id} product={p} />)}
        </div>
      </div>
    </section>

    {/* ═══ LOJAS PARTICIPANTES ═══ */}
    <section className="container py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">🏪 Lojas Participantes</h2>
          <p className="text-sm text-muted-foreground mt-1">Conheça quem faz o Compra Aí acontecer</p>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {stores.map(s => (
          <Link key={s.id} to={`/loja/${s.id}`} className="group flex items-center gap-4 rounded-2xl bg-card p-5 border shadow-card hover:shadow-elevated transition-all duration-300 hover:-translate-y-0.5">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-hero text-xl font-bold text-white">
              {s.name.charAt(0)}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold truncate group-hover:text-primary transition-colors">{s.name}</p>
              <p className="text-xs text-muted-foreground truncate">{s.category}</p>
              <div className="flex items-center gap-1 mt-1">
                <span className="text-xs text-accent font-semibold">★ {s.rating}</span>
                <span className="text-xs text-muted-foreground">· {s.productsCount} produtos</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  </MarketplaceLayout>
);

export default Index;
