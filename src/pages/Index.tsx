import { Link } from 'react-router-dom';
import { ArrowRight, Truck, Shield, Store, CreditCard, ChevronRight } from 'lucide-react';
import MarketplaceLayout from '@/components/marketplace/MarketplaceLayout';
import ProductCard from '@/components/marketplace/ProductCard';
import { Button } from '@/components/ui/button';
import { categories, products, stores } from '@/data/mock';

const promoProducts = products.filter(p => p.promoPrice).slice(0, 4);
const newProducts = [...products].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 4);
const bestSellers = [...products].sort((a, b) => b.sold - a.sold).slice(0, 4);

const benefits = [
  { icon: Truck, title: 'Entrega Rápida', desc: 'Receba em casa no mesmo dia' },
  { icon: Shield, title: 'Compra Segura', desc: 'Pagamento 100% protegido' },
  { icon: Store, title: 'Lojas Locais', desc: 'Apoie o comércio da sua cidade' },
  { icon: CreditCard, title: 'Pague Único', desc: 'Várias lojas, um pagamento' },
];

const Index = () => (
  <MarketplaceLayout>

    {/* ══════════════════════════════════════
        HERO — imagem de fundo + texto
    ══════════════════════════════════════ */}
    <section className="relative w-full overflow-hidden" style={{ minHeight: '90vh' }}>
      {/* Imagem de fundo */}
      <img
        src="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1600&q=85"
        alt="Hero"
        className="absolute inset-0 w-full h-full object-cover object-center"
      />
      {/* Overlay gradiente verde */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/90 via-primary/60 to-transparent" />

      {/* Conteúdo */}
      <div className="relative z-10 container flex items-center" style={{ minHeight: '90vh' }}>
        <div className="max-w-xl py-24">
          <span className="inline-block rounded-full bg-accent text-white text-sm font-bold px-5 py-2 mb-6 uppercase tracking-wider">
            Novidades 2026
          </span>
          <h1 className="text-5xl md:text-7xl font-extrabold text-white leading-[1.0] mb-6 tracking-tight">
            Compre local,<br />receba<br />rápido.
          </h1>
          <p className="text-white/85 text-xl mb-10 leading-relaxed">
            Produtos incríveis de lojas da sua cidade.<br />
            Entrega no mesmo dia, retirada na loja.
          </p>
          <div className="flex flex-wrap gap-4">
            <Button size="lg" asChild
              className="bg-accent hover:bg-accent/90 text-white rounded-none px-10 h-14 text-base font-bold uppercase tracking-wide shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-0.5">
              <Link to="/produtos">Ver Produtos</Link>
            </Button>
            <Button size="lg" variant="outline" asChild
              className="rounded-none border-2 border-white text-white hover:bg-white hover:text-primary h-14 px-8 text-base font-bold uppercase tracking-wide transition-all duration-300">
              <Link to="/cadastro-lojista">Cadastre sua Loja</Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 animate-bounce">
        <div className="w-0.5 h-10 bg-white/40" />
      </div>
    </section>

    {/* ══════════════════════════════════════
        BARRA DE BENEFÍCIOS
    ══════════════════════════════════════ */}
    <section className="bg-primary text-white">
      <div className="container">
        <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-white/20">
          {benefits.map(b => (
            <div key={b.title} className="flex items-center gap-3 px-6 py-5">
              <b.icon className="h-6 w-6 shrink-0 text-accent" />
              <div>
                <p className="text-sm font-bold leading-tight">{b.title}</p>
                <p className="text-xs text-white/70">{b.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* ══════════════════════════════════════
        BANNER DUPLO — estilo editorial
    ══════════════════════════════════════ */}
    <section className="container py-8">
      <div className="grid md:grid-cols-2 gap-4">
        {/* Banner 1 */}
        <Link to="/busca?cat=moda" className="group relative overflow-hidden block" style={{ aspectRatio: '3/2' }}>
          <img
            src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&q=80"
            alt="Moda"
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          <div className="absolute bottom-0 left-0 p-8">
            <span className="inline-block text-xs font-bold uppercase tracking-widest text-accent mb-2">Coleção</span>
            <h3 className="text-3xl font-extrabold text-white leading-tight mb-4">Moda &amp;<br />Estilo</h3>
            <span className="inline-flex items-center gap-2 bg-white text-foreground text-sm font-bold px-6 py-3 
              group-hover:bg-accent group-hover:text-white transition-all duration-300">
              Explorar <ArrowRight className="h-4 w-4" />
            </span>
          </div>
        </Link>

        {/* Banner 2 */}
        <Link to="/busca?cat=casa" className="group relative overflow-hidden block" style={{ aspectRatio: '3/2' }}>
          <img
            src="https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80"
            alt="Casa"
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          <div className="absolute bottom-0 left-0 p-8">
            <span className="inline-block text-xs font-bold uppercase tracking-widest text-accent mb-2">Casa</span>
            <h3 className="text-3xl font-extrabold text-white leading-tight mb-4">Decoração<br />&amp; Conforto</h3>
            <span className="inline-flex items-center gap-2 bg-white text-foreground text-sm font-bold px-6 py-3
              group-hover:bg-accent group-hover:text-white transition-all duration-300">
              Explorar <ArrowRight className="h-4 w-4" />
            </span>
          </div>
        </Link>
      </div>
    </section>

    {/* ══════════════════════════════════════
        OFERTAS — Produtos em promoção
    ══════════════════════════════════════ */}
    <section className="container py-8">
      <div className="flex items-end justify-between mb-8">
        <div>
          <p className="text-sm font-bold uppercase tracking-widest text-accent mb-1">Imperdível</p>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">Ofertas da Semana</h2>
        </div>
        <Link to="/produtos" className="hidden md:flex items-center gap-1.5 text-sm font-bold text-primary hover:text-accent transition-colors uppercase tracking-wide">
          Ver todas <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {promoProducts.map(p => <ProductCard key={p.id} product={p} />)}
      </div>
    </section>

    {/* ══════════════════════════════════════
        BANNER FULL-WIDTH — Cozinha
    ══════════════════════════════════════ */}
    <section className="w-full my-4">
      <Link to="/busca?cat=cozinha" className="group relative block w-full overflow-hidden" style={{ height: '420px' }}>
        <img
          src="https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1600&q=80"
          alt="Cozinha"
          className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-103"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent" />
        <div className="absolute inset-0 flex items-center">
          <div className="container">
            <p className="text-sm font-bold uppercase tracking-widest text-accent mb-3">Categoria em destaque</p>
            <h2 className="text-4xl md:text-6xl font-extrabold text-white leading-tight mb-6">
              Tudo para<br />sua Cozinha
            </h2>
            <span className="inline-flex items-center gap-2 bg-accent text-white text-sm font-bold px-8 py-4 uppercase tracking-wide
              group-hover:bg-white group-hover:text-foreground transition-all duration-300">
              Ver Produtos <ArrowRight className="h-4 w-4" />
            </span>
          </div>
        </div>
      </Link>
    </section>

    {/* ══════════════════════════════════════
        MAIS VENDIDOS
    ══════════════════════════════════════ */}
    <section className="container py-8">
      <div className="flex items-end justify-between mb-8">
        <div>
          <p className="text-sm font-bold uppercase tracking-widest text-accent mb-1">Top</p>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">Mais Vendidos</h2>
        </div>
        <Link to="/produtos" className="hidden md:flex items-center gap-1.5 text-sm font-bold text-primary hover:text-accent transition-colors uppercase tracking-wide">
          Ver todos <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {bestSellers.map(p => <ProductCard key={p.id} product={p} />)}
      </div>
    </section>

    {/* ══════════════════════════════════════
        BANNER TRIPLO — 3 categorias lado a lado
    ══════════════════════════════════════ */}
    <section className="container py-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Cama, Mesa & Banho', img: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=600&q=80', link: '/busca?cat=cama-mesa-banho', tag: 'Até 30% OFF' },
          { label: 'Eletrônicos', img: 'https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=600&q=80', link: '/busca?cat=eletronicos', tag: 'Tech' },
          { label: 'Beleza', img: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600&q=80', link: '/busca?cat=beleza', tag: 'Beauty' },
        ].map(b => (
          <Link key={b.label} to={b.link} className="group relative overflow-hidden block rounded-none" style={{ aspectRatio: '4/5' }}>
            <img src={b.img} alt={b.label} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
            <div className="absolute top-4 left-4">
              <span className="bg-accent text-white text-xs font-bold px-3 py-1.5 uppercase tracking-wide">{b.tag}</span>
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <h3 className="text-xl font-extrabold text-white mb-3 leading-tight">{b.label}</h3>
              <span className="flex items-center gap-1.5 text-sm text-white/80 font-bold uppercase tracking-wide group-hover:text-accent transition-colors">
                Ver produtos <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>

    {/* ══════════════════════════════════════
        NOVIDADES
    ══════════════════════════════════════ */}
    <section className="bg-secondary/50 py-12 my-4">
      <div className="container">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-sm font-bold uppercase tracking-widest text-accent mb-1">Acabou de chegar</p>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">Novidades</h2>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {newProducts.map(p => <ProductCard key={p.id} product={p} />)}
        </div>
      </div>
    </section>

    {/* ══════════════════════════════════════
        BANNER CTA LOJISTA — full width
    ══════════════════════════════════════ */}
    <section className="w-full my-4">
      <div className="relative overflow-hidden" style={{ height: '360px' }}>
        <img
          src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1600&q=80"
          alt="Lojista"
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-primary/85" />
        <div className="absolute inset-0 flex items-center">
          <div className="container flex flex-col md:flex-row items-center justify-between gap-8">
            <div>
              <p className="text-sm font-bold uppercase tracking-widest text-accent mb-3">Para Lojistas</p>
              <h2 className="text-3xl md:text-5xl font-extrabold text-white leading-tight mb-4">
                Sua loja no<br />marketplace local.
              </h2>
              <p className="text-white/75 text-lg">Cadastre gratuitamente e venda para toda a cidade.</p>
            </div>
            <div className="shrink-0">
              <Button size="lg" asChild
                className="bg-accent hover:bg-white hover:text-foreground text-white rounded-none px-10 h-14 text-base font-bold uppercase tracking-wide transition-all duration-300">
                <Link to="/cadastro-lojista">Quero Vender</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>

    {/* ══════════════════════════════════════
        CATEGORIAS — grade de ícones
    ══════════════════════════════════════ */}
    <section className="container py-12">
      <div className="flex items-end justify-between mb-8">
        <div>
          <p className="text-sm font-bold uppercase tracking-widest text-accent mb-1">Navegue por</p>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">Categorias</h2>
        </div>
      </div>
      <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        {categories.map(c => (
          <Link key={c.id} to={`/busca?cat=${c.id}`}
            className="group flex flex-col items-center gap-3 border-2 border-transparent hover:border-primary bg-card p-5 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-elevated">
            <span className="text-4xl transition-transform duration-300 group-hover:scale-110">{c.icon}</span>
            <span className="text-xs font-bold uppercase tracking-wide">{c.name}</span>
          </Link>
        ))}
      </div>
    </section>

    {/* ══════════════════════════════════════
        LOJAS PARTICIPANTES
    ══════════════════════════════════════ */}
    <section className="bg-primary py-12">
      <div className="container">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-sm font-bold uppercase tracking-widest text-accent mb-1">Parceiros</p>
            <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">Lojas Participantes</h2>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stores.map(s => (
            <Link key={s.id} to={`/loja/${s.id}`}
              className="group flex items-center gap-4 bg-white/10 hover:bg-white/20 backdrop-blur-sm p-5 transition-all duration-300 hover:-translate-y-0.5">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center bg-accent text-2xl font-extrabold text-white">
                {s.name.charAt(0)}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-extrabold text-white truncate group-hover:text-accent transition-colors">{s.name}</p>
                <p className="text-xs text-white/60 truncate">{s.category}</p>
                <p className="text-xs text-accent font-bold mt-1">★ {s.rating} · {s.productsCount} itens</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>

  </MarketplaceLayout>
);

export default Index;
