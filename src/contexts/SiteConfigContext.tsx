import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface HeroSlide {
  id: string;
  image: string;
  tag: string;
  title: string;
  subtitle: string;
  cta1Text: string;
  cta1Link: string;
  cta2Text: string;
  cta2Link: string;
  is_active: boolean;
  store_name: string;
  sort_order: number;
}

export interface SectionBanner {
  id: string;
  position: 'dual_left' | 'dual_right' | 'fullwidth' | 'triple_1' | 'triple_2' | 'triple_3';
  image: string;
  tag: string;
  title: string;
  subtitle: string;
  cta: string;
  link: string;
  is_active: boolean;
  store_name: string;
}

export interface SiteTheme {
  primaryColor: string;
  accentColor: string;
  backgroundColor: string;
  foregroundColor: string;
  cardColor: string;
  mutedColor: string;
  borderColor: string;
  buttonRadius: string;
  fontHeading: string;
  fontBody: string;
}

export const DEFAULT_THEME: SiteTheme = {
  primaryColor: '160 84% 28%',
  accentColor: '28 90% 55%',
  backgroundColor: '40 33% 98%',
  foregroundColor: '220 25% 10%',
  cardColor: '0 0% 100%',
  mutedColor: '40 20% 94%',
  borderColor: '220 13% 91%',
  buttonRadius: '0.75rem',
  fontHeading: 'Plus Jakarta Sans',
  fontBody: 'Plus Jakarta Sans',
};

export const FONT_OPTIONS = [
  'Plus Jakarta Sans',
  'Inter',
  'Poppins',
  'Roboto',
  'Open Sans',
  'Montserrat',
  'Lato',
  'Nunito',
  'Raleway',
  'DM Sans',
  'Outfit',
  'Space Grotesk',
];

export interface SiteTexts {
  site_name: string;
  logo_url: string;
  announcement_bar: string;
  hero_default_tag: string;
  footer_copyright: string;
  benefits_1_title: string;
  benefits_1_desc: string;
  benefits_2_title: string;
  benefits_2_desc: string;
  benefits_3_title: string;
  benefits_3_desc: string;
  benefits_4_title: string;
  benefits_4_desc: string;
  section_promo_label: string;
  section_promo_title: string;
  section_bestsellers_label: string;
  section_bestsellers_title: string;
  section_new_label: string;
  section_new_title: string;
  section_categories_label: string;
  section_categories_title: string;
  section_stores_label: string;
  section_stores_title: string;
  cta_seller_label: string;
  cta_seller_title: string;
  cta_seller_subtitle: string;
  cta_seller_button: string;
  seller_banner_image: string;
  seller_banner_link: string;
}

const DEFAULT_HERO_SLIDES: HeroSlide[] = [
  {
    id: 'slide-1',
    image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1600&q=85',
    tag: 'Novidades 2026',
    title: 'Compre local,\nreceba\nrápido.',
    subtitle: 'Produtos incríveis de lojas da sua cidade.\nEntrega no mesmo dia, retirada na loja.',
    cta1Text: 'Ver Produtos',
    cta1Link: '/produtos',
    cta2Text: 'Cadastre sua Loja',
    cta2Link: '/cadastro-lojista',
    is_active: true,
    store_name: '',
    sort_order: 0,
  },
  {
    id: 'slide-2',
    image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1600&q=85',
    tag: 'Cozinha em Destaque',
    title: 'Tudo para\nsua cozinha\nperfeita.',
    subtitle: 'Utensílios, eletrodomésticos e decoração\npara transformar sua cozinha.',
    cta1Text: 'Ver Cozinha',
    cta1Link: '/busca?cat=cozinha',
    cta2Text: 'Ver Ofertas',
    cta2Link: '/produtos',
    is_active: true,
    store_name: '',
    sort_order: 1,
  },
  {
    id: 'slide-3',
    image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1600&q=85',
    tag: 'Moda & Estilo',
    title: 'Moda que\ncombina\ncom você.',
    subtitle: 'Peças exclusivas de lojas locais\npara todos os estilos e ocasiões.',
    cta1Text: 'Explorar Moda',
    cta1Link: '/busca?cat=moda',
    cta2Text: 'Ver Lojas',
    cta2Link: '/lojas',
    is_active: true,
    store_name: '',
    sort_order: 2,
  },
];

