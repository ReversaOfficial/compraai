import { useState, useEffect } from 'react';
import CourierLayout from '@/components/courier/CourierLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Upload } from 'lucide-react';

const vehicleTypes = [
  { value: 'bicicleta', label: '🚲 Bicicleta' },
  { value: 'moto', label: '🏍️ Moto' },
  { value: 'moto_eletrica', label: '⚡ Moto Elétrica' },
  { value: 'carro', label: '🚗 Carro' },
  { value: 'van', label: '🚐 Van' },
  { value: 'caminhao', label: '🚛 Caminhão' },
  { value: 'patinete_eletrico', label: '🛴 Patinete Elétrico' },
];

const pixTypes = [
  { value: 'cpf', label: 'CPF' },
  { value: 'cnpj', label: 'CNPJ' },
  { value: 'email', label: 'E-mail' },
  { value: 'telefone', label: 'Telefone' },
  { value: 'aleatoria', label: 'Chave Aleatória' },
];

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

  const uploadPhoto = async (file: File, type: string) => {
    if (!courier) return;
    const check = validateUploadFile(file, { maxSize: 5 * 1024 * 1024 });
    if (!check.ok) { toast.error(check.error!); return; }
    const safeName = sanitizeFilename(file.name);
    const ext = (safeName.split('.').pop() || 'jpg').toLowerCase();
    const path = `${courier.user_id}/${type}_${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from('courier-documents').upload(path, file);
    if (error) { toast.error('Erro no upload'); return; }
    const { data } = supabase.storage.from('courier-documents').getPublicUrl(path);
    const field = type === 'selfie' ? 'selfie_url' : 'vehicle_photo_url';
    setCourier({ ...courier, [field]: data.publicUrl });
  };

  const save = async () => {
    if (!courier) return;
    setSaving(true);
    const { error } = await supabase.from('couriers').update({
      name: courier.name, phone: courier.phone, city: courier.city,
      cpf: courier.cpf, cnpj: courier.cnpj,
      vehicle_type: courier.vehicle_type, vehicle_plate: courier.vehicle_plate,
      address_street: courier.address_street, address_number: courier.address_number,
      address_neighborhood: courier.address_neighborhood, address_city: courier.address_city,
      address_state: courier.address_state, address_zip: courier.address_zip,
      pix_key: courier.pix_key, pix_key_type: courier.pix_key_type,
      selfie_url: courier.selfie_url, vehicle_photo_url: courier.vehicle_photo_url,
      operational_status: courier.operational_status,
    } as any).eq('id', courier.id);
    if (error) toast.error('Erro ao salvar');
    else toast.success('Perfil atualizado!');
    setSaving(false);
  };

  if (!courier) return <CourierLayout><p className="text-center py-12 text-muted-foreground">Carregando...</p></CourierLayout>;

  const set = (field: string, value: string) => setCourier({ ...courier, [field]: value });

  return (
    <CourierLayout>
      <div className="space-y-6 max-w-2xl">
        <div>
          <h1 className="text-2xl font-bold">Meu Perfil</h1>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant={courier.is_active ? 'default' : 'destructive'}>{courier.is_active ? 'Ativo' : 'Inativo'}</Badge>
            <Badge variant="outline">{courier.registration_status === 'approved' ? '✓ Aprovado' : courier.registration_status === 'pending' ? '⏳ Pendente' : '✕ Recusado'}</Badge>
          </div>
        </div>

        <Card>
          <CardHeader><CardTitle className="text-lg">Dados Pessoais</CardTitle></CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2"><Label>Nome</Label><Input value={courier.name} onChange={e => set('name', e.target.value)} /></div>
            <div><Label>CPF</Label><Input value={courier.cpf || ''} onChange={e => set('cpf', e.target.value)} /></div>
            <div><Label>CNPJ</Label><Input value={courier.cnpj || ''} onChange={e => set('cnpj', e.target.value)} /></div>
            <div><Label>Telefone</Label><Input value={courier.phone} onChange={e => set('phone', e.target.value)} /></div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-lg">Endereço</CardTitle></CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2"><Label>Rua</Label><Input value={courier.address_street || ''} onChange={e => set('address_street', e.target.value)} /></div>
            <div><Label>Número</Label><Input value={courier.address_number || ''} onChange={e => set('address_number', e.target.value)} /></div>
            <div><Label>Bairro</Label><Input value={courier.address_neighborhood || ''} onChange={e => set('address_neighborhood', e.target.value)} /></div>
            <div><Label>Cidade</Label><Input value={courier.address_city || ''} onChange={e => set('address_city', e.target.value)} /></div>
            <div><Label>Estado</Label><Input value={courier.address_state || ''} onChange={e => set('address_state', e.target.value)} /></div>
            <div><Label>CEP</Label><Input value={courier.address_zip || ''} onChange={e => set('address_zip', e.target.value)} /></div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-lg">Veículo</CardTitle></CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Tipo</Label>
              <Select value={courier.vehicle_type} onValueChange={v => set('vehicle_type', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{vehicleTypes.map(v => <SelectItem key={v.value} value={v.value}>{v.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Placa</Label><Input value={courier.vehicle_plate || ''} onChange={e => set('vehicle_plate', e.target.value)} /></div>
            <div>
              <Label>Status Operacional</Label>
              <Select value={courier.operational_status} onValueChange={v => set('operational_status', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="available">Disponível</SelectItem>
                  <SelectItem value="in_delivery">Em Entrega</SelectItem>
                  <SelectItem value="offline">Offline</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-lg">Fotos</CardTitle></CardHeader>
          <CardContent className="grid gap-6 sm:grid-cols-2">
            <div>
              <Label>Foto de Rosto</Label>
              {courier.selfie_url && <img src={courier.selfie_url} alt="Selfie" className="h-32 w-32 object-cover rounded-lg mt-2 mb-2" />}
              <label className="flex items-center gap-2 text-sm text-primary cursor-pointer"><Upload className="h-4 w-4" /> Trocar foto
                <input type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && uploadPhoto(e.target.files[0], 'selfie')} />
              </label>
            </div>
            <div>
              <Label>Foto do Veículo</Label>
              {courier.vehicle_photo_url && <img src={courier.vehicle_photo_url} alt="Veículo" className="h-32 w-32 object-cover rounded-lg mt-2 mb-2" />}
              <label className="flex items-center gap-2 text-sm text-primary cursor-pointer"><Upload className="h-4 w-4" /> Trocar foto
                <input type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && uploadPhoto(e.target.files[0], 'vehicle')} />
              </label>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-lg">Dados para Pagamento (PIX)</CardTitle></CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Tipo de Chave</Label>
              <Select value={courier.pix_key_type || ''} onValueChange={v => set('pix_key_type', v)}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>{pixTypes.map(p => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Chave PIX</Label><Input value={courier.pix_key || ''} onChange={e => set('pix_key', e.target.value)} /></div>
          </CardContent>
        </Card>

        <Button onClick={save} disabled={saving} className="w-full">{saving ? 'Salvando...' : 'Salvar Alterações'}</Button>
      </div>
    </CourierLayout>
  );
};

export default CourierProfile;
