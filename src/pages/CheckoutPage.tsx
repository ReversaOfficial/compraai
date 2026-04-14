import { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { CreditCard, QrCode, MapPin, Truck, CheckCircle2, LogIn, Package } from 'lucide-react';
import MarketplaceLayout from '@/components/marketplace/MarketplaceLayout';
import { useCart } from '@/contexts/CartContext';
import { useAuth, CustomerProfile } from '@/contexts/AuthContext';
import { addUserOrder } from '@/pages/AccountPage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { supabase } from '@/integrations/supabase/client';

const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const notifyCouriersWhatsApp = async (neighborhood: string, city: string, freightValue: number, courierNet: number) => {
  try {
    // Get active couriers that serve this neighborhood/city
    const { data: couriers } = await supabase.from('couriers').select('name, phone, neighborhoods, city')
      .eq('is_active', true).eq('operational_status', 'available');
    if (!couriers?.length) return;

    const matching = couriers.filter(c => {
      const servesCity = c.city?.toLowerCase() === city.toLowerCase();
      const servesNeighborhood = (c.neighborhoods || []).some((n: string) => n.toLowerCase() === neighborhood.toLowerCase());
      return servesCity || servesNeighborhood;
    });

    for (const c of matching) {
      if (!c.phone) continue;
      const phone = c.phone.replace(/\D/g, '');
      const msg = encodeURIComponent(
        `🚚 *Nova entrega disponível!*\n\n` +
        `📍 Destino: ${neighborhood}, ${city}\n` +
        `💰 Você recebe: ${fmt(courierNet)}\n\n` +
        `Acesse o painel para aceitar:\n${window.location.origin}/freteiro`
      );
      // Open WhatsApp link (will open for the admin/system)
      // In production, this would use WhatsApp Business API
      window.open(`https://wa.me/55${phone}?text=${msg}`, '_blank');
    }
  } catch (err) {
    console.error('Error notifying couriers:', err);
  }
};

interface ShippingOption {
  type: 'pickup' | 'store_delivery' | 'entregaai';
  label: string;
  description: string;
  price: number;
  storeId: string;
  storeName: string;
}

const CheckoutPage = () => {
  const { items, total, clearCart } = useCart();
  const { user, isCustomer } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [payment, setPayment] = useState('pix');
  const [confirmed, setConfirmed] = useState(false);
  const [orderId, setOrderId] = useState('');

  // Shipping per store
  const [shippingChoices, setShippingChoices] = useState<Record<string, ShippingOption>>({});
  const [deliveryZones, setDeliveryZones] = useState<any[]>([]);
  const [entregaaiZones, setEntregaaiZones] = useState<any[]>([]);

  const profile = (user && user.role === 'customer') ? user as CustomerProfile : null;

  const [address, setAddress] = useState({
    full_name: '', phone: '', street: '', number: '', complement: '',
    neighborhood: '', city: '', state: '', zip: '',
  });

  useEffect(() => {
    if (profile) {
      setAddress({
        full_name: profile.full_name || '', phone: profile.phone || '',
        street: profile.address_street || '', number: profile.address_number || '',
        complement: profile.address_complement || '', neighborhood: profile.address_neighborhood || '',
        city: profile.address_city || '', state: profile.address_state || '', zip: profile.address_zip || '',
      });
    }
  }, [profile]);

  // Fetch delivery zones for all stores in cart
  const storeIds = useMemo(() => [...new Set(items.map(i => i.product.storeId))], [items]);

  useEffect(() => {
    const fetchZones = async () => {
      if (storeIds.length === 0) return;
      const { data: dz } = await supabase.from('delivery_zones').select('*').in('store_id', storeIds).eq('is_active', true);
      setDeliveryZones(dz || []);
      const { data: ea } = await supabase.from('entregaai_settings').select('*').eq('is_active', true);
      setEntregaaiZones(ea || []);
    };
    fetchZones();
  }, [storeIds]);

  // Calculate shipping options per store
  const storeShippingOptions = useMemo(() => {
    const result: Record<string, ShippingOption[]> = {};
    const grouped = items.reduce<Record<string, typeof items>>((acc, item) => {
      (acc[item.product.storeId] = acc[item.product.storeId] || []).push(item);
      return acc;
    }, {});

    for (const [sid, storeItems] of Object.entries(grouped)) {
      const storeName = storeItems[0].product.storeName;
      const options: ShippingOption[] = [];

      // Pickup always available
      options.push({ type: 'pickup', label: 'Retirada na loja', description: 'Retire na loja', price: 0, storeId: sid, storeName });

      // Store delivery - find matching zone
      const storeZones = deliveryZones.filter(z => z.store_id === sid);
      const matchedZone = storeZones.find(z =>
        z.neighborhood.toLowerCase() === address.neighborhood.toLowerCase() &&
        z.city.toLowerCase() === address.city.toLowerCase()
      ) || storeZones.find(z =>
        z.city.toLowerCase() === address.city.toLowerCase() && !z.neighborhood
      ) || storeZones.find(z =>
        z.city.toLowerCase() === address.city.toLowerCase()
      );

      if (matchedZone) {
        options.push({ type: 'store_delivery', label: 'Entrega pela loja', description: `Frete: ${fmt(matchedZone.price)}`, price: matchedZone.price, storeId: sid, storeName });
      }

      // EntregaAI
      const matchedEA = entregaaiZones.find(z =>
        z.neighborhood.toLowerCase() === address.neighborhood.toLowerCase() &&
        z.city.toLowerCase() === address.city.toLowerCase()
      ) || entregaaiZones.find(z =>
        z.city.toLowerCase() === address.city.toLowerCase() && !z.neighborhood
      ) || entregaaiZones.find(z =>
        z.city.toLowerCase() === address.city.toLowerCase()
      );

      if (matchedEA) {
        options.push({ type: 'entregaai', label: 'EntregaAí', description: `Entrega pela plataforma · ${fmt(matchedEA.base_price)}`, price: matchedEA.base_price, storeId: sid, storeName });
      }

      result[sid] = options;
    }
    return result;
  }, [items, deliveryZones, entregaaiZones, address.neighborhood, address.city]);

  // Auto-select first option per store
  useEffect(() => {
    const newChoices: Record<string, ShippingOption> = {};
    for (const [sid, opts] of Object.entries(storeShippingOptions)) {
      if (!shippingChoices[sid] || !opts.find(o => o.type === shippingChoices[sid].type)) {
        newChoices[sid] = opts[0];
      } else {
        newChoices[sid] = opts.find(o => o.type === shippingChoices[sid].type) || opts[0];
      }
    }
    setShippingChoices(newChoices);
  }, [storeShippingOptions]);

  const shippingTotal = Object.values(shippingChoices).reduce((sum, c) => sum + c.price, 0);
  const grandTotal = total + shippingTotal;

  const setAddr = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) => setAddress(a => ({ ...a, [k]: e.target.value }));

  if (items.length === 0 && !confirmed) { navigate('/carrinho'); return null; }

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
            <Button className="rounded-full" asChild><Link to="/login">Entrar</Link></Button>
            <Button variant="outline" className="rounded-full" asChild><Link to="/cadastro">Criar Conta</Link></Button>
          </div>
        </div>
      </MarketplaceLayout>
    );
  }

  const handleConfirm = async () => {
    const id = 'ORD-' + Math.random().toString(36).substring(2, 8).toUpperCase();
    setOrderId(id);
    addUserOrder({
      id, userId: user.id,
      items: items.map(({ product, quantity }) => ({
        name: product.name, image: product.image, storeName: product.storeName,
        price: product.promoPrice || product.price, quantity,
      })),
      total: grandTotal, status: 'pending',
      paymentMethod: payment as 'pix' | 'credit_card',
      deliveryMethod: 'delivery',
      createdAt: new Date().toLocaleDateString('pt-BR'),
    });

    // Create delivery orders for courier (entregaai) deliveries
    for (const [sid, choice] of Object.entries(shippingChoices)) {
      if (choice.type === 'entregaai') {
        const matchedEA = entregaaiZones.find(z =>
          z.neighborhood?.toLowerCase() === address.neighborhood.toLowerCase() &&
          z.city?.toLowerCase() === address.city.toLowerCase()
        ) || entregaaiZones.find(z =>
          z.city?.toLowerCase() === address.city.toLowerCase()
        );
        const feePercent = matchedEA?.platform_fee_percent || 10;
        const feeAmount = choice.price * feePercent / 100;
        const storeItems = items.filter(i => i.product.storeId === sid);
        const storeName = storeItems[0]?.product.storeName || '';

        await supabase.from('delivery_orders').insert({
          order_id: id,
          store_id: sid,
          customer_id: user.id,
          pickup_address: storeName,
          delivery_address: `${address.street}, ${address.number} - ${address.neighborhood}, ${address.city}/${address.state}`,
          neighborhood: address.neighborhood,
          city: address.city,
          freight_value: choice.price,
          platform_fee_percent: feePercent,
          platform_fee_amount: feeAmount,
          courier_net_amount: choice.price - feeAmount,
          status: 'waiting',
        });

        // Notify couriers via WhatsApp
        notifyCouriersWhatsApp(address.neighborhood, address.city, choice.price, choice.price - feeAmount);
      }
    }

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
                ✅ Endereço preenchido automaticamente do seu cadastro.
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
            <h2 className="text-lg font-semibold flex items-center gap-2"><Truck className="h-5 w-5" /> Método de Entrega por Loja</h2>
            <p className="text-sm text-muted-foreground">Escolha como deseja receber os produtos de cada loja.</p>

            {Object.entries(storeShippingOptions).map(([sid, opts]) => (
              <div key={sid} className="rounded-xl border p-4 space-y-3">
                <p className="text-sm font-semibold">{opts[0]?.storeName}</p>
                <div className="text-xs text-muted-foreground mb-2">
                  {items.filter(i => i.product.storeId === sid).map(i => i.product.name).join(', ')}
                </div>
                <RadioGroup
                  value={shippingChoices[sid]?.type || 'pickup'}
                  onValueChange={val => {
                    const opt = opts.find(o => o.type === val);
                    if (opt) setShippingChoices(prev => ({ ...prev, [sid]: opt }));
                  }}
                  className="space-y-2"
                >
                  {opts.map(opt => (
                    <label key={opt.type} className="flex items-center gap-3 rounded-lg border p-3 cursor-pointer hover:bg-secondary/50 transition-colors">
                      <RadioGroupItem value={opt.type} />
                      {opt.type === 'pickup' && <Package className="h-4 w-4 text-primary" />}
                      {opt.type === 'store_delivery' && <Truck className="h-4 w-4 text-primary" />}
                      {opt.type === 'entregaai' && <Truck className="h-4 w-4 text-accent" />}
                      <div className="flex-1">
                        <p className="text-sm font-medium">{opt.label}</p>
                        <p className="text-xs text-muted-foreground">{opt.description}</p>
                      </div>
                      <p className="text-sm font-bold">{opt.price > 0 ? fmt(opt.price) : 'Grátis'}</p>
                    </label>
                  ))}
                </RadioGroup>
              </div>
            ))}

            {shippingTotal > 0 && (
              <div className="rounded-lg bg-secondary/50 p-3 flex justify-between text-sm font-medium">
                <span>Total do frete</span>
                <span className="text-primary font-bold">{fmt(shippingTotal)}</span>
              </div>
            )}

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

            <div className="rounded-xl border p-4">
              <p className="text-sm font-medium mb-1 flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> Entregar para:</p>
              <p className="text-sm text-muted-foreground">
                {address.full_name} · {address.phone}<br />
                {address.street}, {address.number} {address.complement && `- ${address.complement}`}<br />
                {address.neighborhood} · {address.city}/{address.state} · CEP {address.zip}
              </p>
            </div>

            <div className="rounded-xl border divide-y">
              {items.map(({ product, quantity }) => {
                const choice = shippingChoices[product.storeId];
                return (
                  <div key={product.id} className="flex items-center gap-4 p-4">
                    <img src={product.image} alt={product.name} className="h-12 w-12 rounded-lg object-cover" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{product.name}</p>
                      <p className="text-xs text-muted-foreground">{product.storeName} · Qtd: {quantity}</p>
                      {choice && <p className="text-xs text-primary">{choice.label}{choice.price > 0 ? ` · ${fmt(choice.price)}` : ''}</p>}
                    </div>
                    <p className="text-sm font-bold">{fmt((product.promoPrice || product.price) * quantity)}</p>
                  </div>
                );
              })}
            </div>

            <div className="rounded-xl bg-secondary/50 p-4 space-y-2 text-sm">
              <div className="flex justify-between"><span>Subtotal</span><span className="font-medium">{fmt(total)}</span></div>
              <div className="flex justify-between"><span>Frete</span><span className="font-medium">{shippingTotal > 0 ? fmt(shippingTotal) : 'Grátis'}</span></div>
              <div className="flex justify-between"><span>Pagamento</span><span className="font-medium">{payment === 'pix' ? 'Pix' : 'Cartão de Crédito'}</span></div>
              <div className="flex justify-between border-t pt-2 text-base font-bold"><span>Total</span><span className="text-primary">{fmt(grandTotal)}</span></div>
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
