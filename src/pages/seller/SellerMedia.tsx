import { useState, useRef } from 'react';
import SellerLayout from '@/components/seller/SellerLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Megaphone, Sparkles, QrCode, CreditCard, CheckCircle, ArrowRight, Clock, BarChart2, Upload, Loader2, Copy, Check, Lock } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth, SellerProfile } from '@/contexts/AuthContext';
import { useMedia, DURATIONS, PromoDuration, BannerPosition } from '@/contexts/MediaContext';
import { usePlans } from '@/contexts/PlansContext';
import { products } from '@/data/mock';
import { supabase } from '@/integrations/supabase/client';
import { QRCodeSVG } from 'qrcode.react';

// ── Tamanhos padrão por posição ──────────────────────────────────────────────

const BANNER_SIZES: Record<string, { w: number; h: number; label: string }> = {
  dual_left: { w: 960, h: 540, label: '960×540' },
  dual_right: { w: 960, h: 540, label: '960×540' },
  fullwidth: { w: 1920, h: 540, label: '1920×540' },
  triple_1: { w: 640, h: 480, label: '640×480' },
  triple_2: { w: 640, h: 480, label: '640×480' },
  triple_3: { w: 640, h: 480, label: '640×480' },
};
const DEFAULT_SIZE = { w: 960, h: 540, label: '960×540' };

function resizeImage(file: File, targetW: number, targetH: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = targetW;
      canvas.height = targetH;
      const ctx = canvas.getContext('2d')!;
      const scale = Math.max(targetW / img.width, targetH / img.height);
      const sw = targetW / scale;
      const sh = targetH / scale;
      const sx = (img.width - sw) / 2;
      const sy = (img.height - sh) / 2;
      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, targetW, targetH);
      canvas.toBlob(
        (blob) => (blob ? resolve(blob) : reject(new Error('Falha ao converter'))),
        'image/webp', 0.85,
      );
    };
    img.onerror = () => reject(new Error('Falha ao carregar imagem'));
    img.src = URL.createObjectURL(file);
  });
}

// ── PIX Payload (EMV BRCode) ─────────────────────────────────────────────────

function buildPixPayload(pixKey: string, beneficiary: string, amount: number): string {
  const pad = (id: string, val: string) => `${id}${val.length.toString().padStart(2, '0')}${val}`;
  const gui = pad('00', 'br.gov.bcb.pix');
  const key = pad('01', pixKey);
  const merchantAccount = pad('26', gui + key);
  const mcc = pad('52', '0000');
  const currency = pad('53', '986');
  const amountStr = pad('54', amount.toFixed(2));
  const country = pad('58', 'BR');
  const name = pad('59', beneficiary.substring(0, 25));
  const city = pad('60', 'SAO PAULO');
  const txid = pad('05', 'CA' + Date.now().toString(36).slice(-8));
  const addData = pad('62', txid);
  const payloadFormat = pad('00', '01');
  const base = payloadFormat + merchantAccount + mcc + currency + amountStr + country + name + city + addData + '6304';
  let crc = 0xFFFF;
  for (let i = 0; i < base.length; i++) {
    crc ^= base.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) crc = crc & 0x8000 ? (crc << 1) ^ 0x1021 : crc << 1;
    crc &= 0xFFFF;
  }
  return base + crc.toString(16).toUpperCase().padStart(4, '0');
}

const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const POSITIONS: { value: BannerPosition; label: string }[] = [
  { value: 'dual_left', label: 'Banner Duplo Esquerda' },
  { value: 'dual_right', label: 'Banner Duplo Direita' },
  { value: 'fullwidth', label: 'Banner Central' },
  { value: 'triple_1', label: 'Banner Produto Rodapé Esquerda' },
  { value: 'triple_2', label: 'Banner Produto Rodapé Central' },
  { value: 'triple_3', label: 'Banner Produto Rodapé Direita' },
];

// ── Payment Step ─────────────────────────────────────────────────────────────

