import { DollarSign, ArrowUpRight, ArrowDownRight, Clock } from 'lucide-react';
import SellerLayout from '@/components/seller/SellerLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const payouts = [
  { id: 'REP-001', amount: 3200.00, status: 'paid', date: '01/04/2026' },
  { id: 'REP-002', amount: 2840.50, status: 'paid', date: '15/03/2026' },
  { id: 'REP-003', amount: 2340.00, status: 'pending', date: '15/04/2026' },
];

const SellerFinancials = () => (
  <SellerLayout>
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Financeiro</h1>

      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-card">
          <CardContent className="p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 mb-3">
              <DollarSign className="h-5 w-5 text-primary" />
            </div>
            <p className="text-2xl font-bold">{fmt(18420.50)}</p>
            <p className="text-xs text-muted-foreground">Total Vendido</p>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10 mb-3">
              <ArrowUpRight className="h-5 w-5 text-success" />
            </div>
            <p className="text-2xl font-bold">{fmt(16578.45)}</p>
            <p className="text-xs text-muted-foreground">Total Líquido</p>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10 mb-3">
              <ArrowDownRight className="h-5 w-5 text-warning" />
            </div>
            <p className="text-2xl font-bold">{fmt(1842.05)}</p>
            <p className="text-xs text-muted-foreground">Comissão Plataforma (10%)</p>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-info/10 mb-3">
              <Clock className="h-5 w-5 text-info" />
            </div>
            <p className="text-2xl font-bold">{fmt(2340.00)}</p>
            <p className="text-xs text-muted-foreground">Saldo Pendente</p>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-card">
        <CardHeader><CardTitle className="text-base">Histórico de Repasses</CardTitle></CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 font-medium">ID</th>
                  <th className="text-left p-3 font-medium">Data</th>
                  <th className="text-right p-3 font-medium">Valor</th>
                  <th className="text-center p-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {payouts.map(p => (
                  <tr key={p.id}>
                    <td className="p-3 font-medium">{p.id}</td>
                    <td className="p-3 text-muted-foreground">{p.date}</td>
                    <td className="p-3 text-right font-medium">{fmt(p.amount)}</td>
                    <td className="p-3 text-center">
                      <Badge className={`border-0 text-xs ${p.status === 'paid' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'}`}>
                        {p.status === 'paid' ? 'Pago' : 'Pendente'}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  </SellerLayout>
);

export default SellerFinancials;
