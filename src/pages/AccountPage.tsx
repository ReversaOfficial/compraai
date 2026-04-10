import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MarketplaceLayout from '@/components/marketplace/MarketplaceLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth, CustomerProfile } from '@/contexts/AuthContext';
import { Badge } from '@/components/ui/badge';
import { User, MapPin, LogOut, ShoppingBag, DollarSign, Package } from 'lucide-react';

const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const statusLabel: Record<string, string> = {
  pending: 'Aguardando', paid: 'Pago', preparing: 'Em separação', ready: 'Pronto', shipped: 'Em entrega', delivered: 'Entregue', cancelled: 'Cancelado',
};
const statusColor: Record<string, string> = {
  pending: 'bg-warning/10 text-warning', paid: 'bg-info/10 text-info', preparing: 'bg-primary/10 text-primary',
  ready: 'bg-primary/10 text-primary', shipped: 'bg-info/10 text-info', delivered: 'bg-success/10 text-success', cancelled: 'bg-destructive/10 text-destructive',
};

// Pedidos por usuário — armazenados no localStorage
const ORDERS_KEY = 'compraai_orders';

export interface UserOrder {
  id: string;
  userId: string;
  items: { name: string; image: string; storeName: string; price: number; quantity: number }[];
  total: number;
  status: 'pending' | 'paid' | 'preparing' | 'ready' | 'shipped' | 'delivered' | 'cancelled';
  paymentMethod: 'pix' | 'credit_card';
  deliveryMethod: 'delivery' | 'pickup';
  createdAt: string;
}

export const getUserOrders = (userId: string): UserOrder[] => {
  try {
    const raw = localStorage.getItem(ORDERS_KEY);
    const all: UserOrder[] = raw ? JSON.parse(raw) : [];
    return all.filter(o => o.userId === userId);
  } catch { return []; }
};

export const addUserOrder = (order: UserOrder) => {
  try {
    const raw = localStorage.getItem(ORDERS_KEY);
    const all: UserOrder[] = raw ? JSON.parse(raw) : [];
    all.push(order);
    localStorage.setItem(ORDERS_KEY, JSON.stringify(all));
  } catch {}
};

