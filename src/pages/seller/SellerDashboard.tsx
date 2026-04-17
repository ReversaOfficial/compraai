import { DollarSign, ShoppingBag, Package, TrendingUp, AlertTriangle, ArrowUpRight } from 'lucide-react';
import SellerLayout from '@/components/seller/SellerLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line, AreaChart, Area } from 'recharts';
import { useAuth, SellerProfile } from '@/contexts/AuthContext';

const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const stats = [
  { label: 'Vendas Hoje', value: fmt(0), icon: DollarSign, change: '' },
  { label: 'Vendas do Mês', value: fmt(0), icon: TrendingUp, change: '' },
  { label: 'Pedidos Pendentes', value: '0', icon: ShoppingBag, change: '' },
  { label: 'Produtos Ativos', value: '0', icon: Package, change: '' },
];

const salesData = [
  { day: 'Seg', vendas: 0 },
  { day: 'Ter', vendas: 0 },
  { day: 'Qua', vendas: 0 },
  { day: 'Qui', vendas: 0 },
  { day: 'Sex', vendas: 0 },
  { day: 'Sáb', vendas: 0 },
  { day: 'Dom', vendas: 0 },
];

const monthlyData = [
  { month: 'Jan', receita: 0, pedidos: 0 },
  { month: 'Fev', receita: 0, pedidos: 0 },
  { month: 'Mar', receita: 0, pedidos: 0 },
  { month: 'Abr', receita: 0, pedidos: 0 },
];

const salesConfig = { vendas: { label: 'Vendas (R$)', color: 'hsl(160, 84%, 28%)' } };
const monthlyConfig = {
  receita: { label: 'Receita', color: 'hsl(160, 84%, 28%)' },
  pedidos: { label: 'Pedidos', color: 'hsl(28, 90%, 55%)' },
};

const recentOrders: { id: string; customer: string; total: number; status: string; date: string }[] = [];

const statusColor: Record<string, string> = {
  'Entregue': 'bg-success/10 text-success',
  'Pago': 'bg-info/10 text-info',
  'Pendente': 'bg-warning/10 text-warning',
  'Pronto': 'bg-primary/10 text-primary',
};

const SellerDashboard = () => {
  const { user } = useAuth();
  const seller = user as SellerProfile | null;

  return (
  <SellerLayout>
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Bem-vindo de volta, {seller?.store_name || 'Lojista'}!</p>
      </div>

      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {stats.map(s => (
          <Card key={s.label} className="shadow-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <s.icon className="h-5 w-5 text-primary" />
                </div>
                {s.change && (
                  <Badge variant="secondary" className="text-xs text-success gap-0.5">
                    <ArrowUpRight className="h-3 w-3" />{s.change}
                  </Badge>
                )}
              </div>
              <p className="text-2xl font-bold">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="shadow-card">
          <CardHeader className="pb-3"><CardTitle className="text-base">Vendas da Semana</CardTitle></CardHeader>
          <CardContent>
            <ChartContainer config={salesConfig} className="h-[250px]">
              <AreaChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="day" className="text-xs" />
                <YAxis className="text-xs" />
                <ChartTooltip content={<ChartTooltipContent />} />
                <defs>
                  <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(160, 84%, 28%)" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="hsl(160, 84%, 28%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area type="monotone" dataKey="vendas" stroke="var(--color-vendas)" fill="url(#salesGrad)" strokeWidth={2} />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader className="pb-3"><CardTitle className="text-base">Receita Mensal</CardTitle></CardHeader>
          <CardContent>
            <ChartContainer config={monthlyConfig} className="h-[250px]">
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="month" className="text-xs" />
                <YAxis className="text-xs" />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="receita" fill="var(--color-receita)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent orders */}
        <Card className="shadow-card">
          <CardHeader className="pb-3"><CardTitle className="text-base">Pedidos Recentes</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentOrders.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">Nenhum pedido ainda.</p>
              ) : recentOrders.map(o => (
                <div key={o.id} className="flex items-center justify-between text-sm">
                  <div>
                    <p className="font-medium">{o.customer}</p>
                    <p className="text-xs text-muted-foreground">{o.id} · {o.date}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-medium">{fmt(o.total)}</span>
                    <Badge className={`border-0 text-xs ${statusColor[o.status]}`}>{o.status}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Alerts */}
        <Card className="shadow-card">
          <CardHeader className="pb-3"><CardTitle className="text-base">Alertas</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground text-center py-6">Nenhum alerta no momento.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  </SellerLayout>
  );
};

export default SellerDashboard;
