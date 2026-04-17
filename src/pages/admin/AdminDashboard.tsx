import { DollarSign, ShoppingBag, Store, Users, Package, TrendingUp, ArrowUpRight } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const stats = [
  { label: 'Vendas Total', value: fmt(0), icon: DollarSign, change: '' },
  { label: 'Pedidos', value: '0', icon: ShoppingBag, change: '' },
  { label: 'Lojistas Ativos', value: '0', icon: Store, change: '' },
  { label: 'Clientes', value: '0', icon: Users, change: '' },
  { label: 'Comissão Gerada', value: fmt(0), icon: TrendingUp, change: '' },
  { label: 'Produtos', value: '0', icon: Package, change: '' },
];

const revenueData = [
  { month: 'Jan', receita: 0, comissao: 0 },
  { month: 'Fev', receita: 0, comissao: 0 },
  { month: 'Mar', receita: 0, comissao: 0 },
  { month: 'Abr', receita: 0, comissao: 0 },
  { month: 'Mai', receita: 0, comissao: 0 },
  { month: 'Jun', receita: 0, comissao: 0 },
];

const ordersData = [
  { month: 'Jan', pedidos: 0 },
  { month: 'Fev', pedidos: 0 },
  { month: 'Mar', pedidos: 0 },
  { month: 'Abr', pedidos: 0 },
  { month: 'Mai', pedidos: 0 },
  { month: 'Jun', pedidos: 0 },
];

const categoryData = [
  { name: 'Sem dados', value: 1, fill: 'hsl(var(--muted))' },
];

const revenueConfig = {
  receita: { label: 'Receita', color: 'hsl(160, 84%, 28%)' },
  comissao: { label: 'Comissão', color: 'hsl(28, 90%, 55%)' },
};

const ordersConfig = {
  pedidos: { label: 'Pedidos', color: 'hsl(210, 92%, 45%)' },
};

const recentStores: { name: string; status: string; plan: string; revenue: number }[] = [];

const AdminDashboard = () => (
  <AdminLayout>
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Visão geral da plataforma</p>
      </div>

      <div className="grid gap-4 grid-cols-2 lg:grid-cols-3">
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
          <CardHeader><CardTitle className="text-base">Receita & Comissão</CardTitle></CardHeader>
          <CardContent>
            <ChartContainer config={revenueConfig} className="h-[280px]">
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="month" className="text-xs" />
                <YAxis className="text-xs" />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="receita" fill="var(--color-receita)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="comissao" fill="var(--color-comissao)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader><CardTitle className="text-base">Pedidos por Mês</CardTitle></CardHeader>
          <CardContent>
            <ChartContainer config={ordersConfig} className="h-[280px]">
              <LineChart data={ordersData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="month" className="text-xs" />
                <YAxis className="text-xs" />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line type="monotone" dataKey="pedidos" stroke="var(--color-pedidos)" strokeWidth={2} dot={{ fill: 'var(--color-pedidos)' }} />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="shadow-card">
          <CardHeader><CardTitle className="text-base">Vendas por Categoria</CardTitle></CardHeader>
          <CardContent>
            <div className="h-[220px] flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={categoryData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false} fontSize={11}>
                    {categoryData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                  </Pie>
                  <ChartTooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card lg:col-span-2">
          <CardHeader><CardTitle className="text-base">Lojas</CardTitle></CardHeader>
          <CardContent>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 font-medium">Loja</th>
                  <th className="text-left p-3 font-medium hidden sm:table-cell">Plano</th>
                  <th className="text-right p-3 font-medium">Receita</th>
                  <th className="text-center p-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {recentStores.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-6 text-center text-muted-foreground text-sm">
                      Nenhuma loja cadastrada ainda.
                    </td>
                  </tr>
                ) : recentStores.map(s => (
                  <tr key={s.name} className="hover:bg-muted/30">
                    <td className="p-3 font-medium">{s.name}</td>
                    <td className="p-3 text-muted-foreground hidden sm:table-cell">{s.plan}</td>
                    <td className="p-3 text-right">{fmt(s.revenue)}</td>
                    <td className="p-3 text-center">
                      <Badge className={`border-0 text-xs ${s.status === 'active' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'}`}>
                        {s.status === 'active' ? 'Ativo' : 'Pendente'}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>
    </div>
  </AdminLayout>
);

export default AdminDashboard;
