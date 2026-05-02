import { useEffect, useMemo, useState } from 'react';
import { DollarSign, ArrowUpRight, ArrowDownRight, Clock, Package, Receipt } from 'lucide-react';
import SellerLayout from '@/components/seller/SellerLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

const fmt = (v: number) => (v || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const fmtDate = (d?: string | null) =>
  d ? new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '—';

interface PaidOrderRow {
  order_id: string;
  order_number: string;
  paid_at: string | null;
  gross: number;
  fee: number;
  net: number;
  status: string;
}

interface PayoutRow {
  id: string;
  amount: number;
  status: string;
  created_at: string;
  completed_at: string | null;
  gateway_reference: string;
}

const statusLabel: Record<string, { label: string; cls: string }> = {
  paid: { label: 'Pago', cls: 'bg-success/10 text-success' },
  completed: { label: 'Concluído', cls: 'bg-success/10 text-success' },
  pending: { label: 'Pendente', cls: 'bg-warning/10 text-warning' },
  processing: { label: 'Processando', cls: 'bg-info/10 text-info' },
  failed: { label: 'Falhou', cls: 'bg-destructive/10 text-destructive' },
};

const StatusBadge = ({ status }: { status: string }) => {
  const s = statusLabel[status] ?? { label: status, cls: 'bg-muted text-foreground' };
  return <Badge className={`border-0 text-xs ${s.cls}`}>{s.label}</Badge>;
};

const SellerFinancials = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [storeId, setStoreId] = useState<string | null>(null);
  const [splits, setSplits] = useState<any[]>([]);
  const [orders, setOrders] = useState<Record<string, any>>({});
  const [payouts, setPayouts] = useState<PayoutRow[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!user) { setLoading(false); return; }
      try {
        // Find this seller's store
        const { data: store } = await supabase
          .from('stores')
          .select('id')
          .eq('owner_id', user.id)
          .maybeSingle();
        if (cancelled) return;
        if (!store) { setStoreId(null); setLoading(false); return; }
        setStoreId(store.id);

        // Fetch splits + payouts in parallel
        const [splitsRes, payoutsRes] = await Promise.all([
          supabase
            .from('payment_splits')
            .select('id, payment_id, order_id, gross_amount, platform_fee_amount, net_amount, status, created_at')
            .eq('store_id', store.id)
            .order('created_at', { ascending: false }),
          supabase
            .from('payouts')
            .select('id, amount, status, created_at, completed_at, gateway_reference')
            .eq('store_id', store.id)
            .order('created_at', { ascending: false }),
        ]);

        const splitRows = splitsRes.data ?? [];
        const orderIds = Array.from(new Set(splitRows.map(s => s.order_id).filter(Boolean)));
        let orderMap: Record<string, any> = {};
        if (orderIds.length) {
          const { data: ordersData } = await supabase
            .from('orders')
            .select('id, order_number, status, updated_at, created_at')
            .in('id', orderIds);
          orderMap = Object.fromEntries((ordersData ?? []).map(o => [o.id, o]));
        }

        if (cancelled) return;
        setSplits(splitRows);
        setOrders(orderMap);
        setPayouts(payoutsRes.data ?? []);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [user]);

  const paidOrders: PaidOrderRow[] = useMemo(() => {
    return splits
      .filter(s => s.status === 'paid' || s.status === 'completed')
      .map(s => {
        const o = orders[s.order_id];
        return {
          order_id: s.order_id,
          order_number: o?.order_number ?? s.order_id.slice(0, 8),
          paid_at: o?.updated_at ?? s.created_at,
          gross: Number(s.gross_amount) || 0,
          fee: Number(s.platform_fee_amount) || 0,
          net: Number(s.net_amount) || 0,
          status: s.status,
        };
      });
  }, [splits, orders]);

  const stats = useMemo(() => {
    const gross = paidOrders.reduce((a, b) => a + b.gross, 0);
    const fee = paidOrders.reduce((a, b) => a + b.fee, 0);
    const net = paidOrders.reduce((a, b) => a + b.net, 0);
    const pending = splits
      .filter(s => s.status === 'pending')
      .reduce((a, b) => a + (Number(b.net_amount) || 0), 0);
    return { gross, fee, net, pending };
  }, [paidOrders, splits]);

  return (
    <SellerLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Financeiro</h1>
          <p className="text-sm text-muted-foreground">
            Acompanhe seus pedidos pagos, valores recebidos e repasses da plataforma.
          </p>
        </div>

        {/* KPIs */}
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          <Card className="shadow-card">
            <CardContent className="p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 mb-3">
                <DollarSign className="h-5 w-5 text-primary" />
              </div>
              {loading ? <Skeleton className="h-7 w-24" /> : <p className="text-2xl font-bold">{fmt(stats.gross)}</p>}
              <p className="text-xs text-muted-foreground">Total Vendido (bruto)</p>
            </CardContent>
          </Card>
          <Card className="shadow-card">
            <CardContent className="p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10 mb-3">
                <ArrowUpRight className="h-5 w-5 text-success" />
              </div>
              {loading ? <Skeleton className="h-7 w-24" /> : <p className="text-2xl font-bold">{fmt(stats.net)}</p>}
              <p className="text-xs text-muted-foreground">Você Recebeu (líquido)</p>
            </CardContent>
          </Card>
          <Card className="shadow-card">
            <CardContent className="p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10 mb-3">
                <ArrowDownRight className="h-5 w-5 text-warning" />
              </div>
              {loading ? <Skeleton className="h-7 w-24" /> : <p className="text-2xl font-bold">{fmt(stats.fee)}</p>}
              <p className="text-xs text-muted-foreground">Comissão Plataforma (10%)</p>
            </CardContent>
          </Card>
          <Card className="shadow-card">
            <CardContent className="p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-info/10 mb-3">
                <Clock className="h-5 w-5 text-info" />
              </div>
              {loading ? <Skeleton className="h-7 w-24" /> : <p className="text-2xl font-bold">{fmt(stats.pending)}</p>}
              <p className="text-xs text-muted-foreground">Saldo Pendente</p>
            </CardContent>
          </Card>
        </div>

        {!storeId && !loading ? (
          <Card className="shadow-card">
            <CardContent className="p-8 text-center text-sm text-muted-foreground">
              Sua loja ainda não está vinculada ao backend. Complete o cadastro da loja para começar a receber pedidos e visualizar repasses.
            </CardContent>
          </Card>
        ) : (
          <Tabs defaultValue="orders" className="w-full">
            <TabsList className="grid w-full grid-cols-2 max-w-md">
              <TabsTrigger value="orders">
                <Package className="h-4 w-4 mr-2" /> Pedidos Pagos
              </TabsTrigger>
              <TabsTrigger value="payouts">
                <Receipt className="h-4 w-4 mr-2" /> Repasses
              </TabsTrigger>
            </TabsList>

            <TabsContent value="orders">
              <Card className="shadow-card">
                <CardHeader><CardTitle className="text-base">Pedidos Pagos</CardTitle></CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-3 font-medium">Pedido</th>
                          <th className="text-left p-3 font-medium">Data</th>
                          <th className="text-right p-3 font-medium">Bruto</th>
                          <th className="text-right p-3 font-medium">Comissão</th>
                          <th className="text-right p-3 font-medium">Líquido</th>
                          <th className="text-center p-3 font-medium">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {loading ? (
                          <tr><td colSpan={6} className="p-6 text-center text-muted-foreground">Carregando…</td></tr>
                        ) : paidOrders.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="p-6 text-center text-muted-foreground">
                              Nenhum pedido pago ainda.
                            </td>
                          </tr>
                        ) : paidOrders.map(o => (
                          <tr key={o.order_id}>
                            <td className="p-3 font-medium">#{o.order_number}</td>
                            <td className="p-3 text-muted-foreground">{fmtDate(o.paid_at)}</td>
                            <td className="p-3 text-right">{fmt(o.gross)}</td>
                            <td className="p-3 text-right text-warning">−{fmt(o.fee)}</td>
                            <td className="p-3 text-right font-semibold text-success">{fmt(o.net)}</td>
                            <td className="p-3 text-center"><StatusBadge status={o.status} /></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="payouts">
              <Card className="shadow-card">
                <CardHeader><CardTitle className="text-base">Histórico de Repasses</CardTitle></CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-3 font-medium">ID</th>
                          <th className="text-left p-3 font-medium">Solicitado</th>
                          <th className="text-left p-3 font-medium">Concluído</th>
                          <th className="text-right p-3 font-medium">Valor</th>
                          <th className="text-center p-3 font-medium">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {loading ? (
                          <tr><td colSpan={5} className="p-6 text-center text-muted-foreground">Carregando…</td></tr>
                        ) : payouts.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="p-6 text-center text-muted-foreground">
                              Nenhum repasse ainda. Quando seus pedidos pagos forem repassados, eles aparecerão aqui.
                            </td>
                          </tr>
                        ) : payouts.map(p => (
                          <tr key={p.id}>
                            <td className="p-3 font-mono text-xs">{p.id.slice(0, 8)}</td>
                            <td className="p-3 text-muted-foreground">{fmtDate(p.created_at)}</td>
                            <td className="p-3 text-muted-foreground">{fmtDate(p.completed_at)}</td>
                            <td className="p-3 text-right font-medium">{fmt(Number(p.amount))}</td>
                            <td className="p-3 text-center"><StatusBadge status={p.status} /></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </SellerLayout>
  );
};

export default SellerFinancials;