const DEFAULT_SECTION_BANNERS: SectionBanner[] = [
  {
    id: 'dual-left',
    position: 'dual_left',
    image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&q=80',
    tag: 'Coleção',
    title: 'Moda & Estilo',
    subtitle: '',
    cta: 'Explorar',
    link: '/busca?cat=moda',
    is_active: true,
    store_name: '',
  },
  {
    id: 'dual-right',
    position: 'dual_right',
    image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80',
    tag: 'Casa',
    title: 'Decoração & Conforto',
    subtitle: '',
    cta: 'Explorar',
    link: '/busca?cat=casa',
    is_active: true,
    store_name: '',
  },
  {
    id: 'fullwidth',
    position: 'fullwidth',
    image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1600&q=80',
    tag: 'Categoria em destaque',
    title: 'Tudo para sua Cozinha',
    subtitle: '',
    cta: 'Ver Produtos',
    link: '/busca?cat=cozinha',
    is_active: true,
    store_name: '',
  },
  {
    id: 'triple-1',
    position: 'triple_1',
    image: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=600&q=80',
    tag: 'Até 30% OFF',
    title: 'Cama, Mesa & Banho',
    subtitle: '',
    cta: 'Ver produtos',
    link: '/busca?cat=cama-mesa-banho',
    is_active: true,
    store_name: '',
  },
  {
    id: 'triple-2',
    position: 'triple_2',
    image: 'https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=600&q=80',
    tag: 'Tech',
    title: 'Eletrônicos',
    subtitle: '',
    cta: 'Ver produtos',
    link: '/busca?cat=eletronicos',
    is_active: true,
    store_name: '',
  },
  {
    id: 'triple-3',
    position: 'triple_3',
    image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600&q=80',
    tag: 'Beauty',
    title: 'Beleza',
    subtitle: '',
    cta: 'Ver produtos',
    link: '/busca?cat=beleza',
    is_active: true,
    store_name: '',
  },
];

export const DEFAULT_TEXTS: SiteTexts = {
  site_name: 'Compra Aí',
  logo_url: '',
  announcement_bar: '🚚 Frete grátis acima de R$ 150 · Entrega e retirada na sua cidade',
  hero_default_tag: 'Novidades 2026',
  footer_copyright: '© 2026 Compra Aí. Todos os direitos reservados.',
  benefits_1_title: 'Entrega Rápida',
  benefits_1_desc: 'Receba em casa no mesmo dia',
  benefits_2_title: 'Compra Segura',
  benefits_2_desc: 'Pagamento 100% protegido',
  benefits_3_title: 'Lojas Locais',
  benefits_3_desc: 'Apoie o comércio da sua cidade',
  benefits_4_title: 'Pague Único',
  benefits_4_desc: 'Várias lojas, um pagamento',
  section_promo_label: 'Imperdível',
  section_promo_title: 'Ofertas da Semana',
  section_bestsellers_label: 'Top',
  section_bestsellers_title: 'Mais Vendidos',
  section_new_label: 'Acabou de chegar',
  section_new_title: 'Novidades',
  section_categories_label: 'Navegue por',
  section_categories_title: 'Categorias',
  section_stores_label: 'Parceiros',
  section_stores_title: 'Lojas Participantes',
  cta_seller_label: 'Para Lojistas',
  cta_seller_title: 'Sua loja no marketplace local.',
  cta_seller_subtitle: 'Cadastre gratuitamente e venda para toda a cidade.',
  cta_seller_button: 'Quero Vender',
  seller_banner_image: '',
  seller_banner_link: '',
};

// ─── Storage helpers ──────────────────────────────────────────────────────────

const HERO_KEY = 'compraai_hero_slides';
const BANNERS_KEY = 'compraai_section_banners';
const TEXTS_KEY = 'compraai_site_texts';
const THEME_KEY = 'compraai_site_theme';

const load = <T,>(key: string, fallback: T): T => {
  try { const r = localStorage.getItem(key); return r ? JSON.parse(r) : fallback; } catch { return fallback; }
};
const save = (key: string, val: unknown) => {
  localStorage.setItem(key, JSON.stringify(val));
};

// ─── Context ──────────────────────────────────────────────────────────────────

