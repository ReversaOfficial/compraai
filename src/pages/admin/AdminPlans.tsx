import { useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Edit, Package, TrendingUp, Users, DollarSign, Star } from 'lucide-react';
import { toast } from 'sonner';
import { usePlans, Plan } from '@/contexts/PlansContext';
import { useAuth } from '@/contexts/AuthContext';

const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const AdminPlans = () => {
  const { plans, updatePlan } = usePlans();
  const { getAllSellers } = useAuth();
  const sellers = getAllSellers();

  const [editing, setEditing] = useState<Plan | null>(null);
  const [form, setForm] = useState({ monthly_price: '', discount_pct: '15', name: '', popular: false });

  const calcAnnual = (monthly: string, disc: string) => {
    const m = parseFloat(monthly);
    const d = parseFloat(disc);
    if (isNaN(m) || isNaN(d)) return 0;
    return +(m * 12 * (1 - d / 100)).toFixed(2);
  };

  const openEdit = (plan: Plan) => {
    setEditing(plan);
    setForm({
      monthly_price: plan.monthly_price.toString(),
      discount_pct: plan.discount_pct.toString(),
      name: plan.name,
      popular: plan.popular ?? false,
    });
  };

  const handleSave = () => {
    if (!editing) return;
    const monthly = parseFloat(form.monthly_price);
    const discount = parseFloat(form.discount_pct);
    if (isNaN(monthly) || isNaN(discount) || discount < 0 || discount > 100) { toast.error('Valores inválidos'); return; }
    const annual = calcAnnual(form.monthly_price, form.discount_pct);
    const annual_monthly_price = annual / 12;

    const priceChanged = monthly !== editing.monthly_price;
    const storesOnPlan = getStoresOnPlan(editing.id);

    updatePlan(editing.id, {
      name: form.name,
      monthly_price: monthly,
      annual_price: annual,
      annual_monthly_price,
      discount_pct: Math.max(0, discount),
      popular: form.popular,
    });

    if (priceChanged && storesOnPlan > 0) {
      const effectiveDate = new Date();
      effectiveDate.setDate(effectiveDate.getDate() + 30);
      toast.info(`Novo valor será cobrado das ${storesOnPlan} loja(s) ativa(s) a partir de ${effectiveDate.toLocaleDateString('pt-BR')}`);
    }

    setEditing(null);
  };

  const getStoresOnPlan = (planId: string) => sellers.filter(s => s.plan_id === planId).length;

  const gradients: Record<string, string> = {
    plan_10: 'from-slate-500 to-slate-700',
    plan_20: 'from-emerald-500 to-emerald-700',
    plan_30: 'from-blue-500 to-blue-700',
    plan_50: 'from-violet-500 to-violet-700',
    plan_100: 'from-amber-500 to-orange-600',
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Gestão de Planos</h1>
          <p className="text-sm text-muted-foreground">Configure preços, limites e destaque de cada plano. As alterações aplicam-se imediatamente.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total de Planos', value: plans.length, icon: Package },
            { label: 'Lojistas Ativos', value: sellers.filter(s => s.is_active !== false).length, icon: Users },
            { label: 'Receita Mensal Est.', value: fmt(sellers.reduce((acc, s) => {
              const p = plans.find(pl => pl.id === s.plan_id);
              return acc + (p?.monthly_price ?? 0);
            }, 0)), icon: DollarSign },
            { label: 'Plano Mais Popular', value: plans.find(p => p.popular)?.name ?? '—', icon: Star },
          ].map(s => (
            <Card key={s.label} className="shadow-card">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                  <s.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                  <p className="font-bold text-sm">{s.value}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Plans Grid */}
        <div className="grid md:grid-cols-5 gap-4">
          {plans.map(plan => {
            const storeCount = getStoresOnPlan(plan.id);
            return (
              <Card key={plan.id} className="shadow-card overflow-hidden relative">
                {plan.popular && (
                  <div className="absolute top-0 right-0 left-0 text-center text-[10px] font-bold text-white py-1 bg-accent">
                    ⭐ MAIS POPULAR
                  </div>
                )}
                <div className={`bg-gradient-to-br ${gradients[plan.id] ?? 'from-gray-400 to-gray-600'} p-4 ${plan.popular ? 'mt-5' : ''}`}>
                  <p className="text-white/80 text-xs font-bold uppercase tracking-wider mb-1">{plan.name}</p>
                  <p className="text-white text-3xl font-extrabold">{plan.product_limit}</p>
                  <p className="text-white/70 text-xs">produtos</p>
                </div>
                <CardContent className="p-4 space-y-3">
                  <div>
                    <p className="text-2xl font-extrabold text-primary">{fmt(plan.monthly_price)}</p>
                    <p className="text-xs text-muted-foreground">/mês</p>
                  </div>
                  <div className="text-xs space-y-1.5 border-t pt-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Anual</span>
                      <span className="font-medium">{fmt(plan.annual_price)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Desc. anual</span>
                      <Badge className="text-[10px] h-4 bg-accent text-white">{plan.discount_pct}% OFF</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Lojas no plano</span>
                      <span className="font-bold text-primary">{storeCount}</span>
                    </div>
                  </div>
                  <Button size="sm" variant="outline" className="w-full gap-2" onClick={() => openEdit(plan)}>
                    <Edit className="h-3.5 w-3.5" /> Editar
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Edit Dialog */}
        <Dialog open={!!editing} onOpenChange={o => { if (!o) setEditing(null); }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar Plano — {editing?.name}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Nome do plano</Label>
                <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Preço mensal (R$)</Label>
                  <Input type="number" step="0.01" value={form.monthly_price}
                    onChange={e => setForm(f => ({ ...f, monthly_price: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>Preço anual total (R$)</Label>
                  <Input type="number" step="0.01" value={form.annual_price}
                    onChange={e => setForm(f => ({ ...f, annual_price: e.target.value }))} />
                  <p className="text-xs text-muted-foreground">
                    {form.annual_price && form.monthly_price
                      ? `= ${fmt(parseFloat(form.annual_price) / 12)}/mês — desconto ${Math.max(0, Math.round((1 - (parseFloat(form.annual_price) / 12) / parseFloat(form.monthly_price)) * 100))}%`
                      : 'Digite o valor total anual'}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <p className="text-sm font-medium">Destacar como "Mais Popular"</p>
                  <p className="text-xs text-muted-foreground">Exibe badge no comparativo de planos</p>
                </div>
                <Switch checked={form.popular} onCheckedChange={v => setForm(f => ({ ...f, popular: v }))} />
              </div>
              <div className="pt-2 border-t">
                <p className="text-xs text-muted-foreground mb-3">
                  ⚠️ O limite de produtos ({editing?.product_limit}) não pode ser alterado para não afetar lojistas existentes.
                </p>
                <Button className="w-full rounded-full" onClick={handleSave}>Salvar Alterações</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default AdminPlans;
