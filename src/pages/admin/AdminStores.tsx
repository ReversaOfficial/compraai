import { useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Store, Package, Search, Edit, PowerOff, Power, ChevronRight, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth, SellerProfile } from '@/contexts/AuthContext';
import { usePlans } from '@/contexts/PlansContext';

const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const AdminStores = () => {
  const { getAllSellers, updateSellerById } = useAuth();
  const { plans } = usePlans();
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<SellerProfile | null>(null);
  const [form, setForm] = useState({ plan_id: '', plan_limit: 0 });

  const sellers = getAllSellers().filter(s =>
    s.store_name.toLowerCase().includes(search.toLowerCase()) ||
    s.email.toLowerCase().includes(search.toLowerCase())
  );

  const openEdit = (s: SellerProfile) => {
    setEditing(s);
    setForm({ plan_id: s.plan_id, plan_limit: s.plan_limit });
  };

  const handleSave = () => {
    if (!editing) return;
    const plan = plans.find(p => p.id === form.plan_id);
    updateSellerById(editing.id, {
      plan_id: form.plan_id,
      plan_limit: form.plan_limit,
      plan_expires_at: new Date(Date.now() + 30 * 86400000).toISOString(),
    });
    toast.success(`Plano de "${editing.store_name}" atualizado para ${plan?.name ?? form.plan_id}!`);
    setEditing(null);
  };

  const toggleActive = (s: SellerProfile) => {
    const newState = s.is_active === false ? true : false;
    updateSellerById(s.id, { is_active: newState });
    toast.success(`Loja "${s.store_name}" ${newState ? 'ativada' : 'desativada'}!`);
  };

  const totalActive = sellers.filter(s => s.is_active !== false).length;
  const revenue = sellers.filter(s => s.is_active !== false).reduce((acc, s) => {
    const p = plans.find(pl => pl.id === s.plan_id);
    return acc + (p?.monthly_price ?? 0);
  }, 0);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Gerenciar Lojas</h1>
          <p className="text-sm text-muted-foreground">Controle planos, limites e status de todas as lojas da plataforma</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <Card className="shadow-card"><CardContent className="p-4 text-center">
            <p className="text-3xl font-extrabold text-primary">{sellers.length}</p>
            <p className="text-xs text-muted-foreground mt-1">Total de Lojas</p>
          </CardContent></Card>
          <Card className="shadow-card"><CardContent className="p-4 text-center">
            <p className="text-3xl font-extrabold text-emerald-600">{totalActive}</p>
            <p className="text-xs text-muted-foreground mt-1">Lojas Ativas</p>
          </CardContent></Card>
          <Card className="shadow-card"><CardContent className="p-4 text-center">
            <p className="text-3xl font-extrabold text-accent">{fmt(revenue)}</p>
            <p className="text-xs text-muted-foreground mt-1">Receita Mensal Est.</p>
          </CardContent></Card>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input className="pl-10" placeholder="Buscar loja por nome ou e-mail..." value={search}
            onChange={e => setSearch(e.target.value)} />
        </div>

        {/* Table */}
        <Card className="shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 border-b">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wide text-muted-foreground">Loja</th>
                  <th className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wide text-muted-foreground">Plano</th>
                  <th className="text-center px-4 py-3 font-semibold text-xs uppercase tracking-wide text-muted-foreground">Produtos</th>
                  <th className="text-center px-4 py-3 font-semibold text-xs uppercase tracking-wide text-muted-foreground">Status</th>
                  <th className="text-center px-4 py-3 font-semibold text-xs uppercase tracking-wide text-muted-foreground">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {sellers.length === 0 && (
                  <tr><td colSpan={5} className="text-center py-12 text-muted-foreground">
                    <Store className="h-8 w-8 mx-auto mb-2 opacity-30" />
                    <p>Nenhuma loja cadastrada ainda</p>
                  </td></tr>
                )}
                {sellers.map(s => {
                  const plan = plans.find(p => p.id === s.plan_id);
                  const isActive = s.is_active !== false;
                  return (
                    <tr key={s.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-lg bg-primary flex items-center justify-center text-white font-bold text-sm shrink-0">
                            {s.store_name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold">{s.store_name}</p>
                            <p className="text-xs text-muted-foreground">{s.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="outline" className="font-medium">
                          {plan?.name ?? s.plan_id}
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-0.5">{fmt(plan?.monthly_price ?? 0)}/mês</p>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="inline-flex flex-col items-center">
                          <span className="font-bold">0 / {s.plan_limit}</span>
                          <div className="h-1.5 w-16 bg-muted rounded-full mt-1 overflow-hidden">
                            <div className="h-full bg-primary rounded-full" style={{ width: '0%' }} />
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Badge className={isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}>
                          {isActive ? '● Ativa' : '○ Inativa'}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(s)} title="Alterar plano">
                            <Edit className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className={`h-8 w-8 ${isActive ? 'text-destructive' : 'text-emerald-600'}`}
                            onClick={() => toggleActive(s)} title={isActive ? 'Desativar' : 'Ativar'}>
                            {isActive ? <PowerOff className="h-3.5 w-3.5" /> : <Power className="h-3.5 w-3.5" />}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Edit Dialog */}
        <Dialog open={!!editing} onOpenChange={o => { if (!o) setEditing(null); }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Alterar Plano — {editing?.store_name}</DialogTitle>
            </DialogHeader>
            <div className="space-y-5">
              <div className="rounded-lg bg-muted p-3 text-sm space-y-1">
                <div className="flex justify-between"><span className="text-muted-foreground">Plano atual</span>
                  <span className="font-medium">{plans.find(p => p.id === editing?.plan_id)?.name ?? editing?.plan_id}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Limite atual</span>
                  <span className="font-medium">{editing?.plan_limit} produtos</span></div>
              </div>

              <div className="space-y-2">
                <Label>Novo Plano</Label>
                <Select value={form.plan_id} onValueChange={v => {
                  const p = plans.find(pl => pl.id === v);
                  setForm(f => ({ ...f, plan_id: v, plan_limit: p?.product_limit ?? f.plan_limit }));
                }}>
                  <SelectTrigger><SelectValue placeholder="Selecione o plano" /></SelectTrigger>
                  <SelectContent>
                    {plans.map(p => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name} — {p.product_limit} produtos — {fmt(p.monthly_price)}/mês
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Limite de produtos (ajuste manual)</Label>
                <Input type="number" value={form.plan_limit}
                  onChange={e => setForm(f => ({ ...f, plan_limit: parseInt(e.target.value) || 0 }))} />
                <p className="text-xs text-muted-foreground">
                  Padrão do plano selecionado: {plans.find(p => p.id === form.plan_id)?.product_limit ?? '—'} produtos.
                  Você pode aumentar ou diminuir manualmente.
                </p>
              </div>

              {form.plan_limit < (editing?.plan_limit ?? 0) && (
                <div className="flex gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700">
                  <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                  <p>Reduzindo o limite. A loja será avisada caso tenha produtos acima do novo limite.</p>
                </div>
              )}

              <Button className="w-full rounded-full" onClick={handleSave}>Confirmar Alteração</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default AdminStores;
