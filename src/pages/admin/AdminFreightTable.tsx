import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, MapPin, AlertTriangle } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

interface FreightRoute {
  id: string;
  city: string;
  neighborhood: string;
  state: string;
  base_price: number;
  platform_fee_percent: number;
  is_active: boolean;
  origin?: string;
  created_at?: string;
}

const emptyForm = { city: '', neighborhood: '', state: '', base_price: 0, platform_fee_percent: 10 };

const AdminFreightTable = () => {
  const [routes, setRoutes] = useState<FreightRoute[]>([]);
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [originFilter, setOriginFilter] = useState<string>('all');

  const fetch = async () => {
    const { data } = await supabase.from('entregaai_settings').select('*').order('city').order('neighborhood');
    setRoutes((data as any[]) || []);
  };

  useEffect(() => { fetch(); }, []);

  const openNew = () => { setForm(emptyForm); setEditId(null); setOpen(true); };
  const openEdit = (r: FreightRoute) => {
    setForm({ city: r.city, neighborhood: r.neighborhood, state: r.state, base_price: r.base_price, platform_fee_percent: r.platform_fee_percent });
    setEditId(r.id); setOpen(true);
  };

  const save = async () => {
    if (!form.city) { toast.error('Cidade é obrigatória'); return; }
    const payload = { ...form, is_active: true };
    if (editId) {
      await supabase.from('entregaai_settings').update(payload).eq('id', editId);
      toast.success('Rota atualizada');
    } else {
      await supabase.from('entregaai_settings').insert(payload);
      toast.success('Rota criada');
    }
    setOpen(false); fetch();
  };

  const remove = async (id: string) => {
    await supabase.from('entregaai_settings').delete().eq('id', id);
    toast.success('Rota removida'); fetch();
  };

  const toggle = async (id: string, active: boolean) => {
    await supabase.from('entregaai_settings').update({ is_active: active }).eq('id', id);
    fetch();
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Tabela de Frete</h1>
            <p className="text-sm text-muted-foreground">Gerencie rotas e valores de frete dos freteiros</p>
          </div>
          <Button onClick={openNew}><Plus className="h-4 w-4 mr-2" />Nova Rota</Button>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-3">
          <Label className="text-sm">Filtrar por origem:</Label>
          <Select value={originFilter} onValueChange={setOriginFilter}>
            <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="manual">Manual (admin)</SelectItem>
              <SelectItem value="auto">Automático (sistema)</SelectItem>
            </SelectContent>
          </Select>
          {routes.filter(r => r.origin === 'auto').length > 0 && (
            <Badge variant="outline" className="gap-1"><AlertTriangle className="h-3 w-3" />{routes.filter(r => r.origin === 'auto').length} bairro(s) criado(s) automaticamente</Badge>
          )}
        </div>

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cidade</TableHead>
                  <TableHead>Bairro</TableHead>
                  <TableHead>Origem</TableHead>
                  <TableHead>Valor Frete</TableHead>
                  <TableHead>Taxa Plataforma</TableHead>
                  <TableHead>Líquido Freteiro</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {routes.filter(r => originFilter === 'all' || r.origin === originFilter).map(r => {
                  const fee = r.base_price * r.platform_fee_percent / 100;
                  const net = r.base_price - fee;
                  return (
                    <TableRow key={r.id} className={r.origin === 'auto' ? 'bg-yellow-50/50 dark:bg-yellow-900/10' : ''}>
                      <TableCell className="font-medium">{r.city}</TableCell>
                      <TableCell>{r.neighborhood || 'Toda cidade'}</TableCell>
                      <TableCell>
                        <Badge variant={r.origin === 'auto' ? 'secondary' : 'outline'} className="text-xs">
                          {r.origin === 'auto' ? '🤖 Auto' : '✏️ Manual'}
                        </Badge>
                      </TableCell>
                      <TableCell>{fmt(r.base_price)}</TableCell>
                      <TableCell>{r.platform_fee_percent}% ({fmt(fee)})</TableCell>
                      <TableCell className="font-medium text-primary">{fmt(net)}</TableCell>
                      <TableCell>
                        <Switch checked={r.is_active} onCheckedChange={v => toggle(r.id, v)} />
                      </TableCell>
                      <TableCell className="text-right space-x-1">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(r)}><Pencil className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => remove(r.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {routes.filter(r => originFilter === 'all' || r.origin === originFilter).length === 0 && (
                  <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">Nenhuma rota encontrada</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent>
            <DialogHeader><DialogTitle>{editId ? 'Editar Rota' : 'Nova Rota'}</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Cidade *</Label><Input value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} placeholder="Ex: São Paulo" /></div>
                <div><Label>Estado</Label><Input value={form.state} onChange={e => setForm(f => ({ ...f, state: e.target.value }))} placeholder="SP" /></div>
              </div>
              <div><Label>Bairro (vazio = toda cidade)</Label><Input value={form.neighborhood} onChange={e => setForm(f => ({ ...f, neighborhood: e.target.value }))} placeholder="Ex: Centro" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Valor do Frete (R$)</Label><Input type="number" step="0.01" value={form.base_price} onChange={e => setForm(f => ({ ...f, base_price: Number(e.target.value) }))} /></div>
                <div><Label>Taxa Plataforma (%)</Label><Input type="number" step="0.5" value={form.platform_fee_percent} onChange={e => setForm(f => ({ ...f, platform_fee_percent: Number(e.target.value) }))} /></div>
              </div>
              {form.base_price > 0 && (
                <div className="rounded-lg bg-secondary/50 p-3 text-sm space-y-1">
                  <div className="flex justify-between"><span>Frete total</span><span className="font-bold">{fmt(form.base_price)}</span></div>
                  <div className="flex justify-between"><span>Taxa plataforma ({form.platform_fee_percent}%)</span><span>{fmt(form.base_price * form.platform_fee_percent / 100)}</span></div>
                  <div className="flex justify-between border-t pt-1"><span>Líquido freteiro</span><span className="font-bold text-primary">{fmt(form.base_price - form.base_price * form.platform_fee_percent / 100)}</span></div>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
              <Button onClick={save}>{editId ? 'Salvar' : 'Criar'}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default AdminFreightTable;
