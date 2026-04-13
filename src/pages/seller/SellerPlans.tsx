import { useState } from 'react';
import SellerLayout from '@/components/seller/SellerLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Check, ArrowRight, CreditCard, QrCode, Star, AlertTriangle, CheckCircle, Package } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth, SellerProfile } from '@/contexts/AuthContext';
import { usePlans } from '@/contexts/PlansContext';

const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

type Step = 'compare' | 'billing' | 'payment' | 'confirm';

const SellerPlans = () => {
  const { user, updateProfile } = useAuth();
  const { plans, getPlan, paymentConfig, addPayment, confirmPayment } = usePlans();
  const seller = user as SellerProfile;

  const currentPlan = getPlan(seller?.plan_id);

  const [step, setStep] = useState<Step>('compare');
  const [selectedPlanId, setSelectedPlanId] = useState('');
  const [billing, setBilling] = useState<'monthly' | 'annual'>('monthly');
  const [payMethod, setPayMethod] = useState<'pix' | 'credit_card'>('pix');
  const [cardNum, setCardNum] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardExp, setCardExp] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [processing, setProcessing] = useState(false);
  const [paymentId, setPaymentId] = useState('');

  const selectedPlan = plans.find(p => p.id === selectedPlanId);

  const amount = selectedPlan
    ? billing === 'annual' ? selectedPlan.annual_price : selectedPlan.monthly_price
    : 0;

  const isDowngrade = selectedPlan && currentPlan
    ? selectedPlan.product_limit < currentPlan.product_limit
    : false;

  const gradients: Record<string, string> = {
    plan_10: 'from-slate-400 to-slate-600',
    plan_20: 'from-emerald-400 to-emerald-600',
    plan_30: 'from-blue-400 to-blue-600',
    plan_50: 'from-violet-400 to-violet-700',
    plan_100: 'from-amber-400 to-orange-500',
  };

  const handleSelectPlan = (planId: string) => {
    setSelectedPlanId(planId);
    setStep('billing');
  };

  const handleConfirmBilling = () => {
    setStep('payment');
  };

  const handlePayment = async () => {
    if (payMethod === 'credit_card') {
      if (!cardNum || !cardName || !cardExp || !cardCvv) {
        toast.error('Preencha todos os dados do cartão'); return;
      }
    }
    setProcessing(true);
    await new Promise(r => setTimeout(r, 1500)); // simulate processing

    const rec = addPayment({
      seller_id: seller.id,
      seller_name: seller.store_name,
      plan_id: selectedPlanId,
      plan_name: selectedPlan?.name ?? selectedPlanId,
      amount,
      method: payMethod,
      billing,
      status: payMethod === 'credit_card' ? 'confirmed' : 'pending', // PIX needs manual confirm
    });

    setPaymentId(rec.id);

    if (payMethod === 'credit_card') {
      // Auto confirm and update plan
      confirmPayment(rec.id);
      updateProfile({
        plan_id: selectedPlanId,
        plan_limit: selectedPlan!.product_limit,
        plan_expires_at: new Date(Date.now() + (billing === 'annual' ? 365 : 30) * 86400000).toISOString(),
      } as any);
    }

    setProcessing(false);
    setStep('confirm');
  };

  const handleReset = () => {
    setStep('compare');
    setSelectedPlanId('');
    setBilling('monthly');
    setPayMethod('pix');
    setCardNum(''); setCardName(''); setCardExp(''); setCardCvv('');
    setPaymentId('');
  };

  if (!seller) return null;

  return (
    <SellerLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Meu Plano</h1>
          <p className="text-sm text-muted-foreground">Gerencie sua assinatura e troque de plano a qualquer momento</p>
        </div>

        {/* Current Plan Banner */}
        <div className={`rounded-xl p-5 bg-gradient-to-r ${gradients[seller.plan_id] ?? 'from-gray-400 to-gray-600'} text-white`}>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <p className="text-white/70 text-sm font-medium mb-1">Plano Atual</p>
              <p className="text-3xl font-extrabold">{currentPlan?.name ?? seller.plan_id}</p>
              <p className="text-white/80 text-sm mt-1">{seller.plan_limit} produtos · expira em {new Date(seller.plan_expires_at).toLocaleDateString('pt-BR')}</p>
            </div>
            <div className="text-right">
              <p className="text-white/70 text-xs">Mensalidade</p>
              <p className="text-2xl font-extrabold">{fmt(currentPlan?.monthly_price ?? 0)}</p>
              <Button variant="outline" className="mt-2 text-white border-white hover:bg-white hover:text-foreground rounded-full text-sm"
                onClick={() => { setStep('compare'); }}>
                Trocar de Plano
              </Button>
            </div>
          </div>
        </div>

        {/* Step: Compare */}
        {step === 'compare' && (
          <div>
            <h2 className="text-lg font-bold mb-4">Escolha seu plano</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {plans.map(plan => {
                const isCurrent = plan.id === seller.plan_id;
                return (
                  <Card key={plan.id}
                    className={`shadow-card overflow-hidden relative flex flex-col transition-all ${plan.popular ? 'ring-2 ring-primary' : ''} ${isCurrent ? 'opacity-60' : 'hover:shadow-elevated'}`}>
                    {plan.popular && (
                      <div className="bg-primary text-white text-[10px] font-bold text-center py-1 flex items-center justify-center gap-1">
                        <Star className="h-3 w-3" /> MAIS POPULAR
                      </div>
                    )}
                    <div className={`bg-gradient-to-br ${gradients[plan.id]} p-4 text-white`}>
                      <p className="text-xs font-bold uppercase tracking-wider opacity-80">{plan.name}</p>
                      <p className="text-4xl font-extrabold mt-1">{plan.product_limit}</p>
                      <p className="text-xs opacity-70">produtos</p>
                    </div>
                    <CardContent className="p-4 flex flex-col flex-1">
                      <div className="mb-3">
                        <p className="text-2xl font-extrabold text-primary">{fmt(plan.monthly_price)}</p>
                        <p className="text-xs text-muted-foreground">/mês</p>
                      </div>
                      <div className="flex items-center gap-1.5 bg-accent/10 text-accent rounded px-2 py-1 text-xs font-bold mb-4">
                        <Check className="h-3 w-3" /> {plan.discount_pct}% OFF no plano anual
                      </div>
                      <div className="space-y-1.5 flex-1 text-xs mb-4">
                        <div className="flex items-center gap-2"><Package className="h-3 w-3 text-muted-foreground" /> {plan.product_limit} produtos ativos</div>
                        <div className="flex items-center gap-2"><Check className="h-3 w-3 text-emerald-500" /> Painel completo</div>
                        <div className="flex items-center gap-2"><Check className="h-3 w-3 text-emerald-500" /> Suporte por e-mail</div>
                      </div>
                      {isCurrent ? (
                        <Badge className="w-full justify-center py-2">✓ Plano Atual</Badge>
                      ) : (
                        <Button size="sm" className="w-full rounded-full gap-1" onClick={() => handleSelectPlan(plan.id)}>
                          Selecionar <ArrowRight className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* Step: Billing */}
        {step === 'billing' && selectedPlan && (
          <Card className="shadow-card max-w-lg mx-auto">
            <CardContent className="p-6 space-y-5">
              <div>
                <h2 className="text-lg font-bold">Periodicidade</h2>
                <p className="text-sm text-muted-foreground">Escolha mensal ou anual para o plano <strong>{selectedPlan.name}</strong></p>
              </div>

              {isDowngrade && (
                <div className="flex gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700">
                  <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                  <p>Este é um <strong>downgrade</strong>. Se você tiver mais de {selectedPlan.product_limit} produtos cadastrados, alguns ficarão invisíveis.</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => setBilling('monthly')}
                  className={`rounded-xl border-2 p-4 text-left transition-all ${billing === 'monthly' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40'}`}>
                  <p className="font-bold text-sm">Mensal</p>
                  <p className="text-2xl font-extrabold text-primary mt-1">{fmt(selectedPlan.monthly_price)}</p>
                  <p className="text-xs text-muted-foreground">/mês</p>
                </button>
                <button onClick={() => setBilling('annual')}
                  className={`rounded-xl border-2 p-4 text-left transition-all relative ${billing === 'annual' ? 'border-accent bg-accent/5' : 'border-border hover:border-accent/40'}`}>
                  <div className="absolute -top-2 right-2 bg-accent text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {selectedPlan.discount_pct}% OFF
                  </div>
                  <p className="font-bold text-sm">Anual</p>
                  <p className="text-2xl font-extrabold text-accent mt-1">{fmt(selectedPlan.annual_monthly_price)}</p>
                  <p className="text-xs text-muted-foreground">/mês · total {fmt(selectedPlan.annual_price)}</p>
                </button>
              </div>

              <div className="border-t pt-4 flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Total a pagar</p>
                  <p className="text-xl font-extrabold">{fmt(amount)}</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setStep('compare')}>Voltar</Button>
                  <Button className="rounded-full gap-1" onClick={handleConfirmBilling}>
                    Continuar <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step: Payment */}
        {step === 'payment' && selectedPlan && (
          <Card className="shadow-card max-w-lg mx-auto">
            <CardContent className="p-6 space-y-5">
              <div>
                <h2 className="text-lg font-bold">Forma de Pagamento</h2>
                <p className="text-sm text-muted-foreground">{selectedPlan.name} · {billing === 'annual' ? 'Anual' : 'Mensal'} · <strong>{fmt(amount)}</strong></p>
              </div>

              {/* Toggle */}
              <div className="flex gap-2">
                <button onClick={() => setPayMethod('pix')}
                  className={`flex-1 flex items-center justify-center gap-2 rounded-xl border-2 py-3 text-sm font-bold transition-all ${payMethod === 'pix' ? 'border-primary bg-primary text-white' : 'border-border hover:border-primary/40'}`}>
                  <QrCode className="h-4 w-4" /> PIX
                </button>
                <button onClick={() => setPayMethod('credit_card')}
                  className={`flex-1 flex items-center justify-center gap-2 rounded-xl border-2 py-3 text-sm font-bold transition-all ${payMethod === 'credit_card' ? 'border-primary bg-primary text-white' : 'border-border hover:border-primary/40'}`}>
                  <CreditCard className="h-4 w-4" /> Cartão
                </button>
              </div>

              {/* PIX */}
              {payMethod === 'pix' && (
                <div className="rounded-xl bg-muted/50 p-4 text-sm space-y-3">
                  <p className="font-semibold">Dados para transferência PIX</p>
                  {paymentConfig.pix_key ? (
                    <>
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">Tipo da chave</p>
                        <p className="font-medium uppercase">{paymentConfig.pix_key_type}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">Chave PIX</p>
                        <code className="block bg-white border rounded px-3 py-2 font-mono text-sm">{paymentConfig.pix_key}</code>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">Favorecido</p>
                        <p className="font-medium">{paymentConfig.pix_beneficiary}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">Valor exato</p>
                        <p className="text-2xl font-extrabold text-primary">{fmt(amount)}</p>
                      </div>
                      <p className="text-xs text-amber-600 bg-amber-50 rounded p-2">
                        ⚠️ Após o pagamento, seu plano será ativado em até 24h após confirmação.
                      </p>
                    </>
                  ) : (
                    <p className="text-muted-foreground">Chave PIX não configurada. Entre em contato com o suporte.</p>
                  )}
                </div>
              )}

              {/* Credit Card */}
              {payMethod === 'credit_card' && (
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <Label>Número do cartão</Label>
                    <Input placeholder="0000 0000 0000 0000" value={cardNum}
                      onChange={e => setCardNum(e.target.value.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim())}
                      maxLength={19} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Nome no cartão</Label>
                    <Input placeholder="NOME COMPLETO" value={cardName}
                      onChange={e => setCardName(e.target.value.toUpperCase())} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label>Validade</Label>
                      <Input placeholder="MM/AA" value={cardExp}
                        onChange={e => setCardExp(e.target.value.replace(/\D/g, '').replace(/^(\d{2})(\d)/, '$1/$2'))}
                        maxLength={5} />
                    </div>
                    <div className="space-y-1.5">
                      <Label>CVV</Label>
                      <Input placeholder="123" value={cardCvv}
                        onChange={e => setCardCvv(e.target.value.replace(/\D/g, ''))}
                        maxLength={4} type="password" />
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-2 border-t">
                <Button variant="outline" onClick={() => setStep('billing')}>Voltar</Button>
                <Button className="flex-1 rounded-full gap-2" onClick={handlePayment} disabled={processing}>
                  {processing ? 'Processando...' : `Pagar ${fmt(amount)}`}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step: Confirm */}
        {step === 'confirm' && (
          <Card className="shadow-card max-w-lg mx-auto text-center">
            <CardContent className="p-8 space-y-4">
              <div className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full ${payMethod === 'credit_card' ? 'bg-emerald-100' : 'bg-amber-100'}`}>
                {payMethod === 'credit_card'
                  ? <CheckCircle className="h-8 w-8 text-emerald-600" />
                  : <QrCode className="h-8 w-8 text-amber-600" />
                }
              </div>
              {payMethod === 'credit_card' ? (
                <>
                  <h2 className="text-xl font-extrabold text-emerald-600">Plano Ativado!</h2>
                  <p className="text-sm text-muted-foreground">
                    Seu plano <strong>{selectedPlan?.name}</strong> foi ativado com sucesso.
                    Você já pode cadastrar até <strong>{selectedPlan?.product_limit} produtos</strong>.
                  </p>
                </>
              ) : (
                <>
                  <h2 className="text-xl font-extrabold">Aguardando PIX</h2>
                  <p className="text-sm text-muted-foreground">
                    Seu pedido de upgrade foi registrado. Ao confirmarmos o pagamento PIX, seu plano <strong>{selectedPlan?.name}</strong> será ativado automaticamente.
                  </p>
                  <div className="rounded-lg bg-muted p-3 text-sm">
                    <p className="text-xs text-muted-foreground mb-1">Valor transferido</p>
                    <p className="text-2xl font-extrabold">{fmt(amount)}</p>
                  </div>
                </>
              )}
              <Button className="w-full rounded-full" onClick={handleReset}>Voltar ao Painel</Button>
            </CardContent>
          </Card>
        )}
      </div>
    </SellerLayout>
  );
};

export default SellerPlans;
