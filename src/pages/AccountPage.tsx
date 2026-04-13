import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import MarketplaceLayout from '@/components/marketplace/MarketplaceLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth, CustomerProfile } from '@/contexts/AuthContext';
import { Badge } from '@/components/ui/badge';
import { User, MapPin, LogOut, ShoppingBag, DollarSign, Package, Heart, Star, Bell, Search } from 'lucide-react';
import { useFavorites } from '@/hooks/useFavorites';
import { useNotifications } from '@/hooks/useNotifications';
import { products, stores } from '@/data/mock';
import { supabase } from '@/integrations/supabase/client';
import StarRating from '@/components/marketplace/StarRating';

const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const statusLabel: Record<string, string> = {
  pending: 'Aguardando', paid: 'Pago', preparing: 'Em separação', ready: 'Pronto', shipped: 'Em entrega', delivered: 'Entregue', cancelled: 'Cancelado',
};
const statusColor: Record<string, string> = {
  pending: 'bg-warning/10 text-warning', paid: 'bg-info/10 text-info', preparing: 'bg-primary/10 text-primary',
  ready: 'bg-primary/10 text-primary', shipped: 'bg-info/10 text-info', delivered: 'bg-success/10 text-success', cancelled: 'bg-destructive/10 text-destructive',
};

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
  const { productFavs, storeFavs, toggleProductFav, toggleStoreFav } = useFavorites();
  const { notifications, markAsRead } = useNotifications();
  const [recentSearches, setRecentSearches] = useState<{ id: string; query: string; created_at: string }[]>([]);
  const [myReviews, setMyReviews] = useState<any[]>([]);

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
        full_name: profile.full_name || '', phone: profile.phone || '', cpf: profile.cpf || '',
        address_street: profile.address_street || '', address_number: profile.address_number || '',
        address_complement: profile.address_complement || '', address_neighborhood: profile.address_neighborhood || '',
        address_city: profile.address_city || '', address_state: profile.address_state || '', address_zip: profile.address_zip || '',
      });
    }
  }, [profile]);

  useEffect(() => {
    if (!user) return;
    supabase.from('recent_searches').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(10)
      .then(({ data }) => setRecentSearches(data || []));
    supabase.from('product_reviews').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
      .then(({ data }) => setMyReviews((data || []).map(r => ({ ...r, comment: r.comment || '' }))));
  }, [user]);

  const clearSearch = async (id: string) => {
    await supabase.from('recent_searches').delete().eq('id', id);
    setRecentSearches(prev => prev.filter(s => s.id !== id));
  };

  const handleSave = () => { updateProfile(form); };
  const handleLogout = () => { signOut(); navigate('/'); };

  if (loading) return <MarketplaceLayout><div className="container py-16 text-center text-muted-foreground">Carregando...</div></MarketplaceLayout>;
  if (!user || !isCustomer) return null;

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) => setForm(f => ({ ...f, [k]: e.target.value }));
  const userOrders = getUserOrders(user.id);
  const totalOrders = userOrders.length;
  const totalSpent = userOrders.reduce((acc, o) => acc + o.total, 0);
  const deliveredOrders = userOrders.filter(o => o.status === 'delivered').length;

  const favProducts = products.filter(p => productFavs.includes(p.id));
  const favStores = stores.filter(s => storeFavs.includes(s.id));

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
              <div className="flex justify-center mb-2"><div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10"><ShoppingBag className="h-5 w-5 text-primary" /></div></div>
              <p className="text-2xl font-bold">{totalOrders}</p><p className="text-xs text-muted-foreground">Pedidos</p>
            </CardContent>
          </Card>
          <Card className="shadow-card">
            <CardContent className="p-4 text-center">
              <div className="flex justify-center mb-2"><div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10"><DollarSign className="h-5 w-5 text-accent" /></div></div>
              <p className="text-2xl font-bold">{fmt(totalSpent)}</p><p className="text-xs text-muted-foreground">Total Gasto</p>
            </CardContent>
          </Card>
          <Card className="shadow-card">
            <CardContent className="p-4 text-center">
              <div className="flex justify-center mb-2"><div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10"><Package className="h-5 w-5 text-success" /></div></div>
              <p className="text-2xl font-bold">{deliveredOrders}</p><p className="text-xs text-muted-foreground">Entregues</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="orders">
          <TabsList className="w-full mb-6 flex-wrap h-auto gap-1">
            <TabsTrigger value="orders" className="flex-1 gap-1"><ShoppingBag className="h-3.5 w-3.5" /> Pedidos</TabsTrigger>
            <TabsTrigger value="favorites" className="flex-1 gap-1"><Heart className="h-3.5 w-3.5" /> Favoritos</TabsTrigger>
            <TabsTrigger value="reviews" className="flex-1 gap-1"><Star className="h-3.5 w-3.5" /> Avaliações</TabsTrigger>
            <TabsTrigger value="notifications" className="flex-1 gap-1"><Bell className="h-3.5 w-3.5" /> Notificações</TabsTrigger>
            <TabsTrigger value="profile" className="flex-1 gap-1"><User className="h-3.5 w-3.5" /> Dados</TabsTrigger>
            <TabsTrigger value="address" className="flex-1 gap-1"><MapPin className="h-3.5 w-3.5" /> Endereço</TabsTrigger>
          </TabsList>

          <TabsContent value="orders">
            <Card className="shadow-card">
              <CardHeader><CardTitle className="text-lg">Meus Pedidos</CardTitle></CardHeader>
              <CardContent>
                {userOrders.length === 0 ? (
                  <div className="text-center py-12">
                    <ShoppingBag className="h-12 w-12 mx-auto mb-4 text-muted-foreground/30" />
                    <p className="text-muted-foreground font-medium mb-1">Nenhum pedido ainda</p>
                    <Button variant="outline" className="rounded-full" onClick={() => navigate('/produtos')}>Explorar Produtos</Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {userOrders.map(o => (
                      <div key={o.id} className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/30 transition-colors">
                        <div>
                          <p className="font-medium text-sm">{o.id}</p>
                          <p className="text-xs text-muted-foreground">{o.createdAt} · {o.items.length} {o.items.length === 1 ? 'item' : 'itens'}</p>
                          <div className="flex gap-1 mt-1">
                            {o.items.map((item, i) => <img key={i} src={item.image} alt="" className="h-6 w-6 rounded object-cover" />)}
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

          <TabsContent value="favorites">
            <Card className="shadow-card">
              <CardHeader><CardTitle className="text-lg">Produtos Favoritos ({favProducts.length})</CardTitle></CardHeader>
              <CardContent>
                {favProducts.length === 0 ? (
                  <p className="text-center py-8 text-muted-foreground">Nenhum produto favoritado</p>
                ) : (
                  <div className="space-y-3">
                    {favProducts.map(p => (
                      <div key={p.id} className="flex items-center gap-4 p-3 rounded-lg border">
                        <img src={p.image} alt={p.name} className="h-14 w-14 rounded object-cover shrink-0" />
                        <div className="flex-1 min-w-0">
                          <Link to={`/produto/${p.id}`} className="text-sm font-medium hover:text-primary">{p.name}</Link>
                          <p className="text-xs text-muted-foreground">{p.storeName}</p>
                        </div>
                        <p className="font-bold text-sm text-primary">{fmt(p.promoPrice || p.price)}</p>
                        <Button variant="ghost" size="icon" onClick={() => toggleProductFav(p.id)}>
                          <Heart className="h-4 w-4 fill-destructive text-destructive" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="shadow-card mt-4">
              <CardHeader><CardTitle className="text-lg">Lojas Favoritas ({favStores.length})</CardTitle></CardHeader>
              <CardContent>
                {favStores.length === 0 ? (
                  <p className="text-center py-8 text-muted-foreground">Nenhuma loja favoritada</p>
                ) : (
                  <div className="space-y-3">
                    {favStores.map(s => (
                      <div key={s.id} className="flex items-center gap-4 p-3 rounded-lg border">
                        <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center text-xl font-bold text-primary shrink-0">
                          {s.name.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <Link to={`/loja/${s.id}`} className="text-sm font-medium hover:text-primary">{s.name}</Link>
                          <p className="text-xs text-muted-foreground">{s.category} · ★ {s.rating}</p>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => toggleStoreFav(s.id)}>
                          <Heart className="h-4 w-4 fill-destructive text-destructive" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reviews">
            <Card className="shadow-card">
              <CardHeader><CardTitle className="text-lg">Minhas Avaliações ({myReviews.length})</CardTitle></CardHeader>
              <CardContent>
                {myReviews.length === 0 ? (
                  <p className="text-center py-8 text-muted-foreground">Nenhuma avaliação feita</p>
                ) : (
                  <div className="space-y-3">
                    {myReviews.map(r => (
                      <div key={r.id} className="p-4 rounded-lg border">
                        <div className="flex items-center gap-2 mb-1">
                          <StarRating rating={r.rating} size="sm" />
                          <span className="text-xs text-muted-foreground">{new Date(r.created_at).toLocaleDateString('pt-BR')}</span>
                        </div>
                        {r.comment && <p className="text-sm">{r.comment}</p>}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications">
            <Card className="shadow-card">
              <CardHeader><CardTitle className="text-lg">Notificações</CardTitle></CardHeader>
              <CardContent>
                {notifications.length === 0 ? (
                  <p className="text-center py-8 text-muted-foreground">Nenhuma notificação</p>
                ) : (
                  <div className="space-y-3">
                    {notifications.map(n => (
                      <div key={n.id} onClick={() => !n.is_read && markAsRead(n.id)}
                        className={`p-4 rounded-lg border cursor-pointer transition-colors ${!n.is_read ? 'bg-primary/5 border-primary/20' : 'hover:bg-muted/30'}`}>
                        <div className="flex items-start gap-3">
                          <div className="flex-1">
                            <p className={`text-sm ${!n.is_read ? 'font-semibold' : ''}`}>{n.title}</p>
                            {n.body && <p className="text-xs text-muted-foreground mt-0.5">{n.body}</p>}
                            <p className="text-[10px] text-muted-foreground mt-1">{new Date(n.created_at).toLocaleDateString('pt-BR')}</p>
                          </div>
                          {!n.is_read && <div className="h-2 w-2 rounded-full bg-primary shrink-0 mt-1" />}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent searches */}
            <Card className="shadow-card mt-4">
              <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Search className="h-5 w-5" /> Buscas Recentes</CardTitle></CardHeader>
              <CardContent>
                {recentSearches.length === 0 ? (
                  <p className="text-center py-4 text-muted-foreground text-sm">Nenhuma busca recente</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {recentSearches.map(s => (
                      <div key={s.id} className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-muted text-sm">
                        <Link to={`/busca?q=${encodeURIComponent(s.query)}`} className="hover:text-primary">{s.query}</Link>
                        <button onClick={() => clearSearch(s.id)} className="text-muted-foreground hover:text-destructive ml-1">×</button>
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
                <div className="space-y-2"><Label>Nome completo</Label><Input value={form.full_name} onChange={set('full_name')} /></div>
                <div className="space-y-2"><Label>E-mail</Label><Input value={user.email || ''} disabled className="bg-muted" /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2"><Label>Telefone</Label><Input value={form.phone} onChange={set('phone')} placeholder="(11) 99999-0000" /></div>
                  <div className="space-y-2"><Label>CPF</Label><Input value={form.cpf} onChange={set('cpf')} placeholder="000.000.000-00" /></div>
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
                  <div className="col-span-2 space-y-2"><Label>Rua</Label><Input value={form.address_street} onChange={set('address_street')} /></div>
                  <div className="space-y-2"><Label>Número</Label><Input value={form.address_number} onChange={set('address_number')} /></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2"><Label>Complemento</Label><Input value={form.address_complement} onChange={set('address_complement')} /></div>
                  <div className="space-y-2"><Label>Bairro</Label><Input value={form.address_neighborhood} onChange={set('address_neighborhood')} /></div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-1 space-y-2"><Label>CEP</Label><Input value={form.address_zip} onChange={set('address_zip')} placeholder="00000-000" /></div>
                  <div className="space-y-2"><Label>Cidade</Label><Input value={form.address_city} onChange={set('address_city')} /></div>
                  <div className="space-y-2"><Label>Estado</Label><Input value={form.address_state} onChange={set('address_state')} placeholder="SP" /></div>
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
