import { useState, useEffect, useMemo } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { DollarSign, TrendingUp, Truck, Users, BarChart3, CheckCircle2 } from 'lucide-react';

const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const AdminCourierFinancials = () => {
  const [deliveries, setDeliveries] = useState<any[]>([]);
  const [couriers, setCouriers] = useState<any[]>([]);
  const [payouts, setPayouts] = useState<any[]>([]);
  const [dateFilter, setDateFilter] = useState(new Date().toISOString().slice(0, 10));

  const load = async () => {
    const [{ data: d }, { data: c }, { data: p }] = await Promise.all([
      supabase.from('delivery_orders').select('*').order('created_at', { ascending: false }),
      supabase.from('couriers').select('*'),
      supabase.from('courier_payouts').select('*').order('payout_date', { ascending: false }),
    ]);
    setDeliveries(d || []);
    setCouriers(c || []);
    setPayouts(p || []);
  };

  useEffect(() => { load(); }, []);

  const getCourierName = (id: string) => couriers.find(c => c.id === id)?.name || '—';

  // KPIs
  const delivered = deliveries.filter(d => d.status === 'delivered');
  const totalFreight = delivered.reduce((s, d) => s + d.freight_value, 0);
  const totalPlatformFee = delivered.reduce((s, d) => s + d.platform_fee_amount, 0);
  const totalCourierNet = delivered.reduce((s, d) => s + d.courier_net_amount, 0);
  const avgTicket = delivered.length ? totalFreight / delivered.length : 0;

  // Per-courier summary
  const courierSummary = useMemo(() => {
    const map: Record<string, { deliveries: number; gross: number; fee: number; net: number; unpaid: number }> = {};
    delivered.forEach(d => {
      if (!d.courier_id) return;
      if (!map[d.courier_id]) map[d.courier_id] = { deliveries: 0, gross: 0, fee: 0, net: 0, unpaid: 0 };
      map[d.courier_id].deliveries++;
      map[d.courier_id].gross += d.freight_value;
      map[d.courier_id].fee += d.platform_fee_amount;
      map[d.courier_id].net += d.courier_net_amount;
      if (!d.paid_at) map[d.courier_id].unpaid += d.courier_net_amount;
    });
    return Object.entries(map).map(([id, v]) => ({ courier_id: id, ...v })).sort((a, b) => b.deliveries - a.deliveries);
  }, [delivered]);

  // Daily closing
  const dailyDeliveries = deliveries.filter(d => d.status === 'delivered' && d.delivered_at?.startsWith(dateFilter) && !d.paid_at);
  const dailyByCourier = useMemo(() => {
    const map: Record<string, any[]> = {};
    dailyDeliveries.forEach(d => { if (d.courier_id) (map[d.courier_id] = map[d.courier_id] || []).push(d); });
    return Object.entries(map);
  }, [dailyDeliveries]);

  const markPaid = async (courierId: string, ids: string[]) => {
    const now = new Date().toISOString();
    await supabase.from('delivery_orders').update({ paid_at: now }).in('id', ids);
    const gross = dailyDeliveries.filter(d => ids.includes(d.id)).reduce((s, d) => s + d.freight_value, 0);
    const fee = dailyDeliveries.filter(d => ids.includes(d.id)).reduce((s, d) => s + d.platform_fee_amount, 0);
    await supabase.from('courier_payouts').insert({
      courier_id: courierId, payout_date: dateFilter, total_deliveries: ids.length,
      gross_amount: gross, platform_fee_total: fee, net_amount: gross - fee, status: 'paid', paid_at: now,
    });
    toast.success('Marcado como pago');
    load();
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Financeiro de Freteiros</h1>
          <p className="text-sm text-muted-foreground">Controle financeiro, fechamento e relatórios</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <Card><CardContent className="pt-6 text-center"><Truck className="h-5 w-5 mx-auto mb-1 text-muted-foreground" /><p className="text-2xl font-bold">{delivered.length}</p><p className="text-xs text-muted-foreground">Entregas</p></CardContent></Card>
          <Card><CardContent className="pt-6 text-center"><DollarSign className="h-5 w-5 mx-auto mb-1 text-muted-foreground" /><p className="text-2xl font-bold">{fmt(totalFreight)}</p><p className="text-xs text-muted-foreground">Faturamento</p></CardContent></Card>
          <Card><CardContent className="pt-6 text-center"><TrendingUp className="h-5 w-5 mx-auto mb-1 text-primary" /><p className="text-2xl font-bold text-primary">{fmt(totalPlatformFee)}</p><p className="text-xs text-muted-foreground">Ganho Plataforma</p></CardContent></Card>
          <Card><CardContent className="pt-6 text-center"><Users className="h-5 w-5 mx-auto mb-1 text-muted-foreground" /><p className="text-2xl font-bold">{fmt(totalCourierNet)}</p><p className="text-xs text-muted-foreground">Pago Freteiros</p></CardContent></Card>
          <Card><CardContent className="pt-6 text-center"><BarChart3 className="h-5 w-5 mx-auto mb-1 text-muted-foreground" /><p className="text-2xl font-bold">{fmt(avgTicket)}</p><p className="text-xs text-muted-foreground">Ticket Médio</p></CardContent></Card>
        </div>

        <Tabs defaultValue="summary">
          <TabsList>
            <TabsTrigger value="summary">Resumo por Freteiro</TabsTrigger>
            <TabsTrigger value="closing">Fechamento Diário</TabsTrigger>
            <TabsTrigger value="history">Histórico de Pagamentos</TabsTrigger>
          </TabsList>

          <TabsContent value="summary">
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Freteiro</TableHead>
                      <TableHead>Entregas</TableHead>
                      <TableHead>Bruto</TableHead>
                      <TableHead>Taxa Plataforma</TableHead>
                      <TableHead>Líquido</TableHead>
                      <TableHead>A Pagar</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {courierSummary.map(s => (
                      <TableRow key={s.courier_id}>
                        <TableCell className="font-medium">{getCourierName(s.courier_id)}</TableCell>
                        <TableCell>{s.deliveries}</TableCell>
                        <TableCell>{fmt(s.gross)}</TableCell>
                        <TableCell>{fmt(s.fee)}</TableCell>
                        <TableCell className="font-medium text-primary">{fmt(s.net)}</TableCell>
                        <TableCell>{s.unpaid > 0 ? <Badge variant="destructive">{fmt(s.unpaid)}</Badge> : <Badge variant="default">Pago</Badge>}</TableCell>
                      </TableRow>
                    ))}
                    {courierSummary.length === 0 && (
                      <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Sem dados</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="closing">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Input type="date" value={dateFilter} onChange={e => setDateFilter(e.target.value)} className="w-[200px]" />
                <span className="text-sm text-muted-foreground">{dailyDeliveries.length} entrega(s) pendente(s)</span>
              </div>
              {dailyByCourier.map(([cid, dels]) => (
                <Card key={cid}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center justify-between">
                      <span>{getCourierName(cid)}</span>
                      <Button size="sm" onClick={() => markPaid(cid, dels.map(d => d.id))}>
                        <CheckCircle2 className="h-4 w-4 mr-1" />Marcar como Pago
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-4 gap-4 text-sm">
                      <div><p className="text-muted-foreground">Entregas</p><p className="font-bold">{dels.length}</p></div>
                      <div><p className="text-muted-foreground">Bruto</p><p className="font-bold">{fmt(dels.reduce((s, d) => s + d.freight_value, 0))}</p></div>
                      <div><p className="text-muted-foreground">Taxa</p><p className="font-bold">{fmt(dels.reduce((s, d) => s + d.platform_fee_amount, 0))}</p></div>
                      <div><p className="text-muted-foreground">A Pagar</p><p className="font-bold text-primary">{fmt(dels.reduce((s, d) => s + d.courier_net_amount, 0))}</p></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {dailyByCourier.length === 0 && <p className="text-center text-muted-foreground py-8">Nenhuma entrega pendente para esta data</p>}
            </div>
          </TabsContent>

          <TabsContent value="history">
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Freteiro</TableHead>
                      <TableHead>Entregas</TableHead>
                      <TableHead>Bruto</TableHead>
                      <TableHead>Taxa</TableHead>
                      <TableHead>Pago</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payouts.map(p => (
                      <TableRow key={p.id}>
                        <TableCell>{new Date(p.payout_date).toLocaleDateString('pt-BR')}</TableCell>
                        <TableCell className="font-medium">{getCourierName(p.courier_id)}</TableCell>
                        <TableCell>{p.total_deliveries}</TableCell>
                        <TableCell>{fmt(p.gross_amount)}</TableCell>
                        <TableCell>{fmt(p.platform_fee_total)}</TableCell>
                        <TableCell className="font-medium text-primary">{fmt(p.net_amount)}</TableCell>
                        <TableCell><Badge variant={p.status === 'paid' ? 'default' : 'secondary'}>{p.status === 'paid' ? 'Pago' : 'Pendente'}</Badge></TableCell>
                      </TableRow>
                    ))}
                    {payouts.length === 0 && (
                      <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">Nenhum pagamento registrado</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default AdminCourierFinancials;
