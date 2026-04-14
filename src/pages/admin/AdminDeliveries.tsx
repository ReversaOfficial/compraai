import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Package, Truck, Clock, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';

const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const statusMap: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: any }> = {
  waiting: { label: 'Aguardando', variant: 'outline', icon: Clock },
  accepted: { label: 'Aceita', variant: 'default', icon: CheckCircle2 },
  pickup: { label: 'Em Coleta', variant: 'secondary', icon: Package },
  in_route: { label: 'Em Rota', variant: 'default', icon: Truck },
  delivered: { label: 'Entregue', variant: 'default', icon: CheckCircle2 },
  cancelled: { label: 'Cancelada', variant: 'destructive', icon: XCircle },
};

const AdminDeliveries = () => {
  const [deliveries, setDeliveries] = useState<any[]>([]);
  const [couriers, setCouriers] = useState<any[]>([]);
  const [filter, setFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');

  const load = async () => {
    const { data: d } = await supabase.from('delivery_orders').select('*').order('created_at', { ascending: false });
    setDeliveries(d || []);
    const { data: c } = await supabase.from('couriers').select('id, name');
    setCouriers(c || []);
  };

  useEffect(() => { load(); }, []);

  const getCourierName = (id: string | null) => couriers.find(c => c.id === id)?.name || '—';

  const filtered = deliveries.filter(d => {
    if (filter !== 'all' && d.status !== filter) return false;
    if (dateFilter && !d.created_at.startsWith(dateFilter)) return false;
    return true;
  });

  const updateStatus = async (id: string, status: string) => {
    const updates: any = { status };
    if (status === 'delivered') updates.delivered_at = new Date().toISOString();
    if (status === 'cancelled') updates.cancelled_at = new Date().toISOString();
    await supabase.from('delivery_orders').update(updates).eq('id', id);
    toast.success('Status atualizado');
    load();
  };

  const stats = {
    total: deliveries.length,
    waiting: deliveries.filter(d => d.status === 'waiting').length,
    active: deliveries.filter(d => ['accepted', 'pickup', 'in_route'].includes(d.status)).length,
    delivered: deliveries.filter(d => d.status === 'delivered').length,
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Controle de Entregas</h1>
          <p className="text-sm text-muted-foreground">Gerencie todas as entregas da plataforma</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-4">
          <Card><CardContent className="pt-6 text-center"><p className="text-3xl font-bold">{stats.total}</p><p className="text-sm text-muted-foreground">Total</p></CardContent></Card>
          <Card><CardContent className="pt-6 text-center"><p className="text-3xl font-bold text-yellow-500">{stats.waiting}</p><p className="text-sm text-muted-foreground">Aguardando</p></CardContent></Card>
          <Card><CardContent className="pt-6 text-center"><p className="text-3xl font-bold text-primary">{stats.active}</p><p className="text-sm text-muted-foreground">Em Andamento</p></CardContent></Card>
          <Card><CardContent className="pt-6 text-center"><p className="text-3xl font-bold text-green-500">{stats.delivered}</p><p className="text-sm text-muted-foreground">Entregues</p></CardContent></Card>
        </div>

        {stats.waiting > 0 && (
          <div className="rounded-lg bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-800 p-3 flex items-center gap-2 text-sm text-yellow-700 dark:text-yellow-300">
            <AlertTriangle className="h-4 w-4" />
            {stats.waiting} entrega(s) aguardando aceite de freteiro
          </div>
        )}

        <div className="flex gap-3 flex-wrap">
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="waiting">Aguardando</SelectItem>
              <SelectItem value="accepted">Aceita</SelectItem>
              <SelectItem value="pickup">Em Coleta</SelectItem>
              <SelectItem value="in_route">Em Rota</SelectItem>
              <SelectItem value="delivered">Entregue</SelectItem>
              <SelectItem value="cancelled">Cancelada</SelectItem>
            </SelectContent>
          </Select>
          <Input type="date" value={dateFilter} onChange={e => setDateFilter(e.target.value)} className="w-[180px]" />
        </div>

        <Card>
          <CardContent className="p-0 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Destino</TableHead>
                  <TableHead>Freteiro</TableHead>
                  <TableHead>Frete</TableHead>
                  <TableHead>Taxa</TableHead>
                  <TableHead>Líquido</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(d => {
                  const st = statusMap[d.status] || statusMap.waiting;
                  return (
                    <TableRow key={d.id}>
                      <TableCell className="text-xs">{new Date(d.created_at).toLocaleDateString('pt-BR')}</TableCell>
                      <TableCell><span className="text-xs">{d.neighborhood}, {d.city}</span></TableCell>
                      <TableCell className="font-medium">{getCourierName(d.courier_id)}</TableCell>
                      <TableCell>{fmt(d.freight_value)}</TableCell>
                      <TableCell className="text-xs">{fmt(d.platform_fee_amount)}</TableCell>
                      <TableCell className="font-medium text-primary">{fmt(d.courier_net_amount)}</TableCell>
                      <TableCell><Badge variant={st.variant}>{st.label}</Badge></TableCell>
                      <TableCell className="text-right">
                        {d.status === 'waiting' && <Button size="sm" variant="outline" onClick={() => updateStatus(d.id, 'cancelled')}>Cancelar</Button>}
                        {d.status === 'in_route' && <Button size="sm" onClick={() => updateStatus(d.id, 'delivered')}>Marcar Entregue</Button>}
                      </TableCell>
                    </TableRow>
                  );
                })}
                {filtered.length === 0 && (
                  <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">Nenhuma entrega encontrada</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminDeliveries;