interface SiteConfigCtx {
  heroSlides: HeroSlide[];
  setHeroSlides: (s: HeroSlide[]) => void;
  sectionBanners: SectionBanner[];
  setSectionBanners: (b: SectionBanner[]) => void;
  texts: SiteTexts;
  setTexts: (t: SiteTexts) => void;
  theme: SiteTheme;
  setTheme: (t: SiteTheme) => void;
  getBanner: (pos: SectionBanner['position']) => SectionBanner | undefined;
  getBanners: (pos: SectionBanner['position']) => SectionBanner[];
}

const Ctx = createContext<SiteConfigCtx | null>(null);

export const useSiteConfig = () => {
  const c = useContext(Ctx);
  if (!c) throw new Error('useSiteConfig must be inside SiteConfigProvider');
  return c;
};

const applyTheme = (t: SiteTheme) => {
  const root = document.documentElement;
  root.style.setProperty('--primary', t.primaryColor);
  root.style.setProperty('--accent', t.accentColor);
  root.style.setProperty('--background', t.backgroundColor);
  root.style.setProperty('--foreground', t.foregroundColor);
  root.style.setProperty('--card', t.cardColor);
  root.style.setProperty('--card-foreground', t.foregroundColor);
  root.style.setProperty('--popover', t.cardColor);
  root.style.setProperty('--popover-foreground', t.foregroundColor);
  root.style.setProperty('--muted', t.mutedColor);
  root.style.setProperty('--border', t.borderColor);
  root.style.setProperty('--input', t.borderColor);
  root.style.setProperty('--ring', t.primaryColor);
  root.style.setProperty('--radius', t.buttonRadius);
  root.style.setProperty('--sidebar-primary', t.primaryColor);
  root.style.setProperty('--gradient-hero', `linear-gradient(135deg, hsl(${t.primaryColor}), hsl(${t.primaryColor} / 0.8))`);
  root.style.setProperty('--gradient-accent', `linear-gradient(135deg, hsl(${t.accentColor}), hsl(${t.accentColor} / 0.85))`);
  root.style.fontFamily = `'${t.fontBody}', system-ui, sans-serif`;

  // Load Google Font dynamically
  const fonts = new Set([t.fontHeading, t.fontBody]);
  fonts.forEach(f => {
    const id = `gfont-${f.replace(/\s+/g, '-')}`;
    if (!document.getElementById(id)) {
      const link = document.createElement('link');
      link.id = id;
      link.rel = 'stylesheet';
      link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(f)}:wght@400;500;600;700;800&display=swap`;
      document.head.appendChild(link);
    }
  });
};

export const SiteConfigProvider = ({ children }: { children: ReactNode }) => {
  const [heroSlides, setHeroSlidesState] = useState<HeroSlide[]>(() => load(HERO_KEY, DEFAULT_HERO_SLIDES));
  const [sectionBanners, setSectionBannersState] = useState<SectionBanner[]>(() => load(BANNERS_KEY, DEFAULT_SECTION_BANNERS));
  const [texts, setTextsState] = useState<SiteTexts>(() => load(TEXTS_KEY, DEFAULT_TEXTS));
  const [theme, setThemeState] = useState<SiteTheme>(() => load(THEME_KEY, DEFAULT_THEME));

  const setHeroSlides = (s: HeroSlide[]) => { setHeroSlidesState(s); save(HERO_KEY, s); };
  const setSectionBanners = (b: SectionBanner[]) => { setSectionBannersState(b); save(BANNERS_KEY, b); };
  const setTexts = (t: SiteTexts) => { setTextsState(t); save(TEXTS_KEY, t); };
  const setTheme = (t: SiteTheme) => { setThemeState(t); save(THEME_KEY, t); applyTheme(t); };

  // Apply theme on mount
  useEffect(() => { applyTheme(theme); }, []);

  const getBanner = (pos: SectionBanner['position']) =>
    sectionBanners.find(b => b.position === pos && b.is_active);

  const getBanners = (pos: SectionBanner['position']) =>
    sectionBanners.filter(b => b.position === pos && b.is_active);

  return (
    <Ctx.Provider value={{ heroSlides, setHeroSlides, sectionBanners, setSectionBanners, texts, setTexts, theme, setTheme, getBanner, getBanners }}>
      {children}
    </Ctx.Provider>
  );
};
