import { useState } from 'react';
import SellerLayout from '@/components/seller/SellerLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Megaphone, Sparkles, QrCode, CreditCard, CheckCircle, ArrowRight, Clock, BarChart2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth, SellerProfile } from '@/contexts/AuthContext';
import { useMedia, DURATIONS, PromoDuration, BannerPosition } from '@/contexts/MediaContext';
import { usePlans } from '@/contexts/PlansContext';
import { products } from '@/data/mock';

const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const POSITIONS: { value: BannerPosition; label: string }[] = [
  { value: 'dual_left', label: 'Banner Duplo — Esquerda' },
  { value: 'dual_right', label: 'Banner Duplo — Direita' },
  { value: 'fullwidth', label: 'Banner Full Width' },
  { value: 'triple_1', label: 'Banner Triplo — 1' },
  { value: 'triple_2', label: 'Banner Triplo — 2' },
  { value: 'triple_3', label: 'Banner Triplo — 3' },
];

const PaymentStep = ({ amount, onPaid, onBack }: {
  amount: number;
  onPaid: (method: 'pix' | 'credit_card') => void;
  onBack: () => void;
}) => {
  const { paymentConfig } = usePlans();
  const [method, setMethod] = useState<'pix' | 'credit_card'>('pix');
  const [cardNum, setCardNum] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardExp, setCardExp] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [processing, setProcessing] = useState(false);

  const handlePay = async () => {
    if (method === 'credit_card' && (!cardNum || !cardName || !cardExp || !cardCvv)) {
      toast.error('Preencha todos os dados do cartão'); return;
    }
    setProcessing(true);
    await new Promise(r => setTimeout(r, 1200));
    setProcessing(false);
    onPaid(method);
  };

  return (
    <div className="space-y-4">
      <div className="text-center p-4 bg-muted/50 rounded-lg">
        <p className="text-xs text-muted-foreground">Total a pagar</p>
        <p className="text-3xl font-extrabold text-primary">{fmt(amount)}</p>
      </div>
      <div className="flex gap-2">
        <button onClick={() => setMethod('pix')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg border-2 text-sm font-bold transition-all ${method === 'pix' ? 'border-primary bg-primary text-white' : 'border-border'}`}>
          <QrCode className="h-4 w-4" /> PIX
        </button>
        <button onClick={() => setMethod('credit_card')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg border-2 text-sm font-bold transition-all ${method === 'credit_card' ? 'border-primary bg-primary text-white' : 'border-border'}`}>
          <CreditCard className="h-4 w-4" /> Cartão
        </button>
      </div>
      {method === 'pix' && paymentConfig.pix_key && (
        <div className="rounded-lg bg-muted/50 p-4 space-y-2 text-sm">
          <p className="font-semibold">Dados PIX</p>
          <div><p className="text-xs text-muted-foreground">Chave ({paymentConfig.pix_key_type})</p>
            <code className="block bg-white border rounded px-2 py-1 text-xs">{paymentConfig.pix_key}</code></div>
          <div><p className="text-xs text-muted-foreground">Favorecido</p>
            <p className="font-medium">{paymentConfig.pix_beneficiary}</p></div>
        </div>
      )}
      {method === 'credit_card' && (
        <div className="space-y-3">
          <Input placeholder="0000 0000 0000 0000" value={cardNum} maxLength={19}
            onChange={e => setCardNum(e.target.value.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim())} />
          <Input placeholder="NOME NO CARTÃO" value={cardName}
            onChange={e => setCardName(e.target.value.toUpperCase())} />
          <div className="grid grid-cols-2 gap-2">
            <Input placeholder="MM/AA" value={cardExp} maxLength={5}
              onChange={e => setCardExp(e.target.value.replace(/\D/g, '').replace(/^(\d{2})(\d)/, '$1/$2'))} />
            <Input placeholder="CVV" value={cardCvv} maxLength={4} type="password"
              onChange={e => setCardCvv(e.target.value.replace(/\D/g, ''))} />
          </div>
        </div>
      )}
      <div className="flex gap-2 pt-2">
        <Button variant="outline" onClick={onBack}>Voltar</Button>
        <Button className="flex-1 gap-2" onClick={handlePay} disabled={processing}>
          {processing ? 'Processando...' : `Pagar ${fmt(amount)}`}
        </Button>
      </div>
    </div>
  );
};

