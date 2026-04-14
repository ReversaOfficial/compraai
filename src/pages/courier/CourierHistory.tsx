import { useState, useEffect } from 'react';
import CourierLayout from '@/components/courier/CourierLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Package, Truck, CheckCircle2, XCircle, Clock, MapPin } from 'lucide-react';

const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const statusMap: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: any }> = {
  waiting: { label: 'Aguardando', variant: 'outline', icon: Clock },
  accepted: { label: 'Aceita', variant: 'default', icon: CheckCircle2 },
  pickup: { label: 'Em Coleta', variant: 'secondary', icon: Package },
  in_route: { label: 'Em Rota', variant: 'default', icon: Truck },
  delivered: { label: 'Entregue', variant: 'default', icon: CheckCircle2 },
  cancelled: { label: 'Cancelada', variant: 'destructive', icon: XCircle },
};

const CourierHistory = () => {
  const [deliveries, setDeliveries] = useState<any[]>([]);
  const [courierId, setCourierId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: courier } = await supabase.from('couriers').select('id').eq('user_id', user.id).maybeSingle();
      if (courier) {
        setCourierId(courier.id);
        const { data } = await supabase.from('delivery_orders').select('*').eq('courier_id', courier.id).order('created_at', { ascending: false });
        setDeliveries(data || []);
      }
    })();
  }, []);

  const updateStatus = async (id: string, status: string) => {
    const updates: any = { status };
    if (status === 'pickup') updates.picked_up_at = new Date().toISOString();
    if (status === 'in_route') updates.in_route_at = new Date().toISOString();
    if (status === 'delivered') {
      updates.delivered_at = new Date().toISOString();
      if (courierId) {
        await supabase.from('couriers').update({ operational_status: 'available' }).eq('id', courierId);
      }
    }
    await supabase.from('delivery_orders').update(updates).eq('id', id);
    toast.success('Status atualizado!');
    // Reload
    if (courierId) {
      const { data } = await supabase.from('delivery_orders').select('*').eq('courier_id', courierId).order('created_at', { ascending: false });
      setDeliveries(data || []);
    }
  };

  const getNextAction = (status: string, id: string) => {
    switch (status) {
      case 'accepted': return <Button size="sm" onClick={() => updateStatus(id, 'pickup')}>Iniciar Coleta</Button>;
      case 'pickup': return <Button size="sm" onClick={() => updateStatus(id, 'in_route')}>Saí p/ Entrega</Button>;
      case 'in_route': return <Button size="sm" onClick={() => updateStatus(id, 'delivered')}>Entreguei</Button>;
      default: return null;
    }
  };

  const active = deliveries.filter(d => ['accepted', 'pickup', 'in_route'].includes(d.status));
  const past = deliveries.filter(d => ['delivered', 'cancelled'].includes(d.status));

  return (
    <CourierLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Minhas Entregas</h1>
          <p className="text-sm text-muted-foreground">Entregas ativas e histórico</p>
        </div>

        {active.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-lg font-semibold">Em Andamento ({active.length})</h2>
            {active.map(d => {
              const st = statusMap[d.status] || statusMap.accepted;
              return (
                <Card key={d.id} className="border-l-4 border-l-yellow-500">
                  <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row justify-between gap-3">
                      <div className="space-y-1">
                        <Badge variant={st.variant}>{st.label}</Badge>
                        <div className="flex items-center gap-1 text-sm"><MapPin className="h-3 w-3 text-green-500" /> {d.pickup_address || 'Loja'}</div>
                        <div className="flex items-center gap-1 text-sm"><MapPin className="h-3 w-3 text-red-500" /> {d.delivery_address || `${d.neighborhood}, ${d.city}`}</div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span className="text-lg font-bold text-green-600">{fmt(d.courier_net_amount)}</span>
                        {getNextAction(d.status, d.id)}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        <div className="space-y-3">
          <h2 className="text-lg font-semibold">Histórico</h2>
          <Card>
            <CardContent className="p-0 overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Destino</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {past.map(d => {
                    const st = statusMap[d.status] || statusMap.delivered;
                    return (
                      <TableRow key={d.id}>
                        <TableCell className="text-xs">{new Date(d.created_at).toLocaleDateString('pt-BR')}</TableCell>
                        <TableCell className="text-sm">{d.neighborhood}, {d.city}</TableCell>
                        <TableCell className="font-medium text-green-600">{fmt(d.courier_net_amount)}</TableCell>
                        <TableCell><Badge variant={st.variant}>{st.label}</Badge></TableCell>
                      </TableRow>
                    );
                  })}
                  {past.length === 0 && (
                    <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground">Nenhuma entrega no histórico</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </CourierLayout>
  );
};

export default CourierHistory;
