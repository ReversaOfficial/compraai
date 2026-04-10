import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { CreditCard, QrCode, MapPin, Truck, CheckCircle2, LogIn } from 'lucide-react';
import MarketplaceLayout from '@/components/marketplace/MarketplaceLayout';
import { useCart } from '@/contexts/CartContext';
import { useAuth, CustomerProfile } from '@/contexts/AuthContext';
import { addUserOrder } from '@/pages/AccountPage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const CheckoutPage = () => {
  const { items, total, clearCart } = useCart();
  const { user, isCustomer } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [payment, setPayment] = useState('pix');
  const [delivery, setDelivery] = useState('delivery');
  const [confirmed, setConfirmed] = useState(false);
  const [orderId, setOrderId] = useState('');

  const profile = (user && user.role === 'customer') ? user as CustomerProfile : null;

  // Pré-preencher com dados do perfil
  const [address, setAddress] = useState({
    full_name: '',
    phone: '',
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: '',
    zip: '',
  });

  useEffect(() => {
    if (profile) {
      setAddress({
        full_name: profile.full_name || '',
        phone: profile.phone || '',
        street: profile.address_street || '',
        number: profile.address_number || '',
        complement: profile.address_complement || '',
        neighborhood: profile.address_neighborhood || '',
        city: profile.address_city || '',
        state: profile.address_state || '',
        zip: profile.address_zip || '',
      });
    }
  }, [profile]);

  const setAddr = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) => setAddress(a => ({ ...a, [k]: e.target.value }));

  if (items.length === 0 && !confirmed) { navigate('/carrinho'); return null; }

  // Se não estiver logado, pedir login
  if (!user || !isCustomer) {
    return (
      <MarketplaceLayout>
        <div className="container py-20 text-center max-w-md mx-auto">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
            <LogIn className="h-10 w-10 text-primary" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Entre na sua conta</h1>
          <p className="text-muted-foreground mb-6">Para finalizar sua compra, faça login ou crie uma conta.</p>
          <div className="flex gap-3 justify-center">
            <Button className="rounded-full" asChild>
              <Link to="/login">Entrar</Link>
            </Button>
            <Button variant="outline" className="rounded-full" asChild>
              <Link to="/cadastro">Criar Conta</Link>
            </Button>
          </div>
        </div>
      </MarketplaceLayout>
    );
  }

  const handleConfirm = () => {
    const id = 'ORD-' + Math.random().toString(36).substring(2, 8).toUpperCase();
    setOrderId(id);

    // Salvar pedido vinculado ao usuário
    addUserOrder({
      id,
      userId: user.id,
      items: items.map(({ product, quantity }) => ({
        name: product.name,
        image: product.image,
        storeName: product.storeName,
        price: product.promoPrice || product.price,
        quantity,
      })),
      total,
      status: 'pending',
      paymentMethod: payment as 'pix' | 'credit_card',
      deliveryMethod: delivery as 'delivery' | 'pickup',
      createdAt: new Date().toLocaleDateString('pt-BR'),
    });

    clearCart();
    setConfirmed(true);
  };

  if (confirmed) return (
    <MarketplaceLayout>
      <div className="container py-20 text-center max-w-md mx-auto animate-fade-in">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-success/10">
          <CheckCircle2 className="h-10 w-10 text-success" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Pedido Confirmado!</h1>
        <p className="text-muted-foreground mb-2">Pedido #{orderId}</p>
        <p className="text-sm text-muted-foreground mb-8">Acompanhe o status do seu pedido na sua conta.</p>
        <div className="flex gap-3 justify-center">
          <Button className="rounded-full" onClick={() => navigate('/conta')}>Ver Meus Pedidos</Button>
          <Button variant="outline" className="rounded-full" onClick={() => navigate('/')}>Voltar ao Início</Button>
        </div>
      </div>
    </MarketplaceLayout>
  );

  const steps = ['Endereço', 'Entrega', 'Pagamento', 'Revisão'];

  const hasAddress = address.street && address.number && address.neighborhood && address.city && address.zip;

  return (
    <MarketplaceLayout>
      <div className="container py-8 max-w-3xl">
        <h1 className="text-2xl font-bold mb-8">Checkout</h1>

        {/* Steps */}
        <div className="flex items-center gap-2 mb-8">
          {steps.map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${i <= step ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>{i + 1}</div>
              <span className={`text-sm hidden sm:block ${i <= step ? 'font-medium' : 'text-muted-foreground'}`}>{s}</span>
              {i < steps.length - 1 && <div className="h-px w-8 bg-border" />}
            </div>
          ))}
        </div>

        {step === 0 && (
          <div className="space-y-4 animate-fade-in">
            <h2 className="text-lg font-semibold flex items-center gap-2"><MapPin className="h-5 w-5" /> Endereço de Entrega</h2>

            {hasAddress && (
              <div className="rounded-lg bg-emerald-50 dark:bg-emerald-950 p-3 text-sm text-emerald-700 dark:text-emerald-300">
                ✅ Endereço preenchido automaticamente do seu cadastro. Você pode editar se necessário.
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <div><Label>Nome completo</Label><Input value={address.full_name} onChange={setAddr('full_name')} placeholder="Seu nome" /></div>
              <div><Label>Telefone</Label><Input value={address.phone} onChange={setAddr('phone')} placeholder="(00) 00000-0000" /></div>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="sm:col-span-2"><Label>Rua</Label><Input value={address.street} onChange={setAddr('street')} placeholder="Nome da rua" /></div>
              <div><Label>Número</Label><Input value={address.number} onChange={setAddr('number')} placeholder="123" /></div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div><Label>Complemento</Label><Input value={address.complement} onChange={setAddr('complement')} placeholder="Apto, Bloco..." /></div>
              <div><Label>Bairro</Label><Input value={address.neighborhood} onChange={setAddr('neighborhood')} placeholder="Bairro" /></div>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div><Label>CEP</Label><Input value={address.zip} onChange={setAddr('zip')} placeholder="00000-000" /></div>
              <div><Label>Cidade</Label><Input value={address.city} onChange={setAddr('city')} placeholder="Cidade" /></div>
              <div><Label>Estado</Label><Input value={address.state} onChange={setAddr('state')} placeholder="SP" /></div>
            </div>
            <Button className="rounded-full" onClick={() => setStep(1)}>Continuar</Button>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4 animate-fade-in">
            <h2 className="text-lg font-semibold flex items-center gap-2"><Truck className="h-5 w-5" /> Método de Recebimento</h2>
            <RadioGroup value={delivery} onValueChange={setDelivery} className="space-y-3">
              <label className="flex items-center gap-3 rounded-xl border p-4 cursor-pointer hover:bg-secondary/50 transition-colors">
                <RadioGroupItem value="delivery" />
                <Truck className="h-5 w-5 text-primary" />
                <div><p className="font-medium text-sm">Entrega em casa</p><p className="text-xs text-muted-foreground">Receba no endereço informado</p></div>
              </label>
              <label className="flex items-center gap-3 rounded-xl border p-4 cursor-pointer hover:bg-secondary/50 transition-colors">
                <RadioGroupItem value="pickup" />
                <MapPin className="h-5 w-5 text-primary" />
                <div><p className="font-medium text-sm">Retirada na loja</p><p className="text-xs text-muted-foreground">Retire diretamente em cada loja</p></div>
              </label>
            </RadioGroup>
            <div className="flex gap-3">
              <Button variant="outline" className="rounded-full" onClick={() => setStep(0)}>Voltar</Button>
              <Button className="rounded-full" onClick={() => setStep(2)}>Continuar</Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4 animate-fade-in">
            <h2 className="text-lg font-semibold flex items-center gap-2"><CreditCard className="h-5 w-5" /> Pagamento</h2>
            <RadioGroup value={payment} onValueChange={setPayment} className="space-y-3">
              <label className="flex items-center gap-3 rounded-xl border p-4 cursor-pointer hover:bg-secondary/50 transition-colors">
                <RadioGroupItem value="pix" />
                <QrCode className="h-5 w-5 text-primary" />
                <div><p className="font-medium text-sm">Pix</p><p className="text-xs text-muted-foreground">Pagamento instantâneo</p></div>
              </label>
              <label className="flex items-center gap-3 rounded-xl border p-4 cursor-pointer hover:bg-secondary/50 transition-colors">
                <RadioGroupItem value="credit_card" />
                <CreditCard className="h-5 w-5 text-primary" />
                <div><p className="font-medium text-sm">Cartão de Crédito</p><p className="text-xs text-muted-foreground">Até 12x sem juros</p></div>
              </label>
            </RadioGroup>
            {payment === 'credit_card' && (
              <div className="grid gap-4 sm:grid-cols-2 mt-4">
                <div className="sm:col-span-2"><Label>Número do Cartão</Label><Input placeholder="0000 0000 0000 0000" /></div>
                <div><Label>Validade</Label><Input placeholder="MM/AA" /></div>
                <div><Label>CVV</Label><Input placeholder="000" /></div>
                <div className="sm:col-span-2"><Label>Nome no Cartão</Label><Input placeholder="Como impresso no cartão" /></div>
              </div>
            )}
            <div className="flex gap-3">
              <Button variant="outline" className="rounded-full" onClick={() => setStep(1)}>Voltar</Button>
              <Button className="rounded-full" onClick={() => setStep(3)}>Continuar</Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6 animate-fade-in">
            <h2 className="text-lg font-semibold">Revisão do Pedido</h2>

            {/* Endereço resumido */}
            <div className="rounded-xl border p-4">
              <p className="text-sm font-medium mb-1 flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> Entregar para:</p>
              <p className="text-sm text-muted-foreground">
                {address.full_name} · {address.phone}<br />
                {address.street}, {address.number} {address.complement && `- ${address.complement}`}<br />
                {address.neighborhood} · {address.city}/{address.state} · CEP {address.zip}
              </p>
            </div>

            <div className="rounded-xl border divide-y">
              {items.map(({ product, quantity }) => (
                <div key={product.id} className="flex items-center gap-4 p-4">
                  <img src={product.image} alt={product.name} className="h-12 w-12 rounded-lg object-cover" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{product.name}</p>
                    <p className="text-xs text-muted-foreground">{product.storeName} · Qtd: {quantity}</p>
                  </div>
                  <p className="text-sm font-bold">{fmt((product.promoPrice || product.price) * quantity)}</p>
                </div>
              ))}
            </div>
            <div className="rounded-xl bg-secondary/50 p-4 space-y-2 text-sm">
              <div className="flex justify-between"><span>Método</span><span className="font-medium">{delivery === 'delivery' ? 'Entrega' : 'Retirada'}</span></div>
              <div className="flex justify-between"><span>Pagamento</span><span className="font-medium">{payment === 'pix' ? 'Pix' : 'Cartão de Crédito'}</span></div>
              <div className="flex justify-between border-t pt-2 text-base font-bold"><span>Total</span><span className="text-primary">{fmt(total)}</span></div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="rounded-full" onClick={() => setStep(2)}>Voltar</Button>
              <Button className="rounded-full" size="lg" onClick={handleConfirm}>Confirmar Pedido</Button>
            </div>
          </div>
        )}
      </div>
    </MarketplaceLayout>
  );
};

export default CheckoutPage;