// ── Banner Purchase ──────────────────────────────────────────────────────────

const BannerBuy = () => {
  const { user } = useAuth();
  const { pricing, buyBanner, getSellerBanners, confirmBannerPayment } = useMedia();
  const seller = user as SellerProfile;

  const [step, setStep] = useState<'form' | 'pay' | 'done'>('form');
  const [form, setForm] = useState({ position: '' as BannerPosition | '', duration: 7 as PromoDuration, image: '', title: '', tag: '', cta: 'Ver Produtos', link: '/' });
  const [lastId, setLastId] = useState('');

  const price = form.duration ? pricing.banner_prices[form.duration] : 0;
  const sellerBanners = seller ? getSellerBanners(seller.id) : [];

  const handlePaid = (method: 'pix' | 'credit_card') => {
    if (!seller || !form.position) return;
    const rec = buyBanner({
      seller_id: seller.id, seller_name: seller.store_name,
      position: form.position as BannerPosition,
      image: form.image, title: form.title, tag: form.tag, cta: form.cta, link: form.link,
      duration_days: form.duration,
      amount_paid: price, payment_method: method,
      payment_status: method === 'credit_card' ? 'confirmed' : 'pending',
    });
    setLastId(rec.id);
    if (method === 'credit_card') confirmBannerPayment(rec.id);
    setStep('done');
  };

  if (step === 'done') return (
    <div className="text-center space-y-4 py-4">
      <CheckCircle className="h-14 w-14 mx-auto text-emerald-500" />
      <h3 className="text-lg font-bold">Banner contratado!</h3>
      <p className="text-sm text-muted-foreground">Seu banner será exibido assim que o pagamento for confirmado.</p>
      <Button onClick={() => setStep('form')}>Contratar outro</Button>
    </div>
  );

  if (step === 'pay') return (
    <PaymentStep amount={price} onPaid={handlePaid} onBack={() => setStep('form')} />
  );

  return (
    <div className="space-y-6">
      <div className="rounded-xl border-2 border-dashed border-primary/30 bg-primary/5 p-4 text-sm">
        <p className="font-semibold text-primary mb-1">📍 Como funciona</p>
        <p className="text-muted-foreground">Escolha um espaço na homepage, defina o período e pronto! Seu banner aparece para todos os clientes da plataforma.</p>
      </div>

      {/* Pricing reference */}
      <div>
        <p className="text-sm font-semibold mb-2">Tabela de preços</p>
        <div className="grid grid-cols-4 gap-2">
          {DURATIONS.map(d => (
            <button key={d} onClick={() => setForm(f => ({ ...f, duration: d }))}
              className={`rounded-lg border-2 p-2 text-center text-xs transition-all ${form.duration === d ? 'border-primary bg-primary text-white' : 'border-border hover:border-primary/40'}`}>
              <p className="font-bold">{d}d</p>
              <p className={form.duration === d ? 'text-white/80' : 'text-muted-foreground'}>{fmt(pricing.banner_prices[d])}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Posição na Homepage</Label>
          <Select value={form.position} onValueChange={v => setForm(f => ({ ...f, position: v as BannerPosition }))}>
            <SelectTrigger><SelectValue placeholder="Selecione o espaço" /></SelectTrigger>
            <SelectContent>{POSITIONS.map(p => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>URL da Imagem do Banner</Label>
          <Input value={form.image} onChange={e => setForm(f => ({ ...f, image: e.target.value }))} placeholder="https://..." />
        </div>
        <div className="space-y-2">
          <Label>Título</Label>
          <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Ex: Queima de Estoque!" />
        </div>
        <div className="space-y-2">
          <Label>Tag / Etiqueta</Label>
          <Input value={form.tag} onChange={e => setForm(f => ({ ...f, tag: e.target.value }))} placeholder="Ex: Até 50% OFF" />
        </div>
        <div className="space-y-2">
          <Label>Texto do Botão</Label>
          <Input value={form.cta} onChange={e => setForm(f => ({ ...f, cta: e.target.value }))} />
        </div>
        <div className="space-y-2">
          <Label>Link de Destino</Label>
          <Input value={form.link} onChange={e => setForm(f => ({ ...f, link: e.target.value }))} placeholder="/loja/minha-loja" />
        </div>
      </div>

      <div className="flex items-center justify-between border-t pt-4">
        <div><p className="text-xs text-muted-foreground">Total</p>
          <p className="text-2xl font-extrabold text-primary">{fmt(price)}/{form.duration}d</p></div>
        <Button className="gap-2 rounded-full px-8" disabled={!form.position || !form.image || !form.title}
          onClick={() => setStep('pay')}>
          Contratar Banner <ArrowRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Active banners */}
      {sellerBanners.length > 0 && (
        <div>
          <p className="text-sm font-semibold mb-3">Seus banners</p>
          <div className="space-y-2">
            {sellerBanners.map(b => (
              <div key={b.id} className="flex items-center gap-3 rounded-lg border p-3 text-sm">
                <img src={b.image} alt={b.title} className="h-12 w-20 rounded object-cover" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{b.title}</p>
                  <p className="text-xs text-muted-foreground">{b.duration_days} dias · {POSITIONS.find(p => p.value === b.position)?.label}</p>
                </div>
                <Badge className={b.payment_status === 'confirmed' && b.expires_at > new Date().toISOString()
                  ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}>
                  {b.payment_status === 'pending' ? '⏳ Pendente' :
                    b.expires_at > new Date().toISOString() ? '✓ Ativo' : 'Expirado'}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ── Product Highlight ────────────────────────────────────────────────────────

const ProductHighlightBuy = () => {
  const { user } = useAuth();
  const { pricing, buyHighlight, getSellerHighlights, confirmHighlightPayment } = useMedia();
  const seller = user as SellerProfile;

  const [step, setStep] = useState<'form' | 'pay' | 'done'>('form');
  const [selectedProduct, setSelectedProduct] = useState('');
  const [duration, setDuration] = useState<PromoDuration>(7);

  const sellerProducts = products.filter(p => p.storeId === 's1' || p.storeId === 's2');
  const product = sellerProducts.find(p => p.id === selectedProduct);
  const price = pricing.product_highlight_prices[duration];
  const myHighlights = seller ? getSellerHighlights(seller.id) : [];

  const handlePaid = (method: 'pix' | 'credit_card') => {
    if (!seller || !product) return;
    const rec = buyHighlight({
      seller_id: seller.id, seller_name: seller.store_name,
      product_id: product.id, product_name: product.name, product_image: product.image,
      duration_days: duration, amount_paid: price,
      payment_method: method,
      payment_status: method === 'credit_card' ? 'confirmed' : 'pending',
    });
    if (method === 'credit_card') confirmHighlightPayment(rec.id);
    setStep('done');
  };

  if (step === 'done') return (
    <div className="text-center space-y-4 py-4">
      <CheckCircle className="h-14 w-14 mx-auto text-emerald-500" />
      <h3 className="text-lg font-bold">Produto em destaque!</h3>
      <p className="text-sm text-muted-foreground">Seu produto aparecerá com badge "Patrocinado" nas listagens.</p>
      <Button onClick={() => setStep('form')}>Destacar outro produto</Button>
    </div>
  );

  if (step === 'pay') return (
    <PaymentStep amount={price} onPaid={handlePaid} onBack={() => setStep('form')} />
  );

  return (
    <div className="space-y-6">
      <div className="rounded-xl border-2 border-dashed border-accent/30 bg-accent/5 p-4 text-sm">
        <p className="font-semibold text-accent mb-1">⭐ Produto Patrocinado</p>
        <p className="text-muted-foreground">Seu produto aparece no topo das listagens com badge "Patrocinado", aumentando visibilidade e cliques.</p>
      </div>

      <div className="grid grid-cols-4 gap-2">
        {DURATIONS.map(d => (
          <button key={d} onClick={() => setDuration(d)}
            className={`rounded-lg border-2 p-2 text-center text-xs transition-all ${duration === d ? 'border-accent bg-accent text-white' : 'border-border hover:border-accent/40'}`}>
            <p className="font-bold">{d}d</p>
            <p className={duration === d ? 'text-white/80' : 'text-muted-foreground'}>{fmt(pricing.product_highlight_prices[d])}</p>
          </button>
        ))}
      </div>

      <div className="space-y-2">
        <Label>Produto a destacar</Label>
        <Select value={selectedProduct} onValueChange={setSelectedProduct}>
          <SelectTrigger><SelectValue placeholder="Selecione o produto" /></SelectTrigger>
          <SelectContent>
            {sellerProducts.map(p => (
              <SelectItem key={p.id} value={p.id}>
                <div className="flex items-center gap-2">
                  <img src={p.image} alt={p.name} className="h-6 w-6 rounded object-cover" />
                  {p.name}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {product && (
        <div className="flex items-center gap-4 rounded-lg border p-3">
          <img src={product.image} alt={product.name} className="h-14 w-14 rounded-lg object-cover" />
          <div>
            <p className="font-medium">{product.name}</p>
            <p className="text-sm text-accent font-bold">{fmt(product.promoPrice ?? product.price)}</p>
          </div>
          <Badge className="ml-auto bg-accent/10 text-accent">⭐ Patrocinado</Badge>
        </div>
      )}

      <div className="flex items-center justify-between border-t pt-4">
        <div><p className="text-xs text-muted-foreground">Total</p>
          <p className="text-2xl font-extrabold text-accent">{fmt(price)}/{duration}d</p></div>
        <Button className="gap-2 rounded-full px-8 bg-accent hover:bg-accent/90" disabled={!selectedProduct}
          onClick={() => setStep('pay')}>
          Destacar Produto <Sparkles className="h-4 w-4" />
        </Button>
      </div>

      {myHighlights.length > 0 && (
        <div>
          <p className="text-sm font-semibold mb-3">Destaques ativos</p>
          <div className="space-y-2">
            {myHighlights.map(h => (
              <div key={h.id} className="flex items-center gap-3 rounded-lg border p-3 text-sm">
                <img src={h.product_image} alt={h.product_name} className="h-10 w-10 rounded object-cover" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{h.product_name}</p>
                  <p className="text-xs text-muted-foreground">{h.duration_days} dias · expira {new Date(h.expires_at).toLocaleDateString('pt-BR')}</p>
                </div>
                <Badge className={h.payment_status === 'confirmed' && h.expires_at > new Date().toISOString()
                  ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}>
                  {h.payment_status === 'pending' ? '⏳ Aguardando' : h.expires_at > new Date().toISOString() ? '✓ Ativo' : 'Expirado'}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ── Main Page ────────────────────────────────────────────────────────────────

const SellerMedia = () => (
  <SellerLayout>
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Mídia & Publicidade</h1>
        <p className="text-sm text-muted-foreground">Promova sua loja e seus produtos para mais compradores</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card className="shadow-card bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
          <CardContent className="p-5">
            <Megaphone className="h-8 w-8 text-primary mb-3" />
            <p className="font-bold">Banners na Home</p>
            <p className="text-xs text-muted-foreground mt-1">Apareça na página principal para todos os visitantes</p>
          </CardContent>
        </Card>
        <Card className="shadow-card bg-gradient-to-br from-accent/5 to-accent/10 border-accent/20">
          <CardContent className="p-5">
            <Sparkles className="h-8 w-8 text-accent mb-3" />
            <p className="font-bold">Destaque de Produtos</p>
            <p className="text-xs text-muted-foreground mt-1">Produtos com badge "Patrocinado" no topo das listas</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="banners">
        <TabsList className="mb-4">
          <TabsTrigger value="banners" className="gap-2"><Megaphone className="h-4 w-4" /> Banners</TabsTrigger>
          <TabsTrigger value="highlight" className="gap-2"><Sparkles className="h-4 w-4" /> Destaque de Produto</TabsTrigger>
        </TabsList>
        <TabsContent value="banners"><Card className="shadow-card"><CardContent className="p-6"><BannerBuy /></CardContent></Card></TabsContent>
        <TabsContent value="highlight"><Card className="shadow-card"><CardContent className="p-6"><ProductHighlightBuy /></CardContent></Card></TabsContent>
      </Tabs>
    </div>
  </SellerLayout>
);

export default SellerMedia;
