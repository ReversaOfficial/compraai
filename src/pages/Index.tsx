import { Link } from 'react-router-dom';
import { ArrowRight, Truck, Shield, Store, CreditCard, ChevronRight, ChevronLeft } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import MarketplaceLayout from '@/components/marketplace/MarketplaceLayout';
import ProductCard from '@/components/marketplace/ProductCard';
import { Button } from '@/components/ui/button';
import { categories, products, stores } from '@/data/mock';
import { useSiteConfig } from '@/contexts/SiteConfigContext';

const promoProducts = products.filter(p => p.promoPrice).slice(0, 4);
const newProducts = [...products].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 4);
const bestSellers = [...products].sort((a, b) => b.sold - a.sold).slice(0, 4);

const benefitIcons = [Truck, Shield, Store, CreditCard];

// ─── Hero Carousel ─────────────────────────────────────────────────────────

const HeroCarousel = () => {
  const { heroSlides, texts } = useSiteConfig();
  const slides = heroSlides.filter(s => s.is_active).sort((a, b) => a.sort_order - b.sort_order);
  const [current, setCurrent] = useState(0);
  const [transitioning, setTransitioning] = useState(false);

  const go = useCallback((next: number) => {
    if (transitioning || slides.length <= 1) return;
    setTransitioning(true);
    setTimeout(() => {
      setCurrent(next);
      setTransitioning(false);
    }, 400);
  }, [transitioning, slides.length]);

  const prev = () => go((current - 1 + slides.length) % slides.length);
  const next = () => go((current + 1) % slides.length);

  // Auto-advance every 5s
  useEffect(() => {
    if (slides.length <= 1) return;
    const t = setInterval(() => go((current + 1) % slides.length), 5000);
    return () => clearInterval(t);
  }, [current, slides.length, go]);

  if (!slides.length) return null;
  const slide = slides[current];

  return (
    <section className="relative w-full overflow-hidden" style={{ minHeight: '90vh' }}>
      {/* Background image */}
      <img
        key={slide.id}
        src={slide.image}
        alt={slide.title}
        className={`absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-500 ${transitioning ? 'opacity-0' : 'opacity-100'}`}
      />
      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/90 via-primary/60 to-transparent" />

      {/* Content */}
      <div className="relative z-10 container flex items-center" style={{ minHeight: '90vh' }}>
        <div className={`max-w-xl py-24 transition-all duration-500 ${transitioning ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}`}>
          <span className="inline-block rounded-full bg-accent text-white text-sm font-bold px-5 py-2 mb-6 uppercase tracking-wider">
            {slide.tag}
          </span>
          <h1 className="text-5xl md:text-7xl font-extrabold text-white leading-[1.0] mb-6 tracking-tight whitespace-pre-line">
            {slide.title}
          </h1>
          <p className="text-white/85 text-xl mb-10 leading-relaxed whitespace-pre-line">
            {slide.subtitle}
          </p>
          <div className="flex flex-wrap gap-4">
            <Button size="lg" asChild
              className="bg-accent hover:bg-accent/90 text-white rounded-none px-10 h-14 text-base font-bold uppercase tracking-wide shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-0.5">
              <Link to={slide.cta1Link}>{slide.cta1Text}</Link>
            </Button>
            <Button size="lg" asChild
              className="bg-accent hover:bg-white hover:text-primary text-white rounded-none border-2 border-accent h-14 px-8 text-base font-bold uppercase tracking-wide transition-all duration-300">
              <Link to={slide.cta2Link}>{slide.cta2Text}</Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Navigation arrows */}
      {slides.length > 1 && (
        <>
          <button onClick={prev}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 flex h-12 w-12 items-center justify-center bg-black/30 hover:bg-black/50 text-white backdrop-blur-sm transition-all">
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button onClick={next}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 flex h-12 w-12 items-center justify-center bg-black/30 hover:bg-black/50 text-white backdrop-blur-sm transition-all">
            <ChevronRight className="h-6 w-6" />
          </button>

          {/* Dots */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-2">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => go(i)}
                className={`transition-all duration-300 h-2 rounded-full ${i === current ? 'w-8 bg-accent' : 'w-2 bg-white/50 hover:bg-white/80'}`}
              />
            ))}
          </div>
        </>
      )}

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 w-full h-20 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
};

// ─── Main Component ─────────────────────────────────────────────────────────

