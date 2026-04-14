import { useState, useEffect } from 'react';
import CourierLayout from '@/components/courier/CourierLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { MapPin, Package, DollarSign, Clock } from 'lucide-react';

const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const CourierAvailable = () => {
  const [deliveries, setDeliveries] = useState<any[]>([]);
  const [courierId, setCourierId] = useState<string | null>(null);
  const [accepting, setAccepting] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: courier } = await supabase.from('couriers').select('id').eq('user_id', user.id).maybeSingle();
      if (courier) {
        setCourierId(courier.id);
        loadAvailable();
      }
    })();
  }, []);

  const loadAvailable = async () => {
    const { data } = await supabase.from('delivery_orders').select('*').eq('status', 'waiting').order('created_at', { ascending: false });
    setDeliveries(data || []);
  };

  const acceptDelivery = async (id: string) => {
    if (!courierId) return;
    setAccepting(id);
    const { error } = await supabase.from('delivery_orders').update({
      courier_id: courierId,
      status: 'accepted',
      accepted_at: new Date().toISOString(),
    }).eq('id', id).eq('status', 'waiting');

    if (error) {
      toast.error('Não foi possível aceitar. Talvez outro freteiro já aceitou.');
    } else {
      toast.success('Entrega aceita! Vá buscar o pedido.');
      // Update courier status
      await supabase.from('couriers').update({ operational_status: 'in_delivery' }).eq('id', courierId);
    }
    setAccepting(null);
    loadAvailable();
  };

  return (
    <CourierLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Entregas Disponíveis</h1>
          <p className="text-sm text-muted-foreground">Aceite entregas na sua região</p>
        </div>

        {deliveries.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Package className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-lg font-medium">Nenhuma entrega disponível</p>
              <p className="text-sm text-muted-foreground">Novas entregas aparecerão aqui automaticamente</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {deliveries.map(d => (
              <Card key={d.id} className="border-l-4 border-l-primary">
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline"><Clock className="h-3 w-3 mr-1" />Aguardando</Badge>
                        <span className="text-xs text-muted-foreground">{new Date(d.created_at).toLocaleString('pt-BR')}</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                        <div>
                          <p className="text-xs text-muted-foreground">Coleta</p>
                          <p className="text-sm font-medium">{d.pickup_address || 'Endereço da loja'}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                        <div>
                          <p className="text-xs text-muted-foreground">Entrega</p>
                          <p className="text-sm font-medium">{d.delivery_address || `${d.neighborhood}, ${d.city}`}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-5 w-5 text-green-600" />
                        <span className="text-2xl font-bold text-green-600">{fmt(d.courier_net_amount)}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">Você recebe</p>
                      <Button onClick={() => acceptDelivery(d.id)} disabled={accepting === d.id} className="w-full sm:w-auto">
                        {accepting === d.id ? 'Aceitando...' : 'Aceitar Entrega'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </CourierLayout>
  );
};

export default CourierAvailable;
