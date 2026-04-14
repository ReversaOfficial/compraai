import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Bike, Car, Truck as TruckIcon, User } from 'lucide-react';

interface Courier {
  id: string; name: string; phone: string; city: string; neighborhoods: string[];
  vehicle_type: string; is_active: boolean; operational_status: string;
}

const vehicleIcons: Record<string, any> = { moto: Bike, carro: Car, van: TruckIcon, bicicleta: Bike };
const vehicleLabels: Record<string, string> = { moto: 'Moto', carro: 'Carro', van: 'Van', bicicleta: 'Bicicleta' };
const opLabels: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' }> = {
  available: { label: 'Disponível', variant: 'default' },
  delivering: { label: 'Em Entrega', variant: 'secondary' },
  offline: { label: 'Offline', variant: 'destructive' },
};

const emptyForm = { name: '', phone: '', city: '', neighborhoods: '', vehicle_type: 'moto' };

const AdminCouriers = () => {
  const [couriers, setCouriers] = useState<Courier[]>([]);
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  const load = async () => {
    const { data } = await supabase.from('couriers').select('*').order('name');
    setCouriers((data as any[]) || []);
  };

  useEffect(() => { load(); }, []);

  const openNew = () => { setForm(emptyForm); setEditId(null); setOpen(true); };
  const openEdit = (c: Courier) => {
    setForm({ name: c.name, phone: c.phone, city: c.city, neighborhoods: c.neighborhoods.join(', '), vehicle_type: c.vehicle_type });
    setEditId(c.id); setOpen(true);
  };

  const save = async () => {
    if (!form.name || !form.phone) { toast.error('Nome e telefone são obrigatórios'); return; }
    const payload = {
      name: form.name, phone: form.phone, city: form.city,
      neighborhoods: form.neighborhoods.split(',').map(s => s.trim()).filter(Boolean),
      vehicle_type: form.vehicle_type,
    };
    if (editId) {
      await supabase.from('couriers').update(payload).eq('id', editId);
      toast.success('Freteiro atualizado');
    } else {
      await supabase.from('couriers').insert(payload);
      toast.success('Freteiro cadastrado');
    }
    setOpen(false); load();
  };

  const remove = async (id: string) => {
    await supabase.from('couriers').delete().eq('id', id);
    toast.success('Freteiro removido'); load();
  };

  const toggle = async (id: string, active: boolean) => {
    await supabase.from('couriers').update({ is_active: active }).eq('id', id);
    load();
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Freteiros</h1>
            <p className="text-sm text-muted-foreground">Cadastre e gerencie os freteiros da plataforma</p>
          </div>
          <Button onClick={openNew}><Plus className="h-4 w-4 mr-2" />Novo Freteiro</Button>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <Card><CardContent className="pt-6 text-center">
            <p className="text-3xl font-bold">{couriers.length}</p>
            <p className="text-sm text-muted-foreground">Total</p>
          </CardContent></Card>
          <Card><CardContent className="pt-6 text-center">
            <p className="text-3xl font-bold text-primary">{couriers.filter(c => c.is_active && c.operational_status === 'available').length}</p>
            <p className="text-sm text-muted-foreground">Disponíveis</p>
          </CardContent></Card>
          <Card><CardContent className="pt-6 text-center">
            <p className="text-3xl font-bold text-accent">{couriers.filter(c => c.operational_status === 'delivering').length}</p>
            <p className="text-sm text-muted-foreground">Em Entrega</p>
          </CardContent></Card>
        </div>

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Telefone</TableHead>
                  <TableHead>Cidade</TableHead>
                  <TableHead>Veículo</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ativo</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {couriers.map(c => {
                  const op = opLabels[c.operational_status] || opLabels.offline;
                  return (
                    <TableRow key={c.id}>
                      <TableCell className="font-medium">{c.name}</TableCell>
                      <TableCell>{c.phone}</TableCell>
                      <TableCell>{c.city}</TableCell>
                      <TableCell>{vehicleLabels[c.vehicle_type] || c.vehicle_type}</TableCell>
                      <TableCell><Badge variant={op.variant}>{op.label}</Badge></TableCell>
                      <TableCell><Switch checked={c.is_active} onCheckedChange={v => toggle(c.id, v)} /></TableCell>
                      <TableCell className="text-right space-x-1">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(c)}><Pencil className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => remove(c.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {couriers.length === 0 && (
                  <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">Nenhum freteiro cadastrado</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent>
            <DialogHeader><DialogTitle>{editId ? 'Editar Freteiro' : 'Novo Freteiro'}</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div><Label>Nome *</Label><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
              <div><Label>Telefone *</Label><Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="(00) 00000-0000" /></div>
              <div><Label>Cidade</Label><Input value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} /></div>
              <div><Label>Bairros atendidos (separados por vírgula)</Label><Input value={form.neighborhoods} onChange={e => setForm(f => ({ ...f, neighborhoods: e.target.value }))} placeholder="Centro, Jardins, Vila Nova" /></div>
              <div>
                <Label>Tipo de Veículo</Label>
                <Select value={form.vehicle_type} onValueChange={v => setForm(f => ({ ...f, vehicle_type: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="moto">Moto</SelectItem>
                    <SelectItem value="carro">Carro</SelectItem>
                    <SelectItem value="van">Van</SelectItem>
                    <SelectItem value="bicicleta">Bicicleta</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
              <Button onClick={save}>{editId ? 'Salvar' : 'Cadastrar'}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default AdminCouriers;
