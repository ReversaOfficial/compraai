import AdminLayout from '@/components/admin/AdminLayout';
import { orders } from '@/data/mock';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const statusMap: Record<string, { label: string; color: string }> = {
  pending: { label: 'Pendente', color: 'bg-warning/10 text-warning' },
  paid: { label: 'Pago', color: 'bg-info/10 text-info' },
  preparing: { label: 'Em Separação', color: 'bg-accent/10 text-accent' },
  ready: { label: 'Pronto', color: 'bg-primary/10 text-primary' },
  shipped: { label: 'Enviado', color: 'bg-info/10 text-info' },
  delivered: { label: 'Entregue', color: 'bg-success/10 text-success' },
  cancelled: { label: 'Cancelado', color: 'bg-destructive/10 text-destructive' },
};

const AdminOrders = () => {
  const [filter, setFilter] = useState('all');
  const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Pedidos</h1>
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="pending">Pendentes</SelectItem>
              <SelectItem value="paid">Pagos</SelectItem>
              <SelectItem value="delivered">Entregues</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="rounded-xl border bg-card overflow-hidden">
          <table className="w-full text-sm">
            <thead><tr className="border-b bg-muted/50">
              <th className="text-left p-3 font-medium">Pedido</th>
              <th className="text-left p-3 font-medium">Cliente</th>
              <th className="text-left p-3 font-medium hidden sm:table-cell">Pagamento</th>
              <th className="text-right p-3 font-medium">Total</th>
              <th className="text-center p-3 font-medium">Status</th>
            </tr></thead>
            <tbody className="divide-y">
              {filtered.map(o => {
                const s = statusMap[o.status];
                return (
                  <tr key={o.id} className="hover:bg-muted/30">
                    <td className="p-3 font-medium">{o.id}</td>
                    <td className="p-3">{o.customerName}</td>
                    <td className="p-3 text-muted-foreground hidden sm:table-cell capitalize">{o.paymentMethod === 'pix' ? 'Pix' : 'Cartão'}</td>
                    <td className="p-3 text-right font-medium">{fmt(o.total)}</td>
                    <td className="p-3 text-center"><Badge className={`border-0 text-xs ${s.color}`}>{s.label}</Badge></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminOrders;