const PaymentStep = ({ amount, onPaid, onBack, description }: {
  amount: number;
  onPaid: (method: 'pix' | 'credit_card') => void;
  onBack: () => void;
  description?: string;
}) => {
  const { paymentConfig } = usePlans();
  const [method, setMethod] = useState<'pix' | 'credit_card'>('pix');
  const [cardNum, setCardNum] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardExp, setCardExp] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [installments, setInstallments] = useState('1');
  const [processing, setProcessing] = useState(false);
  const [copied, setCopied] = useState(false);

  const pixPayload = paymentConfig.pix_key
    ? buildPixPayload(paymentConfig.pix_key, paymentConfig.pix_beneficiary || 'CompraAi', amount)
    : '';

  const handleCopyPix = () => {
    navigator.clipboard.writeText(pixPayload);
    setCopied(true);
    toast.success('Código PIX copiado!');
    setTimeout(() => setCopied(false), 3000);
  };

  const handlePay = async () => {
    if (method === 'credit_card') {
      if (!cardNum || cardNum.replace(/\s/g, '').length < 16) { toast.error('Número do cartão inválido'); return; }
      if (!cardName) { toast.error('Preencha o nome do titular'); return; }
      if (!cardExp || cardExp.length < 5) { toast.error('Validade inválida'); return; }
      if (!cardCvv || cardCvv.length < 3) { toast.error('CVV inválido'); return; }
    }
    setProcessing(true);
    await new Promise(r => setTimeout(r, 2000));
    setProcessing(false);
    onPaid(method);
  };

  const installmentOptions = [];
  for (let i = 1; i <= 12; i++) {
    const val = amount / i;
    if (val >= 5) {
      installmentOptions.push({
        value: i.toString(),
        label: i === 1 ? `1x de ${fmt(amount)} (sem juros)` : `${i}x de ${fmt(val)}${i <= 3 ? ' (sem juros)' : ''}`,
      });
    }
  }

  return (
    <div className="space-y-5">
      {/* Valor */}
      <div className="text-center p-5 bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl border border-primary/20">
        <p className="text-xs text-muted-foreground mb-1">Total a pagar</p>
        <p className="text-3xl font-extrabold text-primary">{fmt(amount)}</p>
        {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
      </div>

      {/* Método */}
      <div className="flex gap-2">
        <button onClick={() => setMethod('pix')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 text-sm font-bold transition-all ${method === 'pix' ? 'border-primary bg-primary text-primary-foreground' : 'border-border hover:border-primary/40'}`}>
          <QrCode className="h-4 w-4" /> PIX
        </button>
        <button onClick={() => setMethod('credit_card')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 text-sm font-bold transition-all ${method === 'credit_card' ? 'border-primary bg-primary text-primary-foreground' : 'border-border hover:border-primary/40'}`}>
          <CreditCard className="h-4 w-4" /> Cartão de Crédito
        </button>
      </div>

      {/* ── PIX ── */}
      {method === 'pix' && (
        <div className="space-y-4">
          {paymentConfig.pix_key ? (
            <>
              <div className="flex flex-col items-center gap-4 p-6 bg-white rounded-xl border">
                <p className="text-sm font-semibold text-foreground">Escaneie o QR Code para pagar</p>
                <div className="p-3 bg-white rounded-lg shadow-sm border">
                  <QRCodeSVG value={pixPayload} size={200} level="M" />
                </div>
                <p className="text-[11px] text-muted-foreground text-center max-w-[260px]">
                  Abra o app do seu banco → Pagar via PIX → Escaneie o código acima
                </p>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-semibold">PIX Copia e Cola</p>
                <div className="flex gap-2">
                  <code className="flex-1 text-[10px] bg-muted rounded-lg p-3 break-all max-h-16 overflow-y-auto border font-mono">
                    {pixPayload}
                  </code>
                  <Button variant="outline" size="icon" className="shrink-0 rounded-lg h-auto" onClick={handleCopyPix}>
                    {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div className="rounded-xl bg-muted/50 p-4 space-y-1.5 text-sm border">
                <p className="font-semibold text-[10px] uppercase tracking-wider text-muted-foreground">Dados do favorecido</p>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                  <div><p className="text-[10px] text-muted-foreground">Chave ({paymentConfig.pix_key_type})</p>
                    <p className="font-medium text-xs truncate">{paymentConfig.pix_key}</p></div>
                  <div><p className="text-[10px] text-muted-foreground">Favorecido</p>
                    <p className="font-medium text-xs">{paymentConfig.pix_beneficiary}</p></div>
                </div>
              </div>

              <Button className="w-full gap-2 rounded-xl h-12" onClick={handlePay} disabled={processing}>
                {processing ? <><Loader2 className="h-4 w-4 animate-spin" /> Confirmando...</> : <><CheckCircle className="h-4 w-4" /> Já realizei o pagamento</>}
              </Button>
            </>
          ) : (
            <div className="text-center p-6 rounded-xl bg-muted/50 border">
              <QrCode className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">Chave PIX não configurada.</p>
              <p className="text-xs text-muted-foreground mt-1">Contate o administrador da plataforma.</p>
            </div>
          )}
        </div>
      )}

      {/* ── Cartão ── */}
      {method === 'credit_card' && (
        <div className="space-y-4">
          <div className="rounded-xl border p-5 space-y-4 bg-card">
            <div className="flex items-center gap-2">
              <Lock className="h-3.5 w-3.5 text-muted-foreground" />
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Pagamento seguro e criptografado</p>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Número do Cartão</Label>
              <Input placeholder="0000 0000 0000 0000" value={cardNum} maxLength={19}
                className="font-mono tracking-wider"
                onChange={e => setCardNum(e.target.value.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim())} />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Nome do Titular</Label>
              <Input placeholder="NOME COMO ESTÁ NO CARTÃO" value={cardName}
                className="uppercase"
                onChange={e => setCardName(e.target.value.toUpperCase())} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Validade</Label>
                <Input placeholder="MM/AA" value={cardExp} maxLength={5}
                  onChange={e => setCardExp(e.target.value.replace(/\D/g, '').replace(/^(\d{2})(\d)/, '$1/$2'))} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">CVV</Label>
                <Input placeholder="•••" value={cardCvv} maxLength={4} type="password"
                  onChange={e => setCardCvv(e.target.value.replace(/\D/g, ''))} />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Parcelas</Label>
              <Select value={installments} onValueChange={setInstallments}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {installmentOptions.map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button className="w-full gap-2 rounded-xl h-12 text-base font-bold" onClick={handlePay} disabled={processing}>
            {processing ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Processando...</>
            ) : (
              <><Lock className="h-4 w-4" /> Pagar {fmt(amount)}{parseInt(installments) > 1 ? ` em ${installments}x` : ''}</>
            )}
          </Button>

          <div className="flex items-center justify-center gap-4 text-[10px] text-muted-foreground">
            <span>🔒 SSL</span>
            <span>💳 Visa / Master / Elo</span>
            <span>🛡️ Ambiente Seguro</span>
          </div>
        </div>
      )}

      <Button variant="ghost" onClick={onBack} className="w-full text-sm">← Voltar</Button>
    </div>
  );
};

// ── Banner Purchase ──────────────────────────────────────────────────────────

const BannerBuy = () => {
  const { user } = useAuth();
  const { pricing, buyBanner, getSellerBanners, confirmBannerPayment } = useMedia();
  const seller = user as SellerProfile;
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const [step, setStep] = useState<'form' | 'pay' | 'done'>('form');
  const [form, setForm] = useState({ position: '' as BannerPosition | '', duration: 7 as PromoDuration, image: '', title: '', tag: '', cta: 'Ver Produtos', link: '/' });
  const [lastId, setLastId] = useState('');

  const price = form.duration ? pricing.banner_prices[form.duration] : 0;
  const sellerBanners = seller ? getSellerBanners(seller.id) : [];
  const currentSize = form.position ? (BANNER_SIZES[form.position] || DEFAULT_SIZE) : DEFAULT_SIZE;

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const resized = await resizeImage(file, currentSize.w, currentSize.h);
      const fileName = `banner_${Date.now()}.webp`;
      const { error } = await supabase.storage.from('banners').upload(fileName, resized, {
        contentType: 'image/webp', upsert: true,
      });
      if (error) throw error;
      const { data: urlData } = supabase.storage.from('banners').getPublicUrl(fileName);
      setForm(f => ({ ...f, image: urlData.publicUrl }));
      toast.success(`Imagem enviada (${currentSize.label})`);
    } catch (err: any) {
      toast.error(err.message || 'Erro ao enviar imagem');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const handlePaid = (method: 'pix' | 'credit_card') => {
    if (!seller || !form.position) return;
    const rec = buyBanner({
      seller_id: seller.id, seller_name: seller.store_name,
      position: form.position as BannerPosition,
      image: form.image, title: form.title, tag: form.tag, cta: form.cta, link: form.link,
      duration_days: form.duration,
      amount_paid: price, payment_method: method,
      payment_status: 'confirmed',
    });
    setLastId(rec.id);
    confirmBannerPayment(rec.id);
    setStep('done');
  };

  if (step === 'done') return (
    <div className="text-center space-y-4 py-4">
      <CheckCircle className="h-14 w-14 mx-auto text-emerald-500" />
      <h3 className="text-lg font-bold">Banner contratado e ativado!</h3>
      <p className="text-sm text-muted-foreground">Seu banner já está visível na homepage.</p>
      <Button onClick={() => setStep('form')}>Contratar outro</Button>
    </div>
  );

  if (step === 'pay') return (
    <PaymentStep amount={price} onPaid={handlePaid} onBack={() => setStep('form')}
      description={`Banner ${POSITIONS.find(p => p.value === form.position)?.label} · ${form.duration} dias`} />
  );

  return (
    <div className="space-y-6">
      <div className="rounded-xl border-2 border-dashed border-primary/30 bg-primary/5 p-4 text-sm">
        <p className="font-semibold text-primary mb-1">📍 Como funciona</p>
        <p className="text-muted-foreground">Escolha um espaço, envie sua imagem, pague e pronto! Ativação automática após pagamento.</p>
      </div>

      <div>
        <p className="text-sm font-semibold mb-2">Tabela de preços</p>
        <div className="grid grid-cols-4 gap-2">
          {DURATIONS.map(d => (
            <button key={d} onClick={() => setForm(f => ({ ...f, duration: d }))}
              className={`rounded-lg border-2 p-2 text-center text-xs transition-all ${form.duration === d ? 'border-primary bg-primary text-primary-foreground' : 'border-border hover:border-primary/40'}`}>
              <p className="font-bold">{d}d</p>
              <p className={form.duration === d ? 'text-primary-foreground/80' : 'text-muted-foreground'}>{fmt(pricing.banner_prices[d])}</p>
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
          <Label>Imagem do Banner ({currentSize.label})</Label>
          <div className="flex gap-2">
            <Button type="button" variant="outline" className="rounded-full shrink-0" disabled={uploading}
              onClick={() => fileRef.current?.click()}>
              {uploading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Upload className="h-4 w-4 mr-2" />}
              {uploading ? 'Enviando...' : 'Enviar imagem'}
            </Button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
          </div>
          {form.image && <img src={form.image} alt="Preview" className="w-full rounded-lg border aspect-video object-cover mt-2" />}
          <p className="text-xs text-muted-foreground">Redimensionada automaticamente para {currentSize.label}px</p>
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

// ── Product Highlight (multiple products) ────────────────────────────────────

const ProductHighlightBuy = () => {
  const { user } = useAuth();
  const { pricing, buyHighlight, getSellerHighlights, confirmHighlightPayment } = useMedia();
  const seller = user as SellerProfile;

  const [step, setStep] = useState<'form' | 'pay' | 'done'>('form');
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [duration, setDuration] = useState<PromoDuration>(7);

  const sellerProducts = products.filter(p => p.storeId === 's1' || p.storeId === 's2');
  const pricePerProduct = pricing.product_highlight_prices[duration];
  const totalPrice = pricePerProduct * selectedProducts.length;
  const myHighlights = seller ? getSellerHighlights(seller.id) : [];

  const toggleProduct = (pid: string) => {
    setSelectedProducts(prev =>
      prev.includes(pid) ? prev.filter(id => id !== pid) : [...prev, pid]
    );
  };

  const handlePaid = (method: 'pix' | 'credit_card') => {
    if (!seller || !selectedProducts.length) return;
    selectedProducts.forEach(pid => {
      const product = sellerProducts.find(p => p.id === pid);
      if (!product) return;
      const rec = buyHighlight({
        seller_id: seller.id, seller_name: seller.store_name,
        product_id: product.id, product_name: product.name, product_image: product.image,
        duration_days: duration, amount_paid: pricePerProduct,
        payment_method: method,
        payment_status: 'confirmed',
      });
      confirmHighlightPayment(rec.id);
    });
    setStep('done');
  };

  if (step === 'done') return (
    <div className="text-center space-y-4 py-4">
      <CheckCircle className="h-14 w-14 mx-auto text-emerald-500" />
      <h3 className="text-lg font-bold">{selectedProducts.length > 1 ? `${selectedProducts.length} produtos em destaque!` : 'Produto em destaque!'}</h3>
      <p className="text-sm text-muted-foreground">Seus produtos já aparecem no topo das listagens com badge "Patrocinado".</p>
      <Button onClick={() => { setStep('form'); setSelectedProducts([]); }}>Destacar mais produtos</Button>
    </div>
  );

  if (step === 'pay') return (
    <PaymentStep amount={totalPrice} onPaid={handlePaid} onBack={() => setStep('form')}
      description={`${selectedProducts.length} produto${selectedProducts.length > 1 ? 's' : ''} · ${duration} dias`} />
  );

  return (
    <div className="space-y-6">
      <div className="rounded-xl border-2 border-dashed border-accent/30 bg-accent/5 p-4 text-sm">
        <p className="font-semibold text-accent mb-1">⭐ Produto Patrocinado</p>
        <p className="text-muted-foreground">Seus produtos aparecem no topo das listagens com badge "Patrocinado". Selecione quantos quiser — o valor é somado automaticamente.</p>
      </div>

      <div className="grid grid-cols-4 gap-2">
        {DURATIONS.map(d => (
          <button key={d} onClick={() => setDuration(d)}
            className={`rounded-lg border-2 p-2 text-center text-xs transition-all ${duration === d ? 'border-accent bg-accent text-accent-foreground' : 'border-border hover:border-accent/40'}`}>
            <p className="font-bold">{d}d</p>
            <p className={duration === d ? 'text-accent-foreground/80' : 'text-muted-foreground'}>{fmt(pricing.product_highlight_prices[d])}/un</p>
          </button>
        ))}
      </div>

      <div className="space-y-2">
        <Label>Selecione os produtos a destacar ({selectedProducts.length} selecionado{selectedProducts.length !== 1 ? 's' : ''})</Label>
        <div className="grid gap-2 max-h-[300px] overflow-y-auto pr-1">
          {sellerProducts.map(p => {
            const isSelected = selectedProducts.includes(p.id);
            const alreadyActive = myHighlights.some(h => h.product_id === p.id && h.payment_status === 'confirmed' && h.expires_at > new Date().toISOString());
            return (
              <button
                key={p.id}
                onClick={() => !alreadyActive && toggleProduct(p.id)}
                disabled={alreadyActive}
                className={`flex items-center gap-3 rounded-lg border-2 p-3 text-left text-sm transition-all ${
                  alreadyActive ? 'opacity-50 cursor-not-allowed border-border' :
                  isSelected ? 'border-accent bg-accent/10' : 'border-border hover:border-accent/40'
                }`}
              >
                <img src={p.image} alt={p.name} className="h-12 w-12 rounded-lg object-cover shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{p.name}</p>
                  <p className="text-xs text-muted-foreground">{fmt(p.promoPrice ?? p.price)}</p>
                </div>
                {alreadyActive ? (
                  <Badge className="bg-emerald-100 text-emerald-700 shrink-0">✓ Ativo</Badge>
                ) : isSelected ? (
                  <Badge className="bg-accent/20 text-accent shrink-0">✓ Selecionado</Badge>
                ) : null}
              </button>
            );
          })}
        </div>
      </div>

      {selectedProducts.length > 0 && (
        <div className="rounded-lg bg-accent/5 border border-accent/20 p-4">
          <div className="flex items-center justify-between text-sm mb-1">
            <span className="text-muted-foreground">{selectedProducts.length} produto{selectedProducts.length > 1 ? 's' : ''} × {fmt(pricePerProduct)}</span>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">Duração: {duration} dias</p>
            <p className="text-xl font-extrabold text-accent">{fmt(totalPrice)}</p>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between border-t pt-4">
        <div><p className="text-xs text-muted-foreground">Total</p>
          <p className="text-2xl font-extrabold text-accent">{fmt(totalPrice)}</p></div>
        <Button className="gap-2 rounded-full px-8 bg-accent hover:bg-accent/90" disabled={selectedProducts.length === 0}
          onClick={() => setStep('pay')}>
          Destacar {selectedProducts.length > 1 ? `${selectedProducts.length} Produtos` : 'Produto'} <Sparkles className="h-4 w-4" />
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
