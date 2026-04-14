import { useState, useEffect } from 'react';
import { Plus, Trash2, MapPin, Truck } from 'lucide-react';
import SellerLayout from '@/components/seller/SellerLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

interface DeliveryZone {
  id: string;
  neighborhood: string;
  city: string;
  state: string;
  price: number;
  is_active: boolean;
}

const SellerDelivery = () => {
  const { user } = useAuth();
  const [zones, setZones] = useState<DeliveryZone[]>([]);
  const [loading, setLoading] = useState(true);
  const [storeId, setStoreId] = useState<string | null>(null);

  const [newZone, setNewZone] = useState({ neighborhood: '', city: '', state: '', price: '' });

  useEffect(() => {
    if (!user) return;
    const fetchStore = async () => {
      const { data } = await supabase.from('stores').select('id').eq('owner_id', user.id).maybeSingle();
      if (data) {
        setStoreId(data.id);
        fetchZones(data.id);
      } else {
        setLoading(false);
      }
    };
    fetchStore();
  }, [user]);

  const fetchZones = async (sid: string) => {
    setLoading(true);
    const { data } = await supabase.from('delivery_zones').select('*').eq('store_id', sid).order('city').order('neighborhood');
    setZones((data as DeliveryZone[]) || []);
    setLoading(false);
  };

  const addZone = async () => {
    if (!storeId) { toast.error('Loja não encontrada'); return; }
    if (!newZone.city || !newZone.price) { toast.error('Preencha cidade e valor'); return; }
    const { error } = await supabase.from('delivery_zones').insert({
      store_id: storeId,
      neighborhood: newZone.neighborhood,
      city: newZone.city,
      state: newZone.state,
      price: parseFloat(newZone.price),
    });
    if (error) { toast.error('Erro ao adicionar zona'); return; }
    toast.success('Zona de entrega adicionada!');
    setNewZone({ neighborhood: '', city: '', state: '', price: '' });
    fetchZones(storeId);
  };

  const deleteZone = async (id: string) => {
    if (!storeId) return;
    await supabase.from('delivery_zones').delete().eq('id', id);
    toast.success('Zona removida');
    fetchZones(storeId);
  };

  const toggleZone = async (id: string, active: boolean) => {
    if (!storeId) return;
    await supabase.from('delivery_zones').update({ is_active: active }).eq('id', id);
    fetchZones(storeId);
  };

  const grouped = zones.reduce<Record<string, DeliveryZone[]>>((acc, z) => {
    const key = `${z.city}${z.state ? ` - ${z.state}` : ''}`;
    (acc[key] = acc[key] || []).push(z);
    return acc;
  }, {});

  return (
    <SellerLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Truck className="h-6 w-6" /> Entregas & Frete</h1>
          <p className="text-sm text-muted-foreground">Cadastre os bairros e cidades onde sua loja faz entregas e defina os valores de frete.</p>
        </div>

        {/* Add zone form */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2"><Plus className="h-4 w-4" /> Adicionar Zona de Entrega</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              <div>
                <Label>Bairro</Label>
                <Input placeholder="Ex: Centro" value={newZone.neighborhood} onChange={e => setNewZone(n => ({ ...n, neighborhood: e.target.value }))} />
              </div>
              <div>
                <Label>Cidade *</Label>
                <Input placeholder="Ex: São Paulo" value={newZone.city} onChange={e => setNewZone(n => ({ ...n, city: e.target.value }))} />
              </div>
              <div>
                <Label>Estado</Label>
                <Input placeholder="Ex: SP" maxLength={2} value={newZone.state} onChange={e => setNewZone(n => ({ ...n, state: e.target.value.toUpperCase() }))} />
              </div>
              <div>
                <Label>Valor do Frete (R$) *</Label>
                <Input type="number" step="0.01" min="0" placeholder="0,00" value={newZone.price} onChange={e => setNewZone(n => ({ ...n, price: e.target.value }))} />
              </div>
              <div className="flex items-end">
                <Button className="w-full rounded-full gap-2" onClick={addZone}><Plus className="h-4 w-4" /> Adicionar</Button>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">Deixe o campo "Bairro" vazio para definir um valor padrão para toda a cidade.</p>
          </CardContent>
        </Card>

        {/* Zones list */}
        {loading ? (
          <div className="text-center py-12 text-muted-foreground">Carregando...</div>
        ) : zones.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <MapPin className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
              <p className="text-muted-foreground">Nenhuma zona de entrega cadastrada.</p>
              <p className="text-xs text-muted-foreground mt-1">Adicione bairros e cidades para definir seus valores de frete.</p>
            </CardContent>
          </Card>
        ) : (
          Object.entries(grouped).map(([cityKey, cityZones]) => (
            <Card key={cityKey}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary" /> {cityKey}
                  <Badge variant="secondary" className="ml-auto">{cityZones.length} zona(s)</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="divide-y">
                  {cityZones.map(z => (
                    <div key={z.id} className="flex items-center gap-4 py-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{z.neighborhood || 'Toda a cidade'}</p>
                        <p className="text-xs text-muted-foreground">{z.city}{z.state ? ` - ${z.state}` : ''}</p>
                      </div>
                      <p className="text-sm font-bold text-primary">{fmt(z.price)}</p>
                      <Switch checked={z.is_active} onCheckedChange={v => toggleZone(z.id, v)} />
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => deleteZone(z.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </SellerLayout>
  );
};

export default SellerDelivery;
