import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SellerLayout from '@/components/seller/SellerLayout';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth, SellerProfile } from '@/contexts/AuthContext';
import { categories } from '@/data/mock';
import { toast } from 'sonner';

const SellerSettings = () => {
  const { user, updateProfile, isSeller, loading } = useAuth();
  const navigate = useNavigate();
  const profile = user as SellerProfile | null;

  const [form, setForm] = useState({
    store_name: '',
    cnpj: '',
    description: '',
    phone: '',
    whatsapp: '',
    category: '',
    address_street: '',
    address_number: '',
    address_complement: '',
    address_neighborhood: '',
    address_city: '',
    address_state: '',
    address_zip: '',
    delivery_time: '',
    hours: '',
    social_instagram: '',
  });

  useEffect(() => {
    if (!loading && !user) navigate('/login');
    if (!loading && user && user.role !== 'seller') navigate('/conta');
  }, [loading, user]);

  useEffect(() => {
    if (profile) {
      setForm({
        store_name: profile.store_name || '',
        cnpj: profile.cnpj || '',
        description: profile.description || '',
        phone: profile.phone || '',
        whatsapp: profile.whatsapp || '',
        category: profile.category || '',
        address_street: profile.address_street || '',
        address_number: profile.address_number || '',
        address_complement: profile.address_complement || '',
        address_neighborhood: profile.address_neighborhood || '',
        address_city: profile.address_city || '',
        address_state: profile.address_state || '',
        address_zip: profile.address_zip || '',
        delivery_time: profile.delivery_time || '',
        hours: profile.hours || '',
        social_instagram: profile.social_instagram || '',
      });
    }
  }, [profile]);

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSave = () => {
    updateProfile(form);
  };

  if (loading || !isSeller) return null;

  return (
    <SellerLayout>
      <div className="space-y-6 max-w-2xl">
        <h1 className="text-2xl font-bold">Configurações da Loja</h1>

        <Card className="shadow-card">
          <CardHeader><CardTitle className="text-base">Informações da Empresa</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nome da Loja *</Label>
                <Input value={form.store_name} onChange={set('store_name')} />
              </div>
              <div className="space-y-2">
                <Label>CNPJ *</Label>
                <Input value={form.cnpj} onChange={set('cnpj')} placeholder="00.000.000/0000-00" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Descrição da Loja</Label>
              <Textarea value={form.description} onChange={set('description')} placeholder="Descreva o que sua loja oferece..." />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Categoria</Label>
                <Select value={form.category} onValueChange={(v) => setForm(f => ({ ...f, category: v }))}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    {categories.map(c => (
                      <SelectItem key={c.id} value={c.name}>{c.icon} {c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Instagram</Label>
                <Input value={form.social_instagram} onChange={set('social_instagram')} placeholder="@sualoja" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader><CardTitle className="text-base">Contato</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Telefone</Label>
                <Input value={form.phone} onChange={set('phone')} placeholder="(11) 99999-0000" />
              </div>
              <div className="space-y-2">
                <Label>WhatsApp</Label>
                <Input value={form.whatsapp} onChange={set('whatsapp')} placeholder="(11) 99999-0000" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>E-mail</Label>
              <Input value={user?.email || ''} disabled className="bg-muted" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader><CardTitle className="text-base">Endereço da Loja</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2 space-y-2">
                <Label>Rua</Label>
                <Input value={form.address_street} onChange={set('address_street')} />
              </div>
              <div className="space-y-2">
                <Label>Número</Label>
                <Input value={form.address_number} onChange={set('address_number')} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Complemento</Label>
                <Input value={form.address_complement} onChange={set('address_complement')} />
              </div>
              <div className="space-y-2">
                <Label>Bairro</Label>
                <Input value={form.address_neighborhood} onChange={set('address_neighborhood')} />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>CEP</Label>
                <Input value={form.address_zip} onChange={set('address_zip')} placeholder="00000-000" />
              </div>
              <div className="space-y-2">
                <Label>Cidade</Label>
                <Input value={form.address_city} onChange={set('address_city')} />
              </div>
              <div className="space-y-2">
                <Label>Estado</Label>
                <Input value={form.address_state} onChange={set('address_state')} placeholder="SP" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader><CardTitle className="text-base">Entrega</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Prazo Estimado de Entrega</Label>
                <Input value={form.delivery_time} onChange={set('delivery_time')} placeholder="2-3 dias úteis" />
              </div>
              <div className="space-y-2">
                <Label>Horário de Atendimento</Label>
                <Input value={form.hours} onChange={set('hours')} placeholder="Seg a Sex, 9h - 18h" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Button className="rounded-full" onClick={handleSave}>Salvar Alterações</Button>
      </div>
    </SellerLayout>
  );
};

export default SellerSettings;
