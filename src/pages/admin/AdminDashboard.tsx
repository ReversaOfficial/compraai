import { DollarSign, ShoppingBag, Store, Users, Package, TrendingUp, ArrowUpRight } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const stats = [
  { label: 'Vendas Total', value: fmt(142580.00), icon: DollarSign, change: '+15%' },
  { label: 'Pedidos', value: '847', icon: ShoppingBag, change: '+22%' },
  { label: 'Lojistas Ativos', value: '6', icon: Store, change: '' },
  { label: 'Clientes', value: '1.234', icon: Users, change: '+18%' },
  { label: 'Comissão Gerada', value: fmt(14258.00), icon: TrendingUp, change: '+15%' },
  { label: 'Produtos', value: '183', icon: Package, change: '' },
];

const revenueData = [
  { month: 'Jan', receita: 18500, comissao: 1850 },
  { month: 'Fev', receita: 21200, comissao: 2120 },
  { month: 'Mar', receita: 19800, comissao: 1980 },
  { month: 'Abr', receita: 24500, comissao: 2450 },
  { month: 'Mai', receita: 28300, comissao: 2830 },
  { month: 'Jun', receita: 30280, comissao: 3028 },
];

const ordersData = [
  { month: 'Jan', pedidos: 98 },
  { month: 'Fev', pedidos: 125 },
  { month: 'Mar', pedidos: 112 },
  { month: 'Abr', pedidos: 148 },
  { month: 'Mai', pedidos: 167 },
  { month: 'Jun', pedidos: 197 },
];

const categoryData = [
  { name: 'Moda', value: 35, fill: 'hsl(160, 84%, 28%)' },
  { name: 'Eletrônicos', value: 25, fill: 'hsl(28, 90%, 55%)' },
  { name: 'Casa', value: 15, fill: 'hsl(210, 92%, 45%)' },
  { name: 'Beleza', value: 12, fill: 'hsl(142, 71%, 45%)' },
  { name: 'Outros', value: 13, fill: 'hsl(38, 92%, 50%)' },
];

const revenueConfig = {
  receita: { label: 'Receita', color: 'hsl(160, 84%, 28%)' },
  comissao: { label: 'Comissão', color: 'hsl(28, 90%, 55%)' },
};

const ordersConfig = {
  pedidos: { label: 'Pedidos', color: 'hsl(210, 92%, 45%)' },
};

const recentStores = [
  { name: 'Moda Bella', status: 'active', plan: 'Premium', revenue: 28400 },
  { name: 'TechZone', status: 'active', plan: 'Premium', revenue: 45200 },
  { name: 'Casa Viva', status: 'active', plan: 'Intermediário', revenue: 12800 },
  { name: 'Sabor da Terra', status: 'active', plan: 'Básico', revenue: 18900 },
  { name: 'Bella Pele', status: 'active', plan: 'Intermediário', revenue: 22300 },
  { name: 'SportFit', status: 'pending', plan: 'Básico', revenue: 8700 },
];

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
                {recentStores.map(s => (
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
