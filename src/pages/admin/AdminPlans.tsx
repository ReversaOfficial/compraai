import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit } from 'lucide-react';

const plans = [
  { name: 'Básico', limit: 30, price: 49.90, stores: 2, color: 'bg-muted' },
  { name: 'Intermediário', limit: 50, price: 89.90, stores: 2, color: 'bg-primary/10' },
  { name: 'Premium', limit: 100, price: 149.90, stores: 2, color: 'bg-accent/10' },
];

const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const AdminPlans = () => (
  <AdminLayout>
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Gestão de Planos</h1>

      <div className="grid gap-6 md:grid-cols-3">
        {plans.map(p => (
          <Card key={p.name} className="shadow-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{p.name}</CardTitle>
                <Button variant="ghost" size="icon" className="h-8 w-8"><Edit className="h-4 w-4" /></Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-3xl font-bold text-primary">{fmt(p.price)}<span className="text-sm font-normal text-muted-foreground">/mês</span></div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Limite de produtos</span><span className="font-medium">{p.limit}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Lojas ativas</span><Badge variant="secondary" className="text-xs">{p.stores}</Badge></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  </AdminLayout>
);

export default AdminPlans;
