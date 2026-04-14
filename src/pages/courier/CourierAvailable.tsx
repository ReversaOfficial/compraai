import { useState, useEffect } from 'react';
import CourierLayout from '@/components/courier/CourierLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { MapPin, DollarSign, Clock, Package, Truck, CheckCircle2, TrendingUp, Star } from 'lucide-react';

const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const CourierAvailable = () => {
  const [deliveries, setDeliveries] = useState<any[]>([]);
  const [myDeliveries, setMyDeliveries] = useState<any[]>([]);
  const [courierId, setCourierId] = useState<string | null>(null);
  const [courier, setCourier] = useState<any>(null);
  const [accepting, setAccepting] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: c } = await supabase.from('couriers').select('*').eq('user_id', user.id).maybeSingle();
      if (c) {
        setCourierId(c.id);
        setCourier(c);
        loadData(c.id);
      }
    })();
  }, []);

  const loadData = async (cId: string) => {
    const { data: available } = await supabase.from('delivery_orders').select('*').eq('status', 'waiting').order('created_at', { ascending: false });
    setDeliveries(available || []);
    const { data: mine } = await supabase.from('delivery_orders').select('*').eq('courier_id', cId).in('status', ['accepted', 'pickup', 'in_route']).order('created_at', { ascending: false });
    setMyDeliveries(mine || []);
  };

  const acceptDelivery = async (id: string) => {
    if (!courierId) return;
    setAccepting(id);
    const { error } = await supabase.from('delivery_orders').update({
      courier_id: courierId, status: 'accepted', accepted_at: new Date().toISOString(),
    }).eq('id', id).eq('status', 'waiting');
    if (error) toast.error('Não foi possível aceitar.');
    else {
      toast.success('Entrega aceita!');
      await supabase.from('couriers').update({ operational_status: 'in_delivery' }).eq('id', courierId);
    }
    setAccepting(null);
    loadData(courierId);
  };

  const updateStatus = async (id: string, status: string) => {
    const updates: any = { status };
    if (status === 'pickup') updates.picked_up_at = new Date().toISOString();
    if (status === 'in_route') updates.in_route_at = new Date().toISOString();
    if (status === 'delivered') {
      updates.delivered_at = new Date().toISOString();
      if (courierId) await supabase.from('couriers').update({ operational_status: 'available' }).eq('id', courierId);
    }
    await supabase.from('delivery_orders').update(updates).eq('id', id);
    toast.success('Status atualizado!');
    if (courierId) loadData(courierId);
  };

  // Stats
  const [stats, setStats] = useState({ total: 0, totalEarned: 0, todayCount: 0, todayEarned: 0 });
  useEffect(() => {
    if (!courierId) return;
    (async () => {
      const { data: all } = await supabase.from('delivery_orders').select('courier_net_amount, delivered_at').eq('courier_id', courierId).eq('status', 'delivered');
      if (!all) return;
      const today = new Date().toDateString();
      const todayItems = all.filter(d => d.delivered_at && new Date(d.delivered_at).toDateString() === today);
      setStats({
        total: all.length,
        totalEarned: all.reduce((s, d) => s + Number(d.courier_net_amount), 0),
        todayCount: todayItems.length,
        todayEarned: todayItems.reduce((s, d) => s + Number(d.courier_net_amount), 0),
      });
    })();
  }, [courierId, myDeliveries]);

  if (courier && courier.registration_status === 'pending') {
    return (
      <CourierLayout>
        <div className="text-center py-16 space-y-4">
          <Clock className="h-16 w-16 mx-auto text-yellow-500" />
          <h2 className="text-2xl font-bold">Cadastro em Análise</h2>
          <p className="text-muted-foreground max-w-md mx-auto">Seu cadastro está sendo analisado pelo administrador. Você receberá uma notificação quando for aprovado.</p>
          <Badge variant="outline" className="text-yellow-600">Pendente de Aprovação</Badge>
        </div>
      </CourierLayout>
    );
  }

  if (courier && courier.registration_status === 'rejected') {
    return (
      <CourierLayout>
        <div className="text-center py-16 space-y-4">
          <Package className="h-16 w-16 mx-auto text-destructive" />
          <h2 className="text-2xl font-bold">Cadastro Recusado</h2>
          <p className="text-muted-foreground">Entre em contato com o suporte para mais informações.</p>
        </div>
      </CourierLayout>
    );
  }

  return (
    <CourierLayout>
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          <Card><CardContent className="pt-6 flex items-center gap-3">
            <div className="rounded-full bg-primary/10 p-2"><Package className="h-5 w-5 text-primary" /></div>
            <div><p className="text-2xl font-bold">{stats.total}</p><p className="text-xs text-muted-foreground">Entregas Feitas</p></div>
          </CardContent></Card>
          <Card><CardContent className="pt-6 flex items-center gap-3">
            <div className="rounded-full bg-green-100 dark:bg-green-900/30 p-2"><DollarSign className="h-5 w-5 text-green-600" /></div>
            <div><p className="text-2xl font-bold">{fmt(stats.totalEarned)}</p><p className="text-xs text-muted-foreground">Total Ganho</p></div>
          </CardContent></Card>
          <Card><CardContent className="pt-6 flex items-center gap-3">
            <div className="rounded-full bg-blue-100 dark:bg-blue-900/30 p-2"><TrendingUp className="h-5 w-5 text-blue-600" /></div>
            <div><p className="text-2xl font-bold">{stats.todayCount}</p><p className="text-xs text-muted-foreground">Hoje</p></div>
          </CardContent></Card>
          <Card><CardContent className="pt-6 flex items-center gap-3">
            <div className="rounded-full bg-purple-100 dark:bg-purple-900/30 p-2"><Star className="h-5 w-5 text-purple-600" /></div>
            <div><p className="text-2xl font-bold">{fmt(stats.todayEarned)}</p><p className="text-xs text-muted-foreground">Ganho Hoje</p></div>
          </CardContent></Card>
        </div>

        {/* Active deliveries */}
        {myDeliveries.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-lg font-semibold flex items-center gap-2"><Truck className="h-5 w-5" /> Em Andamento ({myDeliveries.length})</h2>
            {myDeliveries.map(d => (
              <Card key={d.id} className="border-l-4 border-l-yellow-500">
                <CardContent className="p-4 flex flex-col sm:flex-row justify-between gap-3">
                  <div className="space-y-1">
                    <Badge variant="secondary">{d.status === 'accepted' ? 'Aceita' : d.status === 'pickup' ? 'Em Coleta' : 'Em Rota'}</Badge>
                    <div className="flex items-center gap-1 text-sm"><MapPin className="h-3 w-3 text-green-500" /> {d.pickup_address || 'Loja'}</div>
                    <div className="flex items-center gap-1 text-sm"><MapPin className="h-3 w-3 text-red-500" /> {d.delivery_address || `${d.neighborhood}, ${d.city}`}</div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className="text-lg font-bold text-green-600">{fmt(d.courier_net_amount)}</span>
                    {d.status === 'accepted' && <Button size="sm" onClick={() => updateStatus(d.id, 'pickup')}>Iniciar Coleta</Button>}
                    {d.status === 'pickup' && <Button size="sm" onClick={() => updateStatus(d.id, 'in_route')}>Saí p/ Entrega</Button>}
                    {d.status === 'in_route' && <Button size="sm" onClick={() => updateStatus(d.id, 'delivered')}>Entreguei ✓</Button>}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Available deliveries */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold flex items-center gap-2"><Package className="h-5 w-5" /> Entregas Disponíveis</h2>
          {deliveries.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Package className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-lg font-medium">Nenhuma entrega disponível</p>
                <p className="text-sm text-muted-foreground">Novas entregas aparecerão aqui automaticamente</p>
              </CardContent>
            </Card>
          ) : (
            deliveries.map(d => (
              <Card key={d.id} className="border-l-4 border-l-primary">
                <CardContent className="p-4 flex flex-col sm:flex-row justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline"><Clock className="h-3 w-3 mr-1" />Aguardando</Badge>
                      <span className="text-xs text-muted-foreground">{new Date(d.created_at).toLocaleString('pt-BR')}</span>
                    </div>
                    <div className="flex items-start gap-2"><MapPin className="h-4 w-4 text-green-500 mt-0.5 shrink-0" /><div><p className="text-xs text-muted-foreground">Coleta</p><p className="text-sm font-medium">{d.pickup_address || 'Loja'}</p></div></div>
                    <div className="flex items-start gap-2"><MapPin className="h-4 w-4 text-red-500 mt-0.5 shrink-0" /><div><p className="text-xs text-muted-foreground">Entrega</p><p className="text-sm font-medium">{d.delivery_address || `${d.neighborhood}, ${d.city}`}</p></div></div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <div className="flex items-center gap-1"><DollarSign className="h-5 w-5 text-green-600" /><span className="text-2xl font-bold text-green-600">{fmt(d.courier_net_amount)}</span></div>
                    <p className="text-xs text-muted-foreground">Você recebe</p>
                    <Button onClick={() => acceptDelivery(d.id)} disabled={accepting === d.id}>
                      {accepting === d.id ? 'Aceitando...' : 'Aceitar Entrega'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </CourierLayout>
  );
};

export default CourierAvailable;
