import { createContext, useContext, useState, ReactNode } from 'react';
import { toast } from 'sonner';

// ── Types ──────────────────────────────────────────────────────────────────

export type BannerPosition = 'hero' | 'dual_left' | 'dual_right' | 'fullwidth' | 'triple_1' | 'triple_2' | 'triple_3';
export type PromoDuration = 1 | 3 | 5 | 7 | 10 | 15 | 30;

export interface MediaPricing {
  banner_prices: Record<PromoDuration, number>;   // price per banner purchase
  product_highlight_prices: Record<PromoDuration, number>; // price per product highlight
}

export interface BannerPurchase {
  id: string;
  seller_id: string;
  seller_name: string;
  position: BannerPosition;
  image: string;
  title: string;
  tag: string;
  cta: string;
  link: string;
  duration_days: PromoDuration;
  amount_paid: number;
  payment_method: 'pix' | 'credit_card';
  payment_status: 'pending' | 'confirmed';
  starts_at: string;
  expires_at: string;
  created_at: string;
}

export interface ProductHighlight {
  id: string;
  seller_id: string;
  seller_name: string;
  product_id: string;
  product_name: string;
  product_image: string;
  duration_days: PromoDuration;
  amount_paid: number;
  payment_method: 'pix' | 'credit_card';
  payment_status: 'pending' | 'confirmed';
  starts_at: string;
  expires_at: string;
  created_at: string;
}

const PRICING_KEY = 'compraai_media_pricing';
const BANNER_PURCHASES_KEY = 'compraai_banner_purchases';
const HIGHLIGHTS_KEY = 'compraai_highlights';

const DEFAULT_PRICING: MediaPricing = {
  banner_prices: { 1: 29.90, 3: 69.90, 5: 99.90, 7: 129.90, 10: 169.90, 15: 229.90, 30: 399.90 },
  product_highlight_prices: { 1: 9.90, 3: 24.90, 5: 34.90, 7: 44.90, 10: 59.90, 15: 79.90, 30: 129.90 },
};

const load = <T,>(key: string, fallback: T): T => {
  try { const r = localStorage.getItem(key); return r ? JSON.parse(r) : fallback; } catch { return fallback; }
};
const save = (key: string, val: unknown) => localStorage.setItem(key, JSON.stringify(val));

interface MediaCtx {
  pricing: MediaPricing;
  setPricing: (p: MediaPricing) => void;
  bannerPurchases: BannerPurchase[];
  highlights: ProductHighlight[];
  buyBanner: (data: Omit<BannerPurchase, 'id' | 'created_at' | 'starts_at' | 'expires_at'>) => BannerPurchase;
  buyHighlight: (data: Omit<ProductHighlight, 'id' | 'created_at' | 'starts_at' | 'expires_at'>) => ProductHighlight;
  confirmBannerPayment: (id: string) => void;
  confirmHighlightPayment: (id: string) => void;
  getSellerBanners: (sellerId: string) => BannerPurchase[];
  getSellerHighlights: (sellerId: string) => ProductHighlight[];
  getActiveHighlights: () => ProductHighlight[];
  isProductHighlighted: (productId: string) => boolean;
  DURATIONS: PromoDuration[];
}

const Ctx = createContext<MediaCtx | null>(null);

export const useMedia = () => {
  const c = useContext(Ctx);
  if (!c) throw new Error('useMedia must be inside MediaProvider');
  return c;
};

export const DURATIONS: PromoDuration[] = [1, 3, 5, 7, 10, 15, 30];

const expiresAt = (days: number) =>
  new Date(Date.now() + days * 86400000).toISOString();

export const MediaProvider = ({ children }: { children: ReactNode }) => {
  const [pricing, setPricingState] = useState<MediaPricing>(() => load(PRICING_KEY, DEFAULT_PRICING));
  const [bannerPurchases, setBannerPurchases] = useState<BannerPurchase[]>(() => load(BANNER_PURCHASES_KEY, []));
  const [highlights, setHighlights] = useState<ProductHighlight[]>(() => load(HIGHLIGHTS_KEY, []));

  const setPricing = (p: MediaPricing) => {
    setPricingState(p);
    save(PRICING_KEY, p);
    toast.success('Preços de mídia atualizados!');
  };

  const buyBanner = (data: Omit<BannerPurchase, 'id' | 'created_at' | 'starts_at' | 'expires_at'>): BannerPurchase => {
    const now = new Date().toISOString();
    const rec: BannerPurchase = {
      id: 'ban_' + Date.now(), created_at: now, starts_at: now,
      expires_at: expiresAt(data.duration_days), ...data,
    };
    const updated = [...bannerPurchases, rec];
    setBannerPurchases(updated); save(BANNER_PURCHASES_KEY, updated);
    return rec;
  };

  const buyHighlight = (data: Omit<ProductHighlight, 'id' | 'created_at' | 'starts_at' | 'expires_at'>): ProductHighlight => {
    const now = new Date().toISOString();
    const rec: ProductHighlight = {
      id: 'hl_' + Date.now(), created_at: now, starts_at: now,
      expires_at: expiresAt(data.duration_days), ...data,
    };
    const updated = [...highlights, rec];
    setHighlights(updated); save(HIGHLIGHTS_KEY, updated);
    return rec;
  };

  const confirmBannerPayment = (id: string) => {
    const updated = bannerPurchases.map(b =>
      b.id === id ? { ...b, payment_status: 'confirmed' as const } : b
    );
    setBannerPurchases(updated); save(BANNER_PURCHASES_KEY, updated);
  };

  const confirmHighlightPayment = (id: string) => {
    const updated = highlights.map(h =>
      h.id === id ? { ...h, payment_status: 'confirmed' as const } : h
    );
    setHighlights(updated); save(HIGHLIGHTS_KEY, updated);
  };

  const now = new Date().toISOString();
  const getSellerBanners = (sid: string) => bannerPurchases.filter(b => b.seller_id === sid);
  const getSellerHighlights = (sid: string) => highlights.filter(h => h.seller_id === sid);
  const getActiveHighlights = () =>
    highlights.filter(h => h.payment_status === 'confirmed' && h.expires_at > now);
  const isProductHighlighted = (pid: string) =>
    highlights.some(h => h.product_id === pid && h.payment_status === 'confirmed' && h.expires_at > now);

  return (
    <Ctx.Provider value={{
      pricing, setPricing, bannerPurchases, highlights,
      buyBanner, buyHighlight, confirmBannerPayment, confirmHighlightPayment,
      getSellerBanners, getSellerHighlights, getActiveHighlights, isProductHighlighted,
      DURATIONS,
    }}>
      {children}
    </Ctx.Provider>
  );
};
