import { useState, useEffect } from 'react';
import CourierLayout from '@/components/courier/CourierLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { DollarSign, TrendingUp, Package, Wallet } from 'lucide-react';

const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const CourierEarnings = () => {
  const [deliveries, setDeliveries] = useState<any[]>([]);
  const [payouts, setPayouts] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: courier } = await supabase.from('couriers').select('id').eq('user_id', user.id).maybeSingle();
      if (!courier) return;

      const { data: d } = await supabase.from('delivery_orders').select('*').eq('courier_id', courier.id).eq('status', 'delivered').order('delivered_at', { ascending: false });
      setDeliveries(d || []);

      const { data: p } = await supabase.from('courier_payouts').select('*').eq('courier_id', courier.id).order('payout_date', { ascending: false });
      setPayouts(p || []);
    })();
  }, []);

  const totalEarned = deliveries.reduce((s, d) => s + Number(d.courier_net_amount), 0);
  const totalPaid = payouts.filter(p => p.status === 'paid').reduce((s, p) => s + Number(p.net_amount), 0);
  const pending = totalEarned - totalPaid;
  const todayDeliveries = deliveries.filter(d => d.delivered_at && new Date(d.delivered_at).toDateString() === new Date().toDateString());
  const todayEarned = todayDeliveries.reduce((s, d) => s + Number(d.courier_net_amount), 0);

  return (
    <CourierLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Meus Ganhos</h1>
          <p className="text-sm text-muted-foreground">Resumo financeiro das suas entregas</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card><CardContent className="pt-6 flex items-center gap-3">
            <div className="rounded-full bg-green-100 dark:bg-green-900/30 p-2"><DollarSign className="h-5 w-5 text-green-600" /></div>
            <div><p className="text-2xl font-bold">{fmt(totalEarned)}</p><p className="text-xs text-muted-foreground">Total Ganho</p></div>
          </CardContent></Card>
          <Card><CardContent className="pt-6 flex items-center gap-3">
            <div className="rounded-full bg-blue-100 dark:bg-blue-900/30 p-2"><Wallet className="h-5 w-5 text-blue-600" /></div>
            <div><p className="text-2xl font-bold">{fmt(pending)}</p><p className="text-xs text-muted-foreground">A Receber</p></div>
          </CardContent></Card>
          <Card><CardContent className="pt-6 flex items-center gap-3">
            <div className="rounded-full bg-purple-100 dark:bg-purple-900/30 p-2"><TrendingUp className="h-5 w-5 text-purple-600" /></div>
            <div><p className="text-2xl font-bold">{fmt(todayEarned)}</p><p className="text-xs text-muted-foreground">Ganho Hoje</p></div>
          </CardContent></Card>
          <Card><CardContent className="pt-6 flex items-center gap-3">
            <div className="rounded-full bg-orange-100 dark:bg-orange-900/30 p-2"><Package className="h-5 w-5 text-orange-600" /></div>
            <div><p className="text-2xl font-bold">{deliveries.length}</p><p className="text-xs text-muted-foreground">Entregas Realizadas</p></div>
          </CardContent></Card>
        </div>

        {/* Payouts */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">Pagamentos Recebidos</h2>
          <Card>
            <CardContent className="p-0 overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Entregas</TableHead>
                    <TableHead>Bruto</TableHead>
                    <TableHead>Taxa</TableHead>
                    <TableHead>Líquido</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payouts.map(p => (
                    <TableRow key={p.id}>
                      <TableCell className="text-xs">{new Date(p.payout_date).toLocaleDateString('pt-BR')}</TableCell>
                      <TableCell>{p.total_deliveries}</TableCell>
                      <TableCell>{fmt(p.gross_amount)}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{fmt(p.platform_fee_total)}</TableCell>
                      <TableCell className="font-medium text-green-600">{fmt(p.net_amount)}</TableCell>
                      <TableCell><Badge variant={p.status === 'paid' ? 'default' : 'outline'}>{p.status === 'paid' ? 'Pago' : 'Pendente'}</Badge></TableCell>
                    </TableRow>
                  ))}
                  {payouts.length === 0 && (
                    <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Nenhum pagamento registrado</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* Recent deliveries */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">Últimas Entregas</h2>
          <Card>
            <CardContent className="p-0 overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Destino</TableHead>
                    <TableHead>Frete</TableHead>
                    <TableHead>Seu Ganho</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {deliveries.slice(0, 20).map(d => (
                    <TableRow key={d.id}>
                      <TableCell className="text-xs">{d.delivered_at ? new Date(d.delivered_at).toLocaleDateString('pt-BR') : '—'}</TableCell>
                      <TableCell className="text-sm">{d.neighborhood}, {d.city}</TableCell>
                      <TableCell>{fmt(d.freight_value)}</TableCell>
                      <TableCell className="font-medium text-green-600">{fmt(d.courier_net_amount)}</TableCell>
                    </TableRow>
                  ))}
                  {deliveries.length === 0 && (
                    <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground">Nenhuma entrega concluída</TableCell></TableRow>
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

export default CourierEarnings;
