import { useState, useEffect } from 'react';
import CourierLayout from '@/components/courier/CourierLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const CourierProfile = () => {
  const [courier, setCourier] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from('couriers').select('*').eq('user_id', user.id).maybeSingle();
      if (data) setCourier(data);
    })();
  }, []);

  const save = async () => {
    if (!courier) return;
    setSaving(true);
    await supabase.from('couriers').update({
      name: courier.name,
      phone: courier.phone,
      city: courier.city,
      vehicle_type: courier.vehicle_type,
      operational_status: courier.operational_status,
    }).eq('id', courier.id);
    toast.success('Perfil atualizado!');
    setSaving(false);
  };

  if (!courier) return <CourierLayout><p className="text-center py-12 text-muted-foreground">Carregando...</p></CourierLayout>;

  return (
    <CourierLayout>
      <div className="space-y-6 max-w-lg">
        <div>
          <h1 className="text-2xl font-bold">Meu Perfil</h1>
          <p className="text-sm text-muted-foreground">Atualize suas informações</p>
        </div>

        <Card>
          <CardHeader><CardTitle className="text-lg">Dados Pessoais</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div><Label>Nome</Label><Input value={courier.name} onChange={e => setCourier({ ...courier, name: e.target.value })} /></div>
            <div><Label>Telefone</Label><Input value={courier.phone} onChange={e => setCourier({ ...courier, phone: e.target.value })} /></div>
            <div><Label>Cidade</Label><Input value={courier.city} onChange={e => setCourier({ ...courier, city: e.target.value })} /></div>
            <div>
              <Label>Veículo</Label>
              <Select value={courier.vehicle_type} onValueChange={v => setCourier({ ...courier, vehicle_type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="moto">Moto</SelectItem>
                  <SelectItem value="carro">Carro</SelectItem>
                  <SelectItem value="bicicleta">Bicicleta</SelectItem>
                  <SelectItem value="van">Van</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Status Operacional</Label>
              <Select value={courier.operational_status} onValueChange={v => setCourier({ ...courier, operational_status: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="available">Disponível</SelectItem>
                  <SelectItem value="in_delivery">Em Entrega</SelectItem>
                  <SelectItem value="offline">Offline</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm">Status da conta:</span>
              <Badge variant={courier.is_active ? 'default' : 'destructive'}>{courier.is_active ? 'Ativo' : 'Inativo'}</Badge>
            </div>
            <Button onClick={save} disabled={saving} className="w-full">{saving ? 'Salvando...' : 'Salvar Alterações'}</Button>
          </CardContent>
        </Card>
      </div>
    </CourierLayout>
  );
};

export default CourierProfile;
