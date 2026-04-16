import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Truck, Upload, User, Camera, CreditCard, MapPin } from 'lucide-react';
import MarketplaceLayout from '@/components/marketplace/MarketplaceLayout';
import { ACCEPT_IMAGE, validateUploadFile, sanitizeFilename, sanitizeText } from '@/lib/security';

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

const CourierSignup = () => {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [selfieFile, setSelfieFile] = useState<File | null>(null);
  const [selfiePreview, setSelfiePreview] = useState('');
  const [vehicleFile, setVehicleFile] = useState<File | null>(null);
  const [vehiclePreview, setVehiclePreview] = useState('');

  const [form, setForm] = useState({
    name: '', cpf: '', cnpj: '', phone: '',
    address_street: '', address_number: '', address_neighborhood: '',
    address_city: '', address_state: '', address_zip: '',
    vehicle_type: '', vehicle_plate: '',
    pix_key: '', pix_key_type: '',
    neighborhoods: '',
  });

  const set = (field: string, value: string) => setForm(prev => ({ ...prev, [field]: value }));

  const handleFileSelect = (file: File | null, type: 'selfie' | 'vehicle') => {
    if (!file) return;
    const check = validateUploadFile(file, { maxSize: 5 * 1024 * 1024 });
    if (!check.ok) { toast.error(check.error!); return; }
    const url = URL.createObjectURL(file);
    if (type === 'selfie') { setSelfieFile(file); setSelfiePreview(url); }
    else { setVehicleFile(file); setVehiclePreview(url); }
  };

  const uploadFile = async (file: File, userId: string, type: string) => {
    const safeName = sanitizeFilename(file.name);
    const ext = (safeName.split('.').pop() || 'jpg').toLowerCase();
    const path = `${userId}/${type}_${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from('courier-documents').upload(path, file);
    if (error) throw error;
    const { data } = supabase.storage.from('courier-documents').getPublicUrl(path);
    return data.publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.cpf || !form.phone || !form.vehicle_type || !form.pix_key || !form.pix_key_type) {
      toast.error('Preencha todos os campos obrigatórios'); return;
    }
    if (!selfieFile) { toast.error('Envie uma foto de rosto'); return; }
    if (!vehicleFile) { toast.error('Envie uma foto do veículo'); return; }

    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { toast.error('Faça login primeiro'); setSaving(false); return; }

      // Check if already registered
      const { data: existing } = await supabase.from('couriers').select('id').eq('user_id', user.id).maybeSingle();
      if (existing) { toast.error('Você já está cadastrado como freteiro'); setSaving(false); return; }

      // Upload photos
      const selfieUrl = await uploadFile(selfieFile, user.id, 'selfie');
      const vehicleUrl = await uploadFile(vehicleFile, user.id, 'vehicle');

      // Create courier record
      const neighborhoodsList = form.neighborhoods.split(',').map(n => n.trim()).filter(Boolean);

      const { error } = await supabase.from('couriers').insert({
        user_id: user.id,
        name: form.name,
        cpf: form.cpf,
        cnpj: form.cnpj || null,
        phone: form.phone,
        address_street: form.address_street,
        address_number: form.address_number,
        address_neighborhood: form.address_neighborhood,
        address_city: form.address_city,
        address_state: form.address_state,
        address_zip: form.address_zip,
        city: form.address_city,
        vehicle_type: form.vehicle_type,
        vehicle_plate: form.vehicle_plate || null,
        selfie_url: selfieUrl,
        vehicle_photo_url: vehicleUrl,
        pix_key: form.pix_key,
        pix_key_type: form.pix_key_type,
        neighborhoods: neighborhoodsList,
        registration_status: 'pending',
        is_active: false,
      } as any);

      if (error) throw error;

      toast.success('Cadastro enviado! Aguarde a aprovação do administrador.');
      navigate('/freteiro');
    } catch (err: any) {
      toast.error('Erro ao cadastrar: ' + (err.message || 'Tente novamente'));
    }
    setSaving(false);
  };

  return (
    <MarketplaceLayout>
      <div className="max-w-2xl mx-auto py-8 px-4">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <Truck className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold">Seja um Freteiro</h1>
          <p className="text-muted-foreground mt-2">Cadastre-se e comece a fazer entregas na sua cidade</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2"><User className="h-5 w-5" /> Dados Pessoais</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2"><Label>Nome Completo *</Label><Input value={form.name} onChange={e => set('name', e.target.value)} placeholder="Seu nome completo" required /></div>
              <div><Label>CPF *</Label><Input value={form.cpf} onChange={e => set('cpf', e.target.value)} placeholder="000.000.000-00" required /></div>
              <div><Label>CNPJ (opcional)</Label><Input value={form.cnpj} onChange={e => set('cnpj', e.target.value)} placeholder="00.000.000/0000-00" /></div>
              <div><Label>Telefone / WhatsApp *</Label><Input value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="(00) 00000-0000" required /></div>
            </CardContent>
          </Card>

          {/* Address */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2"><MapPin className="h-5 w-5" /> Endereço</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2"><Label>Rua</Label><Input value={form.address_street} onChange={e => set('address_street', e.target.value)} placeholder="Rua / Avenida" /></div>
              <div><Label>Número</Label><Input value={form.address_number} onChange={e => set('address_number', e.target.value)} placeholder="123" /></div>
              <div><Label>Bairro</Label><Input value={form.address_neighborhood} onChange={e => set('address_neighborhood', e.target.value)} placeholder="Bairro" /></div>
              <div><Label>Cidade</Label><Input value={form.address_city} onChange={e => set('address_city', e.target.value)} placeholder="Cidade" /></div>
              <div><Label>Estado</Label><Input value={form.address_state} onChange={e => set('address_state', e.target.value)} placeholder="UF" /></div>
              <div><Label>CEP</Label><Input value={form.address_zip} onChange={e => set('address_zip', e.target.value)} placeholder="00000-000" /></div>
            </CardContent>
          </Card>

          {/* Vehicle */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2"><Truck className="h-5 w-5" /> Veículo</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Label>Tipo de Veículo *</Label>
                <Select value={form.vehicle_type} onValueChange={v => set('vehicle_type', v)}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    {vehicleTypes.map(v => <SelectItem key={v.value} value={v.value}>{v.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="sm:col-span-2"><Label>Placa (se tiver)</Label><Input value={form.vehicle_plate} onChange={e => set('vehicle_plate', e.target.value)} placeholder="ABC-1234" /></div>
              <div className="sm:col-span-2">
                <Label>Bairros que atende (separados por vírgula)</Label>
                <Input value={form.neighborhoods} onChange={e => set('neighborhoods', e.target.value)} placeholder="Centro, Jardim América, Vila Nova" />
              </div>
            </CardContent>
          </Card>

          {/* Photos */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2"><Camera className="h-5 w-5" /> Fotos</CardTitle>
              <CardDescription>Envie fotos nítidas e sem filtros</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6 sm:grid-cols-2">
              <div>
                <Label>Foto de Rosto (sem óculos) *</Label>
                <label className="mt-2 flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-4 cursor-pointer hover:border-primary transition-colors h-48">
                  {selfiePreview ? (
                    <img src={selfiePreview} alt="Selfie" className="h-full w-full object-cover rounded" />
                  ) : (
                    <>
                      <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                      <span className="text-sm text-muted-foreground">Clique para enviar</span>
                    </>
                  )}
                  <input type="file" accept={ACCEPT_IMAGE} className="hidden" onChange={e => handleFileSelect(e.target.files?.[0] || null, 'selfie')} />
                </label>
              </div>
              <div>
                <Label>Foto do Veículo *</Label>
                <label className="mt-2 flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-4 cursor-pointer hover:border-primary transition-colors h-48">
                  {vehiclePreview ? (
                    <img src={vehiclePreview} alt="Veículo" className="h-full w-full object-cover rounded" />
                  ) : (
                    <>
                      <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                      <span className="text-sm text-muted-foreground">Clique para enviar</span>
                    </>
                  )}
                  <input type="file" accept={ACCEPT_IMAGE} className="hidden" onChange={e => handleFileSelect(e.target.files?.[0] || null, 'vehicle')} />
                </label>
              </div>
            </CardContent>
          </Card>

          {/* PIX */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2"><CreditCard className="h-5 w-5" /> Dados para Pagamento</CardTitle>
              <CardDescription>Cadastre sua chave PIX para receber os pagamentos</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>Tipo de Chave PIX *</Label>
                <Select value={form.pix_key_type} onValueChange={v => set('pix_key_type', v)}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    {pixTypes.map(p => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Chave PIX *</Label><Input value={form.pix_key} onChange={e => set('pix_key', e.target.value)} placeholder="Sua chave PIX" required /></div>
            </CardContent>
          </Card>

          <Button type="submit" disabled={saving} className="w-full h-12 text-lg">
            {saving ? 'Enviando cadastro...' : '🚚 Cadastrar como Freteiro'}
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            Ao se cadastrar, você concorda com os termos de uso da plataforma. Seu cadastro será analisado e aprovado pelo administrador.
          </p>
        </form>
      </div>
    </MarketplaceLayout>
  );
};

export default CourierSignup;
