import AdminLayout from '@/components/admin/AdminLayout';
import { DollarSign, ArrowUpRight, ArrowDownRight, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const payouts: { store: string; amount: number; commission: number; status: string; date: string }[] = [];

const AdminFinancials = () => (
  <AdminLayout>
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Financeiro</h1>

      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-card"><CardContent className="p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 mb-3"><DollarSign className="h-5 w-5 text-primary" /></div>
          <p className="text-2xl font-bold">{fmt(0)}</p><p className="text-xs text-muted-foreground">Receita Total</p>
        </CardContent></Card>
        <Card className="shadow-card"><CardContent className="p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10 mb-3"><ArrowUpRight className="h-5 w-5 text-success" /></div>
          <p className="text-2xl font-bold">{fmt(0)}</p><p className="text-xs text-muted-foreground">Comissão Total</p>
        </CardContent></Card>
        <Card className="shadow-card"><CardContent className="p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10 mb-3"><Clock className="h-5 w-5 text-warning" /></div>
          <p className="text-2xl font-bold">{fmt(0)}</p><p className="text-xs text-muted-foreground">Repasses Pendentes</p>
        </CardContent></Card>
        <Card className="shadow-card"><CardContent className="p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-info/10 mb-3"><ArrowDownRight className="h-5 w-5 text-info" /></div>
          <p className="text-2xl font-bold">{fmt(0)}</p><p className="text-xs text-muted-foreground">Repasses Realizados</p>
        </CardContent></Card>
      </div>

      <Card className="shadow-card">
        <CardHeader><CardTitle className="text-base">Repasses por Loja</CardTitle></CardHeader>
        <CardContent>
          <table className="w-full text-sm">
            <thead><tr className="border-b">
              <th className="text-left p-3 font-medium">Loja</th>
              <th className="text-right p-3 font-medium">Valor</th>
              <th className="text-right p-3 font-medium hidden sm:table-cell">Comissão</th>
              <th className="text-left p-3 font-medium hidden sm:table-cell">Data</th>
              <th className="text-center p-3 font-medium">Status</th>
            </tr></thead>
            <tbody className="divide-y">
              {payouts.length === 0 ? (
                <tr><td colSpan={5} className="p-6 text-center text-muted-foreground text-sm">Nenhum repasse registrado ainda.</td></tr>
              ) : payouts.map(p => (
                <tr key={p.store + p.date}>
                  <td className="p-3 font-medium">{p.store}</td>
                  <td className="p-3 text-right">{fmt(p.amount)}</td>
                  <td className="p-3 text-right text-muted-foreground hidden sm:table-cell">{fmt(p.commission)}</td>
                  <td className="p-3 text-muted-foreground hidden sm:table-cell">{p.date}</td>
                  <td className="p-3 text-center">
                    <Badge className={`border-0 text-xs ${p.status === 'paid' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'}`}>
                      {p.status === 'paid' ? 'Pago' : 'Pendente'}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  </AdminLayout>
);

export default AdminFinancials;
