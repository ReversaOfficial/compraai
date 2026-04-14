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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, CheckCircle2, XCircle, Eye, Phone } from 'lucide-react';

const vehicleLabels: Record<string, string> = {
  moto: '🏍️ Moto', carro: '🚗 Carro', van: '🚐 Van', bicicleta: '🚲 Bicicleta',
  caminhao: '🚛 Caminhão', moto_eletrica: '⚡ Moto Elétrica', patinete_eletrico: '🛴 Patinete',
};
const opLabels: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' }> = {
  available: { label: 'Disponível', variant: 'default' },
  in_delivery: { label: 'Em Entrega', variant: 'secondary' },
  offline: { label: 'Offline', variant: 'destructive' },
};

const emptyForm = { name: '', phone: '', city: '', neighborhoods: '', vehicle_type: 'moto' };

const AdminCouriers = () => {
  const [couriers, setCouriers] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selected, setSelected] = useState<any>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  const load = async () => {
    const { data } = await supabase.from('couriers').select('*').order('created_at', { ascending: false });
    setCouriers((data as any[]) || []);
  };

  useEffect(() => { load(); }, []);

  const openNew = () => { setForm(emptyForm); setEditId(null); setOpen(true); };
  const openEdit = (c: any) => {
    setForm({ name: c.name, phone: c.phone, city: c.city, neighborhoods: (c.neighborhoods || []).join(', '), vehicle_type: c.vehicle_type });
    setEditId(c.id); setOpen(true);
  };

  const save = async () => {
    if (!form.name || !form.phone) { toast.error('Nome e telefone são obrigatórios'); return; }
    const payload = {
      name: form.name, phone: form.phone, city: form.city,
      neighborhoods: form.neighborhoods.split(',').map((s: string) => s.trim()).filter(Boolean),
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

  const approve = async (id: string) => {
    await supabase.from('couriers').update({ registration_status: 'approved', is_active: true } as any).eq('id', id);
    toast.success('Freteiro aprovado!');
    // Send WhatsApp notification
    const c = couriers.find(c => c.id === id);
    if (c?.phone) {
      const msg = encodeURIComponent(`✅ Parabéns ${c.name}! Seu cadastro como freteiro foi aprovado. Acesse o painel para ver as entregas disponíveis.`);
      window.open(`https://wa.me/55${c.phone.replace(/\D/g, '')}?text=${msg}`, '_blank');
    }
    load();
  };

  const reject = async (id: string) => {
    await supabase.from('couriers').update({ registration_status: 'rejected', is_active: false } as any).eq('id', id);
    toast.success('Cadastro recusado'); load();
  };

  const pendingCouriers = couriers.filter(c => c.registration_status === 'pending');
  const activeCouriers = couriers.filter(c => c.registration_status !== 'pending');

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

        <div className="grid gap-4 sm:grid-cols-4">
          <Card><CardContent className="pt-6 text-center"><p className="text-3xl font-bold">{couriers.length}</p><p className="text-sm text-muted-foreground">Total</p></CardContent></Card>
          <Card><CardContent className="pt-6 text-center"><p className="text-3xl font-bold text-yellow-500">{pendingCouriers.length}</p><p className="text-sm text-muted-foreground">Pendentes</p></CardContent></Card>
          <Card><CardContent className="pt-6 text-center"><p className="text-3xl font-bold text-primary">{couriers.filter(c => c.is_active && c.operational_status === 'available').length}</p><p className="text-sm text-muted-foreground">Disponíveis</p></CardContent></Card>
          <Card><CardContent className="pt-6 text-center"><p className="text-3xl font-bold text-accent">{couriers.filter(c => c.operational_status === 'in_delivery').length}</p><p className="text-sm text-muted-foreground">Em Entrega</p></CardContent></Card>
        </div>

        <Tabs defaultValue={pendingCouriers.length > 0 ? 'pending' : 'all'}>
          <TabsList>
            <TabsTrigger value="pending">Pendentes ({pendingCouriers.length})</TabsTrigger>
            <TabsTrigger value="all">Todos ({activeCouriers.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4">
            {pendingCouriers.length === 0 ? (
              <Card><CardContent className="py-8 text-center text-muted-foreground">Nenhum cadastro pendente</CardContent></Card>
            ) : (
              pendingCouriers.map(c => (
                <Card key={c.id} className="border-l-4 border-l-yellow-500">
                  <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row gap-4">
                      <div className="flex gap-3 flex-1">
                        {c.selfie_url && <img src={c.selfie_url} alt="Foto" className="w-20 h-20 rounded-lg object-cover" />}
                        <div className="space-y-1">
                          <p className="font-bold text-lg">{c.name}</p>
                          <p className="text-sm text-muted-foreground">{c.phone}</p>
                          <p className="text-sm">CPF: {c.cpf || '—'} | CNPJ: {c.cnpj || '—'}</p>
                          <p className="text-sm">{vehicleLabels[c.vehicle_type] || c.vehicle_type} {c.vehicle_plate ? `• ${c.vehicle_plate}` : ''}</p>
                          <p className="text-sm text-muted-foreground">{c.address_city}{c.address_state ? `, ${c.address_state}` : ''}</p>
                          <p className="text-xs text-muted-foreground">PIX: {c.pix_key_type} — {c.pix_key}</p>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2 items-end">
                        {c.vehicle_photo_url && <img src={c.vehicle_photo_url} alt="Veículo" className="w-24 h-16 rounded object-cover" />}
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => { setSelected(c); setDetailOpen(true); }}><Eye className="h-4 w-4 mr-1" />Ver</Button>
                          <Button size="sm" variant="destructive" onClick={() => reject(c.id)}><XCircle className="h-4 w-4 mr-1" />Recusar</Button>
                          <Button size="sm" onClick={() => approve(c.id)}><CheckCircle2 className="h-4 w-4 mr-1" />Aprovar</Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="all">
            <Card>
              <CardContent className="p-0 overflow-x-auto">
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
                    {activeCouriers.map(c => {
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
                            <Button variant="ghost" size="icon" onClick={() => { setSelected(c); setDetailOpen(true); }}><Eye className="h-4 w-4" /></Button>
                            <Button variant="ghost" size="icon" onClick={() => openEdit(c)}><Pencil className="h-4 w-4" /></Button>
                            <Button variant="ghost" size="icon" onClick={() => remove(c.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                    {activeCouriers.length === 0 && (
                      <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">Nenhum freteiro</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Detail Dialog */}
        <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>Detalhes do Freteiro</DialogTitle></DialogHeader>
            {selected && (
              <div className="space-y-4">
                <div className="flex gap-4">
                  {selected.selfie_url && <img src={selected.selfie_url} alt="Selfie" className="w-24 h-24 rounded-lg object-cover" />}
                  {selected.vehicle_photo_url && <img src={selected.vehicle_photo_url} alt="Veículo" className="w-32 h-24 rounded-lg object-cover" />}
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div><span className="text-muted-foreground">Nome:</span> <strong>{selected.name}</strong></div>
                  <div><span className="text-muted-foreground">CPF:</span> {selected.cpf || '—'}</div>
                  <div><span className="text-muted-foreground">CNPJ:</span> {selected.cnpj || '—'}</div>
                  <div><span className="text-muted-foreground">Telefone:</span> {selected.phone}</div>
                  <div><span className="text-muted-foreground">Veículo:</span> {vehicleLabels[selected.vehicle_type] || selected.vehicle_type}</div>
                  <div><span className="text-muted-foreground">Placa:</span> {selected.vehicle_plate || '—'}</div>
                  <div className="col-span-2"><span className="text-muted-foreground">Endereço:</span> {selected.address_street} {selected.address_number}, {selected.address_neighborhood}, {selected.address_city}/{selected.address_state} - {selected.address_zip}</div>
                  <div><span className="text-muted-foreground">PIX Tipo:</span> {selected.pix_key_type || '—'}</div>
                  <div><span className="text-muted-foreground">PIX Chave:</span> {selected.pix_key || '—'}</div>
                  <div><span className="text-muted-foreground">Bairros:</span> {(selected.neighborhoods || []).join(', ') || '—'}</div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <a href={`https://wa.me/55${(selected.phone || '').replace(/\D/g, '')}`} target="_blank" rel="noreferrer">
                      <Phone className="h-4 w-4 mr-1" /> WhatsApp
                    </a>
                  </Button>
                  {selected.registration_status === 'pending' && (
                    <>
                      <Button size="sm" variant="destructive" onClick={() => { reject(selected.id); setDetailOpen(false); }}>Recusar</Button>
                      <Button size="sm" onClick={() => { approve(selected.id); setDetailOpen(false); }}>Aprovar</Button>
                    </>
                  )}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Create/Edit Dialog */}
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent>
            <DialogHeader><DialogTitle>{editId ? 'Editar Freteiro' : 'Novo Freteiro'}</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div><Label>Nome *</Label><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
              <div><Label>Telefone *</Label><Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="(00) 00000-0000" /></div>
              <div><Label>Cidade</Label><Input value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} /></div>
              <div><Label>Bairros atendidos</Label><Input value={form.neighborhoods} onChange={e => setForm(f => ({ ...f, neighborhoods: e.target.value }))} placeholder="Centro, Jardins" /></div>
              <div>
                <Label>Tipo de Veículo</Label>
                <Select value={form.vehicle_type} onValueChange={v => setForm(f => ({ ...f, vehicle_type: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="moto">🏍️ Moto</SelectItem>
                    <SelectItem value="carro">🚗 Carro</SelectItem>
                    <SelectItem value="van">🚐 Van</SelectItem>
                    <SelectItem value="bicicleta">🚲 Bicicleta</SelectItem>
                    <SelectItem value="caminhao">🚛 Caminhão</SelectItem>
                    <SelectItem value="moto_eletrica">⚡ Moto Elétrica</SelectItem>
                    <SelectItem value="patinete_eletrico">🛴 Patinete</SelectItem>
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