const AccountPage = () => {
  const { user, loading, signOut, updateProfile, isCustomer } = useAuth();
  const navigate = useNavigate();
  const profile = user as CustomerProfile | null;

  const [form, setForm] = useState({
    full_name: '', phone: '', cpf: '',
    address_street: '', address_number: '', address_complement: '',
    address_neighborhood: '', address_city: '', address_state: '', address_zip: '',
  });

  useEffect(() => {
    if (!loading && !user) navigate('/login');
    if (!loading && user && user.role !== 'customer') navigate('/lojista');
  }, [loading, user]);

  useEffect(() => {
    if (profile) {
      setForm({
        full_name: profile.full_name || '',
        phone: profile.phone || '',
        cpf: profile.cpf || '',
        address_street: profile.address_street || '',
        address_number: profile.address_number || '',
        address_complement: profile.address_complement || '',
        address_neighborhood: profile.address_neighborhood || '',
        address_city: profile.address_city || '',
        address_state: profile.address_state || '',
        address_zip: profile.address_zip || '',
      });
    }
  }, [profile]);

  const handleSave = () => {
    updateProfile(form);
  };

  const handleLogout = () => {
    signOut();
    navigate('/');
  };

  if (loading) return <MarketplaceLayout><div className="container py-16 text-center text-muted-foreground">Carregando...</div></MarketplaceLayout>;
  if (!user || !isCustomer) return null;

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) => setForm(f => ({ ...f, [k]: e.target.value }));

  // Pedidos reais do usuário (novos usuários = 0 pedidos)
  const userOrders = getUserOrders(user.id);
  const totalOrders = userOrders.length;
  const totalSpent = userOrders.reduce((acc, o) => acc + o.total, 0);
  const deliveredOrders = userOrders.filter(o => o.status === 'delivered').length;

  return (
    <MarketplaceLayout>
      <div className="container py-8 max-w-3xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Minha Conta</h1>
            <p className="text-sm text-muted-foreground">Olá, {profile?.full_name || 'Cliente'}! 👋</p>
          </div>
          <Button variant="outline" size="sm" className="rounded-full gap-2" onClick={handleLogout}>
            <LogOut className="h-4 w-4" /> Sair
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <Card className="shadow-card">
            <CardContent className="p-4 text-center">
              <div className="flex justify-center mb-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <ShoppingBag className="h-5 w-5 text-primary" />
                </div>
              </div>
              <p className="text-2xl font-bold">{totalOrders}</p>
              <p className="text-xs text-muted-foreground">Pedidos</p>
            </CardContent>
          </Card>
          <Card className="shadow-card">
            <CardContent className="p-4 text-center">
              <div className="flex justify-center mb-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
                  <DollarSign className="h-5 w-5 text-accent" />
                </div>
              </div>
              <p className="text-2xl font-bold">{fmt(totalSpent)}</p>
              <p className="text-xs text-muted-foreground">Total Gasto</p>
            </CardContent>
          </Card>
          <Card className="shadow-card">
            <CardContent className="p-4 text-center">
              <div className="flex justify-center mb-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
                  <Package className="h-5 w-5 text-success" />
                </div>
              </div>
              <p className="text-2xl font-bold">{deliveredOrders}</p>
              <p className="text-xs text-muted-foreground">Entregues</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="orders">
          <TabsList className="w-full mb-6">
            <TabsTrigger value="orders" className="flex-1 gap-2"><ShoppingBag className="h-4 w-4" /> Pedidos</TabsTrigger>
            <TabsTrigger value="profile" className="flex-1 gap-2"><User className="h-4 w-4" /> Dados</TabsTrigger>
            <TabsTrigger value="address" className="flex-1 gap-2"><MapPin className="h-4 w-4" /> Endereço</TabsTrigger>
          </TabsList>

          <TabsContent value="orders">
            <Card className="shadow-card">
              <CardHeader><CardTitle className="text-lg">Meus Pedidos</CardTitle></CardHeader>
              <CardContent>
                {userOrders.length === 0 ? (
                  <div className="text-center py-12">
                    <ShoppingBag className="h-12 w-12 mx-auto mb-4 text-muted-foreground/30" />
                    <p className="text-muted-foreground font-medium mb-1">Nenhum pedido ainda</p>
                    <p className="text-sm text-muted-foreground mb-4">Quando você fizer sua primeira compra, ela aparecerá aqui.</p>
                    <Button variant="outline" className="rounded-full" onClick={() => navigate('/produtos')}>
                      Explorar Produtos
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {userOrders.map(o => (
                      <div key={o.id} className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/30 transition-colors">
                        <div>
                          <p className="font-medium text-sm">{o.id}</p>
                          <p className="text-xs text-muted-foreground">{o.createdAt} · {o.items.length} {o.items.length === 1 ? 'item' : 'itens'}</p>
                          <div className="flex gap-1 mt-1">
                            {o.items.map((item, i) => (
                              <img key={i} src={item.image} alt="" className="h-6 w-6 rounded object-cover" />
                            ))}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-semibold text-sm">{fmt(o.total)}</span>
                          <Badge className={`border-0 text-xs ${statusColor[o.status]}`}>{statusLabel[o.status]}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="profile">
            <Card className="shadow-card">
              <CardHeader><CardTitle className="text-lg">Dados Pessoais</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Nome completo</Label>
                  <Input value={form.full_name} onChange={set('full_name')} />
                </div>
                <div className="space-y-2">
                  <Label>E-mail</Label>
                  <Input value={user.email || ''} disabled className="bg-muted" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Telefone</Label>
                    <Input value={form.phone} onChange={set('phone')} placeholder="(11) 99999-0000" />
                  </div>
                  <div className="space-y-2">
                    <Label>CPF</Label>
                    <Input value={form.cpf} onChange={set('cpf')} placeholder="000.000.000-00" />
                  </div>
                </div>
                <Button className="rounded-full" onClick={handleSave}>Salvar Dados</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="address">
            <Card className="shadow-card">
              <CardHeader><CardTitle className="text-lg">Endereço de Entrega</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-2 space-y-2">
                    <Label>Rua</Label>
                    <Input value={form.address_street} onChange={set('address_street')} />
                  </div>
                  <div className="space-y-2">
                    <Label>Número</Label>
                    <Input value={form.address_number} onChange={set('address_number')} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Complemento</Label>
                    <Input value={form.address_complement} onChange={set('address_complement')} />
                  </div>
                  <div className="space-y-2">
                    <Label>Bairro</Label>
                    <Input value={form.address_neighborhood} onChange={set('address_neighborhood')} />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-1 space-y-2">
                    <Label>CEP</Label>
                    <Input value={form.address_zip} onChange={set('address_zip')} placeholder="00000-000" />
                  </div>
                  <div className="space-y-2">
                    <Label>Cidade</Label>
                    <Input value={form.address_city} onChange={set('address_city')} />
                  </div>
                  <div className="space-y-2">
                    <Label>Estado</Label>
                    <Input value={form.address_state} onChange={set('address_state')} placeholder="SP" />
                  </div>
                </div>
                <Button className="rounded-full" onClick={handleSave}>Salvar Endereço</Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MarketplaceLayout>
  );
};

export default AccountPage;