const Index = () => {
  const { texts, getBanner, getBanners } = useSiteConfig();

  const dualLeft = getBanner('dual_left');
  const dualRight = getBanner('dual_right');
  const centralBanners = getBanners('fullwidth');
  const triple1 = getBanner('triple_1');
  const triple2 = getBanner('triple_2');
  const triple3 = getBanner('triple_3');

  return (
    <MarketplaceLayout>

      {/* ══ BANNER PRINCIPAL ══ */}
      <HeroCarousel />

      {/* ══ BARRA BENEFÍCIOS ══ */}
      <section className="bg-primary text-white">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-white/20">
            {[
              { title: texts.benefits_1_title, desc: texts.benefits_1_desc, Icon: Truck },
              { title: texts.benefits_2_title, desc: texts.benefits_2_desc, Icon: Shield },
              { title: texts.benefits_3_title, desc: texts.benefits_3_desc, Icon: Store },
              { title: texts.benefits_4_title, desc: texts.benefits_4_desc, Icon: CreditCard },
            ].map(b => (
              <div key={b.title} className="flex items-center gap-3 px-6 py-5">
                <b.Icon className="h-6 w-6 shrink-0 text-accent" />
                <div>
                  <p className="text-sm font-bold leading-tight">{b.title}</p>
                  <p className="text-xs text-white/70">{b.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ BANNER DUPLO ══ */}
      {(dualLeft || dualRight) && (
        <section className="container py-8">
          <div className="grid md:grid-cols-2 gap-4">
            {[dualLeft, dualRight].map((b, i) => b && (
              <Link key={i} to={b.link} className="group relative overflow-hidden block" style={{ aspectRatio: '3/2' }}>
                <img src={b.image} alt={b.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 p-8">
                  <span className="inline-block text-xs font-bold uppercase tracking-widest text-accent mb-2">{b.tag}</span>
                  <h3 className="text-3xl font-extrabold text-white leading-tight mb-4">{b.title}</h3>
                  <span className="inline-flex items-center gap-2 bg-white text-foreground text-sm font-bold px-6 py-3 group-hover:bg-accent group-hover:text-white transition-all duration-300">
                    {b.cta} <ArrowRight className="h-4 w-4" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ══ OFERTAS ══ */}
      <section className="container py-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-sm font-bold uppercase tracking-widest text-accent mb-1">{texts.section_promo_label}</p>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">{texts.section_promo_title}</h2>
          </div>
          <Link to="/produtos" className="hidden md:flex items-center gap-1.5 text-sm font-bold text-primary hover:text-accent transition-colors uppercase tracking-wide">
            Ver todas <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {promoProducts.map(p => <ProductCard key={p.id} product={p} />)}
        </div>
      </section>

      {/* ══ BANNER CENTRAL (SLIDER) ══ */}
      {centralBanners.length > 0 && (
        <CentralBannerSlider banners={centralBanners} />
      )}

      {/* ══ MAIS VENDIDOS ══ */}
      <section className="container py-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-sm font-bold uppercase tracking-widest text-accent mb-1">{texts.section_bestsellers_label}</p>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">{texts.section_bestsellers_title}</h2>
          </div>
          <Link to="/produtos" className="hidden md:flex items-center gap-1.5 text-sm font-bold text-primary hover:text-accent transition-colors uppercase tracking-wide">
            Ver todos <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {bestSellers.map(p => <ProductCard key={p.id} product={p} />)}
        </div>
      </section>

      {/* ══ BANNER PRODUTO RODAPÉ ══ */}
      {(triple1 || triple2 || triple3) && (
        <section className="container py-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[triple1, triple2, triple3].map((b, i) => b && (
              <Link key={i} to={b.link} className="group relative overflow-hidden block" style={{ aspectRatio: '4/5' }}>
                <img src={b.image} alt={b.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
                <div className="absolute top-4 left-4">
                  <span className="bg-accent text-white text-xs font-bold px-3 py-1.5 uppercase tracking-wide">{b.tag}</span>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <h3 className="text-xl font-extrabold text-white mb-3 leading-tight">{b.title}</h3>
                  <span className="flex items-center gap-1.5 text-sm text-white/80 font-bold uppercase tracking-wide group-hover:text-accent transition-colors">
                    {b.cta} <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ══ NOVIDADES ══ */}
      <section className="bg-secondary/50 py-12 my-4">
        <div className="container">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="text-sm font-bold uppercase tracking-widest text-accent mb-1">{texts.section_new_label}</p>
              <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">{texts.section_new_title}</h2>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {newProducts.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </div>
      </section>

      {/* ══ CTA LOJISTA ══ */}
      <section className="w-full my-4">
        <div className="relative overflow-hidden" style={{ height: '360px' }}>
          <img src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1600&q=80" alt="Lojista" className="w-full h-full object-cover object-center" />
          <div className="absolute inset-0 bg-primary/85" />
          <div className="absolute inset-0 flex items-center">
            <div className="container flex flex-col md:flex-row items-center justify-between gap-8">
              <div>
                <p className="text-sm font-bold uppercase tracking-widest text-accent mb-3">{texts.cta_seller_label}</p>
                <h2 className="text-3xl md:text-5xl font-extrabold text-white leading-tight mb-4">{texts.cta_seller_title}</h2>
                <p className="text-white/75 text-lg">{texts.cta_seller_subtitle}</p>
              </div>
              <div className="shrink-0">
                <Button size="lg" asChild className="bg-accent hover:bg-white hover:text-foreground text-white rounded-none px-10 h-14 text-base font-bold uppercase tracking-wide transition-all duration-300">
                  <Link to="/cadastro-lojista">{texts.cta_seller_button}</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ CATEGORIAS ══ */}
      <section className="container py-12">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-sm font-bold uppercase tracking-widest text-accent mb-1">{texts.section_categories_label}</p>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">{texts.section_categories_title}</h2>
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

      {/* ══ LOJAS ══ */}
      <section className="bg-primary py-12">
        <div className="container">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="text-sm font-bold uppercase tracking-widest text-accent mb-1">{texts.section_stores_label}</p>
              <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">{texts.section_stores_title}</h2>
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
};

export default Index;
